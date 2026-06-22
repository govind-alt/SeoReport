import os
import sys
import json
import logging
from dotenv import load_dotenv
from api.seranking import SERankingClient
from reports.report_generator import ReportGenerator

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SEO_Report_Tool")

def load_mock_data(domain):
    """Generates mock data for demo run when no API key is present."""
    logger.info("Generating professional mock SEO data for demonstration...")
    return {
        "subscription": {
            "status": "active",
            "plan": "Enterprise Pro",
            "credits_remaining": 87520,
            "expiry_date": "2027-12-31"
        },
        "domain_overview": {
            "domain_trust": 84,
            "organic_traffic": {
                "traffic": "58,400",
                "trend": "up"
            },
            "organic_keywords": {
                "total": 3480
            }
        },
        "keywords": {
            "tiers": [18, 45, 120, 480],
            "keywords": [
                { "keyword": "best search automation", "position": 1, "difficulty": 42, "volume": 2400, "traffic": 18.2 },
                { "keyword": "premium seo dashboard", "position": 3, "difficulty": 58, "volume": 1200, "traffic": 11.5 },
                { "keyword": "automated client report pdf", "position": 5, "difficulty": 31, "volume": 650, "traffic": 7.4 },
                { "keyword": "technical crawl status", "position": 9, "difficulty": 64, "volume": 1900, "traffic": 3.2 },
                { "keyword": "rank tracking api python", "position": 12, "difficulty": 49, "volume": 800, "traffic": 2.1 }
            ]
        },
        "backlinks": {
            "backlinks_count": "184,920",
            "referring_domains": "2,410"
        },
        "competitors": {
            "list": [
                { "domain": domain, "keywords": 3480 },
                { "domain": "seo-master-competitor.com", "keywords": 9800 },
                { "domain": "ranktracker-pro.net", "keywords": 5900 },
                { "domain": "crawler-ninja.io", "keywords": 2100 }
            ]
        },
        "site_audit": {
            "health_score": 92,
            "errors_count": 8,
            "warnings_count": 24,
            "notices_count": 65
        }
    }

def main():
    print("=" * 60)
    print("        SEO REPORT AUTOMATION TOOL - REPORT GENERATION        ")
    print("=" * 60)
    
    # 1. Load environment variables
    load_dotenv()
    
    # 2. Check if the API key is present
    api_key = os.getenv("SERANKING_API_KEY")
    demo_mode = False
    
    if not api_key:
        print("[WARNING] SERANKING_API_KEY is not set in the environment or .env file.")
        run_demo = input("Would you like to run in DEMO MODE with premium mockup data? (y/n): ").strip().lower()
        if run_demo == 'y':
            demo_mode = True
        else:
            print("Please set your SERANKING_API_KEY in the .env file to continue.")
            sys.exit(1)
        
    # 3. Prompt user for website domain
    try:
        domain_input = input("Enter website domain to analyze (e.g. example.com): ").strip()
        if not domain_input:
            print("[ERROR] Domain cannot be empty.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\nExiting program.")
        sys.exit(0)

    # 4. Fetch/Construct data
    seo_data = {}
    
    if demo_mode:
        # Load mock data for the dashboard demo
        seo_data = load_mock_data(domain_input)
    else:
        # Initialize client and query real API
        try:
            client = SERankingClient(api_key=api_key)
            
            # Step 1: Check account
            print("\n[1/6] Checking subscription limits...")
            seo_data["subscription"] = client.check_account_subscription()
            
            # Step 2: Fetch Domain Overview
            print(f"[2/6] Fetching Domain Overview for '{domain_input}'...")
            seo_data["domain_overview"] = client.get_domain_overview(domain=domain_input)
            
            # Step 3: Fetch Keyword Rankings
            print(f"[3/6] Fetching Keyword Rankings for '{domain_input}'...")
            seo_data["keywords"] = client.get_keyword_rankings(domain=domain_input)
            
            # Step 4: Fetch Backlink Summary
            print(f"[4/6] Fetching Backlink Summary for '{domain_input}'...")
            seo_data["backlinks"] = client.get_backlink_summary(domain=domain_input)
            
            # Step 5: Fetch Competitor Analysis
            print(f"[5/6] Fetching Competitor Analysis for '{domain_input}'...")
            seo_data["competitors"] = client.get_competitor_analysis(domain=domain_input)
            
            # Step 6: Site Audit Async Flow
            print(f"[6/6] Launching Site Technical Audit for '{domain_input}'...")
            # We run it with small poll interval for responsiveness in testing/production
            seo_data["site_audit"] = client.run_site_audit_flow(domain=domain_input, poll_interval=10)
            
            print("[SUCCESS] All raw API data successfully collected and structured!")
            
        except Exception as e:
            print(f"\n[ERROR] An error occurred during API extraction: {e}")
            print("Ensure your API key is active and your subscription has credits.")
            sys.exit(1)
            
    # 5. Generate beautiful HTML report
    print("\nCompiling premium HTML SEO report & dashboard...")
    try:
        generator = ReportGenerator(output_dir="output")
        report_file_path = generator.generate_html_report(domain=domain_input, data=seo_data)
        
        print("\n" + "=" * 60)
        print(" SUCCESS: SEO REPORT READY!")
        print("=" * 60)
        print(f"File Path: {os.path.abspath(report_file_path)}")
        print("Open this file in your browser to view the interactive dashboard.")
        print("To export to PDF, simply click the 'Export PDF' button on the dashboard.")
        print("=" * 60)
        
    except Exception as e:
        print(f"[ERROR] Failed to compile report: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
