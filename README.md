# SEO Report Automation Tool

A Python-based Web Application that automates SEO reporting using the SERanking API. This tool accepts any website domain, fetches real-time SEO data (Overview, Keywords, Backlinks, Site Audit, and Competitors), and generates a professional HTML dashboard/report.

## Features
- **Any Domain:** Works for any website domain.
- **5-Section SEO Data:** Domain Overview, Keyword Rankings, Backlinks, Site Audit, Competitor Analysis.
- **SERanking API Integration:** Automated data extraction including asynchronous site audit polling, retry logic with exponential backoff, caching, and domain validation.
- **Premium Report Generation:** Beautiful HTML output using glassmorphism UI and Chart.js.

## Tech Stack
- **Python 3.x**
- **requests:** Make HTTP calls to SERanking API
- **python-dotenv:** Secure API key management
- **Chart.js:** For interactive data visualizations

## Setup & Execution

1. Clone the repository and install requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file based on `.env.example` or just add your API key to `.env`:
   ```env
   SERANKING_API_KEY=your_api_key_here
   ```

3. Run the tool:
   ```bash
   python main.py
   ```
   Follow the prompts to enter a domain. The tool will generate the HTML report in the `output/` directory. If you don't have an API key, you can run the tool in "Demo Mode" which uses professional mock data.

## Running Tests
Run the test suite using `unittest`:
```bash
python -m unittest discover -s tests
```
