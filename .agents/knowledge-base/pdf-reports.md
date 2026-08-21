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

## 2026-08-14 — PDF Footer Square Edge Alignment & Border Elimination Fix

**Task:** Fix the footer formatting so it renders with clean square straight edges (`border-radius: 0 !important`) without curved bottom corners or floating borders in PDF export and screen preview.  
**Files Changed:**
- `app/reports/render/[id]/render.css` — modified
- `c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main` — synced

**What Was Done:**
1. Removed `border-radius: 0 0 12px 12px` from `.report-footer` across screen and `@media print` rules.
2. Set `.report-footer` to solid `#0B1437` background with a subtle `2px solid var(--accent)` top accent line and `border-radius: 0 !important;`.
3. Ensured the footer sits flush edge-to-edge as a clean, full-width document ending block.

---

## [2026-08-21] PDF Download Filename Fix & Personal Note Box Resize

**Task:** Fix downloaded PDF file naming (was saving as raw UUID without `.pdf` extension due to immediate Blob URL revocation race condition) and increase Personal Note box height in the report wizard.  
**Files Changed:**
- `app/reports/render/PrintButton.tsx` — delayed Blob URL revocation and enforced `{ type: 'application/pdf' }` MIME type with explicit `.pdf` download attribute
- `app/api/reports/generate/route.ts` — added robust `Content-Disposition` header with UTF-8 filename support and `Content-Length`
- `app/[domain]/(dashboard)/reports/page.tsx` — upgraded `downloadPdf` to fetch binary stream directly and save with human-readable `${clientName}_SEO_Report_${period}.pdf`
- `app/[domain]/(dashboard)/reports/new/page.tsx` — increased Personal Note textarea height to `minHeight: 120px` and `rows={5}`

**What Was Done:**
1. Fixed the race condition in `PrintButton.tsx` where synchronous `window.URL.revokeObjectURL(blobUrl)` immediately after `a.click()` prevented Chrome from reading the download metadata, causing the file to be saved as an unnamed UUID without `.pdf`.
2. Added `Content-Disposition: attachment; filename="<cleanFilename>.pdf"; filename*=UTF-8''<cleanFilename>.pdf` to `/api/reports/generate`.
3. Updated the Personal Note box in the 4-step wizard to be spacious and easily editable without premature scrollbars.

---
