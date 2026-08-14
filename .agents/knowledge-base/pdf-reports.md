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

## 2026-08-14 — PDF Header & Footer Full-Bleed Edge Alignment Fix

**Task:** Fix the header and footer formatting in the exported PDF so they render cleanly edge-to-edge without background bleed, margins, or rounded corners floating in white/blue space.  
**Files Changed:**
- `app/reports/render/[id]/render.css` — modified
- `app/api/reports/generate/route.ts` — modified
- `c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main` — synced

**What Was Done:**
1. Updated `@page` margin to `0` and set `html, body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }` in `@media print`.
2. Changed `.report-page` in `@media print` to `width: 100% !important; max-width: 100% !important; border-radius: 0 !important; margin: 0 !important;`.
3. Set `.cover` and `.report-footer` in `@media print` to `width: 100% !important; border-radius: 0 !important; margin: 0 !important; padding: 24px 48px !important;` so the cover header sits flush at the top of Page 1 and the footer sits flush at the bottom of the document.
4. Set Puppeteer PDF generation margin to `{ top: '0', right: '0', bottom: '0', left: '0' }` in `app/api/reports/generate/route.ts` to eliminate artificial print margins.

---



