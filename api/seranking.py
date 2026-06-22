import os
import json
import time
import logging
import re
from datetime import date
from urllib.parse import urlparse
import requests

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SERankingClient")

class SERankingClient:
    """
    A robust client wrapper for the SE Ranking API.
    Handles authentication, input validation, exponential backoff retries,
    local caching to conserve credits, and endpoints for domain overview, keywords,
    backlinks, competitor analysis, and site audits.
    """
    
    def __init__(self, api_key=None, cache_dir=".cache"):
        """
        Initialize the SERanking client.
        :param api_key: Optional API key. If not provided, loads from SERANKING_API_KEY env variable.
        :param cache_dir: The directory used to store cache files. Defaults to '.cache'.
        """
        # Load API Key
        self.api_key = api_key or os.getenv("SERANKING_API_KEY")
        if not self.api_key:
            raise ValueError(
                "SERanking API key is missing. Please set the SERANKING_API_KEY environment variable "
                "or pass it directly to the client."
            )
        
        self.base_url = "https://api.seranking.com"
        self.headers = {
            "Authorization": f"Token {self.api_key}",
            "Content-Type": "application/json"
        }
        self.cache_dir = cache_dir
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)
            logger.info(f"Created cache directory at {self.cache_dir}")

    def validate_domain(self, domain_input: str) -> str:
        """
        Validates and cleans the requested domain name before sending to the API.
        Extracts the bare netloc (domain.com) and removes protocol, path, query, and www. prefixes.
        
        :param domain_input: The raw domain or URL entered by the user.
        :return: A cleaned domain string.
        :raises ValueError: If the domain format is invalid.
        """
        if not domain_input or not isinstance(domain_input, str):
            raise ValueError("Domain input must be a non-empty string.")
            
        domain = domain_input.strip().lower()
        
        # Ensure a scheme exists so urlparse works properly
        if '//' not in domain and not domain.startswith('http'):
            domain = 'http://' + domain
            
        try:
            parsed = urlparse(domain)
            # Use netloc if present (e.g. from http://domain.com/path), otherwise fallback to path
            netloc = parsed.netloc or parsed.path
            
            # Remove port if specified (e.g. domain.com:80)
            netloc = netloc.split(':')[0]
            
            # Strip 'www.' prefix
            if netloc.startswith('www.'):
                netloc = netloc[4:]
                
            # Basic validation check using a domain name regex
            domain_regex = re.compile(
                r'^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$'
            )
            if not domain_regex.match(netloc):
                raise ValueError(f"Domain '{domain_input}' resolved to '{netloc}', which is not a valid domain format.")
                
            return netloc
        except Exception as e:
            if not isinstance(e, ValueError):
                raise ValueError(f"Failed to parse domain '{domain_input}': {e}")
            raise

    def _get_cache_path(self, domain: str, endpoint_slug: str) -> str:
        """Helper to generate local cache file path based on domain, endpoint, and current date."""
        date_str = date.today().isoformat()
        clean_slug = endpoint_slug.replace('/', '_').strip('_')
        filename = f"{domain}_{clean_slug}_{date_str}.json"
        return os.path.join(self.cache_dir, filename)

    def _read_cache(self, domain: str, endpoint_slug: str):
        """Read cached response if it exists for today."""
        cache_path = self._get_cache_path(domain, endpoint_slug)
        if os.path.exists(cache_path):
            logger.info(f"Cache hit: Using local cache for '{domain}' ({endpoint_slug})")
            try:
                with open(cache_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Error reading cache file {cache_path}: {e}. Fetching fresh data.")
        return None

    def _write_cache(self, domain: str, endpoint_slug: str, data: dict):
        """Write API response data to local cache."""
        cache_path = self._get_cache_path(domain, endpoint_slug)
        try:
            with open(cache_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            logger.info(f"Cached API response to {cache_path}")
        except Exception as e:
            logger.warning(f"Failed to write cache to {cache_path}: {e}")

    def _request_with_backoff(self, method: str, endpoint: str, payload=None, params=None, max_retries=5, initial_delay=1.0) -> dict:
        """
        Sends an HTTP request with exponential backoff for retrying rate limits and temporary server errors.
        """
        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        delay = initial_delay
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Sending {method} request to {url} (Attempt {attempt + 1}/{max_retries})")
                if method.upper() == 'POST':
                    response = requests.post(url, headers=self.headers, json=payload, params=params, timeout=30)
                else:
                    response = requests.get(url, headers=self.headers, params=params, timeout=30)
                
                # Check status codes
                if response.status_code == 429:
                    logger.warning(f"Rate limit hit (429). Retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
                    delay *= 2
                    continue
                elif response.status_code >= 500:
                    logger.warning(f"Server error ({response.status_code}). Retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
                    delay *= 2
                    continue
                
                response.raise_for_status()
                return response.json()
                
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    logger.error(f"Request to {endpoint} failed after {max_retries} attempts.")
                    raise
                logger.warning(f"Network error: {e}. Retrying in {delay:.2f} seconds...")
                time.sleep(delay)
                delay *= 2
                
        raise requests.exceptions.RequestException(f"Failed to fetch data from {endpoint} due to persistent connection/server issues.")

    # --- Endpoints ---

    def check_account_subscription(self) -> dict:
        """
        1. Account Check: GET /v1/account/subscription
        Verifies API credentials and retrieves subscription limits/credits.
        This endpoint is NOT cached, as we want to check real-time availability.
        """
        return self._request_with_backoff("GET", "/v1/account/subscription")

    def get_domain_overview(self, domain: str, source: str = "us", **kwargs) -> dict:
        """
        2. Domain Overview: POST /v1/domain/overview/db
        Fetches domain organic/paid metrics.
        """
        clean_domain = self.validate_domain(domain)
        endpoint = "/v1/domain/overview/db"
        
        cached_data = self._read_cache(clean_domain, endpoint)
        if cached_data:
            return cached_data
            
        payload = {
            "domain": clean_domain,
            "source": source,
            **kwargs
        }
        data = self._request_with_backoff("POST", endpoint, payload=payload)
        self._write_cache(clean_domain, endpoint, data)
        return data

    def get_keyword_rankings(self, domain: str, **kwargs) -> dict:
        """
        3. Keyword Rankings: POST /v1/keywords/overview
        Fetches keyword ranking summary data.
        """
        clean_domain = self.validate_domain(domain)
        endpoint = "/v1/keywords/overview"
        
        cached_data = self._read_cache(clean_domain, endpoint)
        if cached_data:
            return cached_data
            
        payload = {
            "domain": clean_domain,
            **kwargs
        }
        data = self._request_with_backoff("POST", endpoint, payload=payload)
        self._write_cache(clean_domain, endpoint, data)
        return data

    def get_backlink_summary(self, domain: str, **kwargs) -> dict:
        """
        4. Backlink Summary: POST /v1/backlinks/summary
        Fetches backlink count, referring domains, etc.
        """
        clean_domain = self.validate_domain(domain)
        endpoint = "/v1/backlinks/summary"
        
        cached_data = self._read_cache(clean_domain, endpoint)
        if cached_data:
            return cached_data
            
        payload = {
            "domain": clean_domain,
            **kwargs
        }
        data = self._request_with_backoff("POST", endpoint, payload=payload)
        self._write_cache(clean_domain, endpoint, data)
        return data

    def get_competitor_analysis(self, domain: str, **kwargs) -> dict:
        """
        5. Competitor Analysis: POST /v1/competitors/overview
        Fetches overview of competitors for the domain.
        """
        clean_domain = self.validate_domain(domain)
        endpoint = "/v1/competitors/overview"
        
        cached_data = self._read_cache(clean_domain, endpoint)
        if cached_data:
            return cached_data
            
        payload = {
            "domain": clean_domain,
            **kwargs
        }
        data = self._request_with_backoff("POST", endpoint, payload=payload)
        self._write_cache(clean_domain, endpoint, data)
        return data

    def run_site_audit_flow(self, domain: str, poll_interval: int = 15, max_polls: int = 40, **kwargs) -> dict:
        """
        Dedicated method for the asynchronous Site Audit workflow:
        1. Launch Audit: POST /v1/site-audit/audits/standard
        2. Poll for completion: GET /v1/site-audit/audits/status
        3. Fetch Final Report: GET /v1/site-audit/audits/report
        
        :param domain: Domain to audit.
        :param poll_interval: Wait time (seconds) between polls. Default is 15 seconds.
        :param max_polls: Maximum number of times to poll status before raising timeout.
        :return: Audit report data.
        """
        clean_domain = self.validate_domain(domain)
        endpoint_report = "/v1/site-audit/audits/report"
        
        # Check cache first for the final report
        cached_report = self._read_cache(clean_domain, endpoint_report)
        if cached_report:
            logger.info("Found cached Site Audit report.")
            return cached_report

        logger.info(f"Launching Standard Site Audit for '{clean_domain}'...")
        launch_payload = {
            "domain": clean_domain,
            **kwargs
        }
        # Step 1: Launch
        launch_response = self._request_with_backoff("POST", "/v1/site-audit/audits/standard", payload=launch_payload)
        logger.info(f"Site Audit launch response: {launch_response}")
        
        # Step 2: Poll status
        # Endpoint: GET /v1/site-audit/audits/status
        # We query the status until it shows complete or similar final status.
        status_endpoint = "/v1/site-audit/audits/status"
        audit_complete = False
        
        for poll_count in range(max_polls):
            logger.info(f"Polling site audit status (Poll {poll_count + 1}/{max_polls})...")
            # Usually needs passing domain or audit ID. We'll pass the domain in query params.
            status_params = {"domain": clean_domain}
            status_data = self._request_with_backoff("GET", status_endpoint, params=status_params)
            
            status = status_data.get("status")
            progress = status_data.get("progress", 0)
            logger.info(f"Current status: {status} (Progress: {progress}%)")
            
            # Adjust completion criteria based on actual API states (typically "finished", "completed", "success", etc.)
            if status in ["finished", "completed", "success", "done"] or progress == 100:
                logger.info("Site Audit completed!")
                audit_complete = True
                break
            elif status in ["failed", "error"]:
                raise RuntimeError(f"Site Audit failed with status: {status_data}")
                
            time.sleep(poll_interval)
            
        if not audit_complete:
            raise TimeoutError("Site Audit did not complete within the maximum polling time limit.")

        # Step 3: Fetch Report
        logger.info("Fetching final Site Audit report...")
        report_params = {"domain": clean_domain}
        report_data = self._request_with_backoff("GET", endpoint_report, params=report_params)
        
        # Cache the final report
        self._write_cache(clean_domain, endpoint_report, report_data)
        return report_data
