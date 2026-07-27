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
