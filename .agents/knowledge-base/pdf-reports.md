# PDF Reports Knowledge

> Maintained by Knowledge Curator. Append new entries using the format defined in SKILL.md.

## Context

### PDF Generation Stack
- **Puppeteer v25** — headless Chrome for full-page rendering
- **jsPDF** — PDF creation library
- **html2canvas** — HTML → canvas → PDF pipeline

---

## [2026-08-13] Comprehensive Feature Mapping of PDF Generation

**Task:** Analyzed all features, UI components, API endpoints, and libraries where PDF generation is used across the codebase.

**Where PDF Generation Is Used:**

1. **SEO Report PDF Compilation (Server-Side Puppeteer)**
   - **Engine:** Puppeteer v25 (Headless Chrome/Edge executable discovery on Windows)
   - **Implementation:** `lib/report-compiler.ts` (`compileReportPdf`)
   - **API Endpoints:**
     - `GET /api/reports/[id]/pdf` (triggers background compilation via `after()`)
     - `POST /api/reports/[id]/regenerate` (resets status and recompiles PDF)
     - `POST /api/reports/generate` (streams binary PDF buffer directly)
   - **UI Entrypoints:** Agency Dashboard (`/reports`), Client Portal (`/c/reports`), Public Share Page (`/report/[shareSlug]`).

2. **Client-Side Canvas PDF Export (jsPDF + html2canvas)**
   - **Engine:** jsPDF v2.5.1 + html2canvas v1.4.1 (dynamic CDN loading)
   - **Implementation:** `app/reports/render/PrintButton.tsx` (`<PrintButton />`)
   - **UI Entrypoint:** Printable Report View (`/reports/render/[id]`). Captures DOM at 3× resolution for crisp text and triggers immediate browser download.

3. **Billing Invoice PDF Generation (Dual Engine)**
   - **Engine:** jsPDF + html2canvas (client side) & Puppeteer (server side)
   - **Implementation:** `lib/invoicePdfGenerator.ts` (`downloadInvoicePDF`) & `app/api/billing/invoice-pdf/route.ts`
   - **UI Entrypoints:** Agency Dashboard Settings Billing Tab (`/[domain]/(dashboard)/settings?tab=billing`) & Super Admin Billing (`/admin`).

---

## 2026-08-14 — Direct PDF File Download Implementation

**Task:** Enable one-click direct PDF file download when clicking "Download PDF" button without opening browser print prompt.  
**Files Changed:**
- `app/reports/render/PrintButton.tsx` — modified
- `app/reports/render/[id]/page.tsx` — modified
- `app/api/reports/generate/route.ts` — modified
- `c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main` — synced

**What Was Done:**
1. Updated `PrintButton.tsx` to directly query `/api/reports/generate?id=${reportId}&filename=${cleanName}`.
2. In `app/api/reports/generate/route.ts`, generated PDF using Puppeteer headless Chrome with exact `render.css` print rules and streamed the binary buffer with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="${cleanFilename}.pdf"`.
3. In `PrintButton.tsx`, converted binary stream into a downloadable Blob URL (`a.href = blobUrl; a.download = ...; a.click()`) for direct file download into the user's Downloads folder, showing `⏳ Generating PDF…` → `✓ Downloaded!` with client print fallback.

---


