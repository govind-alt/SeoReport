# SEO Report Automation Tool

> Automated SEO reporting powered by the SERanking API — enter any domain, get a full professional SEO report instantly.

**Version:** 1.1 | **Team:** Govind Prajapati & Ritesh Gardare | **Repo:** github.com/govind-alt/SeoReport

---

## 📌 Project Overview

This tool removes the manual effort from SEO reporting. A user enters any website domain, the tool fetches real-time SEO data via the SERanking API, and generates a clean, structured report — reusable for any number of clients.

| Item | Details |
|---|---|
| Project Name | SEO Report Automation Tool |
| API Used | SERanking Data API |
| Input | Any website domain/URL |
| Output | Automated SEO Report (Web App — PDF / Dashboard) |
| Team Size | 2 Members (single shared repo) |

---

## 🎯 Problem Statement

Generating SEO reports manually is slow and repetitive. This tool solves that by:
- Accepting **any website** as input
- Fetching **all SEO data automatically** from SERanking API
- Generating a **clean, structured report instantly**
- Being **fully reusable** for multiple clients

---

## ✨ Features & Tech Stack

- **5-Section SEO Data:** Domain Overview, Keyword Rankings, Backlinks, Site Audit, Competitor Analysis.
- **SERanking API Integration:** Automated data extraction including asynchronous site audit polling, retry logic with exponential backoff, caching, and domain validation.
- **Premium Report Generation:** Beautiful HTML output using glassmorphism UI and Chart.js.

**Tech Stack:**
- **Python 3.x**
- **requests:** Make HTTP calls to SERanking API
- **python-dotenv:** Secure API key management
- **Chart.js:** For interactive data visualizations

---

## 🚀 Setup & Execution

1. Clone the repository and install requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file and add your API key:
   ```env
   SERANKING_API_KEY=your_api_key_here
   ```

3. Run the tool:
   ```bash
   python main.py
   ```
   Follow the prompts to enter a domain. The tool will generate the HTML report in the `output/` directory. If you don't have an API key, you can run the tool in "Demo Mode" which uses professional mock data.

**Running Tests:**
```bash
python -m unittest discover -s tests
```

---

## 🖥️ UI Design / Mockup

Design prototype built on Stitch (Google):
👉 [View Mockup on Stitch](https://stitch.withgoogle.com/projects/1563741307647754713)

---

## 📄 Project Documents

| Document | Description |
|---|---|
| [docs/Brainstorming.md](docs/Brainstorming.md) | Problem analysis, options explored & final decisions |
| [docs/SEO_Plan.md](docs/SEO_Plan.md) | Full project plan, scoping, phases & risk assessment |
| [docs/UI_Flow.md](docs/UI_Flow.md) | Wireframes, screen designs & user journey |
| [docs/API_Research.md](docs/API_Research.md) | SERanking API endpoints, request/response details |
| [docs/Timeline.md](docs/Timeline.md) | Week-by-week project schedule & milestones |

---

## 🚀 Development Phases

| Phase | Task | Status |
|---|---|---|
| Phase 1 | Planning & Scoping (docs/SEO_Plan.md) | ✅ Done |
| Phase 2 | Repo setup, folder structure, .env config | ✅ Done |
| Phase 3 | API integration — domain overview endpoint | ✅ Done |
| Phase 4 | Build all 5 report sections | ✅ Done |
| Phase 5 | Report generation — PDF / web output | ✅ Done |
| Phase 6 | Testing with multiple domains, bug fixes | ✅ Done |
| Phase 7 | Final review & submission | ⏳ Pending |

---

*SEO Report Automation Tool | v1.1 | June 2026*
