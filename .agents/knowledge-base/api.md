# API Routes & Server Actions Knowledge

> Maintained by Knowledge Curator. Append new entries using the format defined in SKILL.md.

## Context

### API Routes Structure
```
app/api/
  auth/[...nextauth]/     ← NextAuth handler
  agency/settings/        ← Agency profile & encrypted API keys
  billing/invoice-pdf/    ← PDF Invoice generation endpoint
  clients/                ← Clients CRUD
  dashboard/summary/      ← KPI aggregation
  seranking/              ← SE Ranking API proxy
  cron/monthly-reports/   ← Cron job for automated monthly reports
```

### Server Actions
Main server actions file: `app/actions.ts`
- Used for most data mutations (client form submissions, CRUD operations)
- Always server-side — never expose DB calls to client components

### Cron Job
`app/api/cron/monthly-reports/route.ts` — triggered externally (Vercel Cron or manual HTTP call) to generate and dispatch monthly SEO reports.

---

## 2026-07-27 — SE Ranking Frontend Integration (Keyword Explorer & Client Details)

**Task:** Connect Keyword Explorer and Client Detail tabs to SE Ranking API  
**Files Changed:**
- `lib/seranking/types.ts` — Added `SERankingKeywordResearch` type
- `lib/seranking/client.ts` — Added `getKeywordResearch` method for `/data/v3/keyword_research`
- `app/api/seranking/keyword-research/route.ts` — Created proxy route for keyword research
- `app/actions.ts` — Updated `getClientDetails` to return `serankingProjectId`
- `app/[domain]/(dashboard)/keyword-explorer/page.tsx` — Fetched actual clients via `/api/clients` and replaced fake timeout search with real API call to `/api/seranking/keyword-research`
- `app/[domain]/(dashboard)/clients/[clientId]/page.tsx` — Replaced mock data in Keywords, Backlinks, and Audit tabs with `useEffect` calls fetching from SE Ranking proxy routes. Added loading states.

**What Was Done:**
All SE Ranking mock data on the frontend has been replaced with live API calls to our proxy routes. When an agency has an API key configured, it will show real data; otherwise, it falls back to the demo mocks generated in the proxy routes.

**Gotchas:**
- `keyword-explorer` previously didn't have a backend route. Added it to use SE Ranking's v3 Data API.
- Tab data in client details is fetched on-demand (when the tab becomes active) to avoid slow page loads.

---
