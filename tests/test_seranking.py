import unittest
from unittest.mock import patch, MagicMock
import os
import shutil
import tempfile
import json
from api.seranking import SERankingClient

class TestSERankingClient(unittest.TestCase):
    def setUp(self):
        # Set up a temporary directory for cache testing
        self.test_dir = tempfile.mkdtemp()
        self.api_key = "test_api_key_12345"
        self.client = SERankingClient(api_key=self.api_key, cache_dir=self.test_dir)

    def tearDown(self):
        # Clean up temporary directory
        shutil.rmtree(self.test_dir)

    def test_domain_validation_valid(self):
        # Valid domain inputs
        self.assertEqual(self.client.validate_domain("example.com"), "example.com")
        self.assertEqual(self.client.validate_domain("www.example.com"), "example.com")
        self.assertEqual(self.client.validate_domain("https://example.com/some/path?query=1"), "example.com")
        self.assertEqual(self.client.validate_domain("  http://www.sub.example.com/  "), "sub.example.com")

    def test_domain_validation_invalid(self):
        # Invalid domain inputs
        with self.assertRaises(ValueError):
            self.client.validate_domain("")
        with self.assertRaises(ValueError):
            self.client.validate_domain("not_a_domain")

    @patch("requests.post")
    def test_caching_mechanism(self, mock_post):
        # Configure mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"status": "success", "domain": "example.com", "organic_traffic": 1500}
        mock_post.return_value = mock_response

        domain = "example.com"
        endpoint = "/v1/domain/overview/db"

        # First call should hit the mocked post method
        first_call = self.client.get_domain_overview(domain)
        self.assertEqual(first_call["organic_traffic"], 1500)
        self.assertEqual(mock_post.call_count, 1)

        # Second call should hit cache and not invoke requests.post again
        second_call = self.client.get_domain_overview(domain)
        self.assertEqual(second_call["organic_traffic"], 1500)
        self.assertEqual(mock_post.call_count, 1)

    @patch("requests.get")
    def test_retry_on_429(self, mock_get):
        # Setup mock behavior: fail twice with 429, then succeed with 200
        mock_response_429 = MagicMock()
        mock_response_429.status_code = 429

        mock_response_200 = MagicMock()
        mock_response_200.status_code = 200
        mock_response_200.json.return_value = {"limit": 1000}

        mock_get.side_effect = [mock_response_429, mock_response_429, mock_response_200]

        # Call subscription check (which isn't cached) with custom initial delay of 0 to make test fast
        with patch("time.sleep", return_value=None):
            result = self.client.check_account_subscription()
            
        self.assertEqual(result["limit"], 1000)
        self.assertEqual(mock_get.call_count, 3)

if __name__ == "__main__":
    unittest.main()
