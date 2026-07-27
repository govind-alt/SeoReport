# PDF Reports Knowledge

> Maintained by Knowledge Curator. Append new entries using the format defined in SKILL.md.

## Context

### PDF Generation Stack
- **Puppeteer v25** — headless Chrome for full-page rendering
- **jsPDF** — PDF creation library
- **html2canvas** — HTML → canvas → PDF pipeline

### Report Generator
- API: `app/api/billing/invoice-pdf/` (invoice PDFs)
- Monthly report cron: `app/api/cron/monthly-reports/route.ts`
- Report pages: `app/[domain]/(dashboard)/reports/`

### Executive PDF Details
- 2.5× scale rendering for high DPI
- A4 format
- Forces `.pdf` filename download via DOM link trick

---
