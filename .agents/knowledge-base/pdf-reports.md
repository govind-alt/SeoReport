# 📄 PDF Report Generation Engine

## Puppeteer Serverless Engine (`app/api/reports/generate/route.ts`)
- Renders high-fidelity PDF documents using serverless Puppeteer + Chromium.
- Print-optimized view: `app/reports/render/[id]/page.tsx`.

---

## White-Label Customization
- Injects agency branding logo and CSS variables (`lib/branding.ts`).
- Public Share URLs: `/r/[shareSlug]` allowing clients to view or download reports online.
