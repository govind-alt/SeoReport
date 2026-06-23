# AI_PROJECT_CONTEXT.md
# RankFlow — SEO Report Automation App
# ⚡ PURPOSE: Load this file FIRST. It gives you full project context in minimal tokens.
# ⚡ HOW TO USE: Read this entire file before touching any code. Skip the full docs unless needed.
# Last Updated: June 2026 | Status: Planning Complete → Development Starting

---

## 🗂️ WHAT THIS PROJECT IS

**Product:** RankFlow — a multi-tenant SaaS platform  
**Goal:** Automate monthly SEO report generation for SEO agencies + their clients  
**Core Data Source:** SERanking API (rank tracking, backlinks, site audit, analytics)  
**Current State:** All planning docs complete. No source code written yet. Development starts at Phase 0.

---

## 📁 REPO STRUCTURE (as of planning phase)

```
SEOReportAutomationApp/
├── AI_PROJECT_CONTEXT.md        ← THIS FILE (read first)
├── README.md                    ← Quick overview
├── docs/
│   ├── 01_PROJECT_SCOPE.md      ← Business requirements, user roles, modules
│   ├── 02_TECH_STACK.md         ← Full stack decisions + package.json manifest
│   ├── 03_ARCHITECTURE.md       ← Multi-tenancy design, system diagram
│   ├── 04_SERANKING_API.md      ← SERanking API reference + endpoint mapping
│   ├── 05_DATABASE_SCHEMA.md    ← Full Prisma schema, ERD, all tables
│   ├── 06_NAVIGATION_FLOW.md    ← App routes, user journey flows
│   ├── 07_WIREFRAMES.md         ← ASCII wireframes for all screens
│   ├── 08_REPORT_ELEMENTS.md    ← All report sections with dummy data
│   ├── 09_IMPLEMENTATION_PLAN.md← Phase-by-phase dev roadmap with tasks
│   ├── 10_TIMELINE.md           ← 16-week project timeline
│   └── 11_WIREFRAME_AUDIT.md    ← Wireframe review & audit notes
├── wireframes/
│   ├── wireframes.html          ← Visual HTML wireframes (main)
│   ├── wireframes-v2-merged.html← Merged v2 wireframes
│   ├── mock-report.html         ← HTML mockup of final report output
│   └── merge-wireframes.js      ← Script to merge wireframe parts
└── src/                         ← NOT CREATED YET (Phase 0 starts here)
```

---

## 👥 USER ROLES (4 levels)

| Role | Access |
|---|---|
| **Super Admin** | Platform owner — manages all agencies/tenants |
| **Agency Admin** | Manages their agency — clients, reports, settings, API keys |
| **Team Member** | Can manage clients and generate reports (no billing/API keys) |
| **Client User** | Read-only — views & downloads their own reports only |

---

## 🛠️ TECH STACK (FINALIZED — do not change without user approval)

| Area | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Tables | TanStack Table v8 |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Data fetching | TanStack Query v5 |
| Animations | Framer Motion |
| ORM | Prisma 5 |
| Database | PostgreSQL via Supabase (with Row-Level Security) |
| Auth | NextAuth.js v5 (Auth.js) — Credentials + Google OAuth |
| Cache | Redis via Upstash |
| Job Queue | Inngest |
| Email | Resend + React Email |
| File Storage | Supabase Storage |
| PDF Generation | Puppeteer + @sparticuz/chromium (serverless) |
| Hosting | Vercel (Pro — needed for wildcard subdomains) |
| CI/CD | GitHub Actions |
| Monitoring | Sentry + Vercel Analytics |

---

## 🏗️ APP STRUCTURE (src/ — to be created in Phase 0)

```
app/
├── (auth)/                    # /login, /register, /forgot-password
├── (dashboard)/               # Agency-facing app
│   ├── dashboard/             # Home — KPIs, clients table, activity
│   ├── clients/               # Client list + [clientId] detail tabs
│   ├── reports/               # Report list, generate, [reportId] view
│   └── settings/              # Agency settings, API keys, branding
├── (client-portal)/           # /c/dashboard, /c/reports (read-only)
├── api/
│   ├── auth/                  # NextAuth endpoints
│   ├── seranking/             # SERanking proxy routes
│   ├── reports/               # Report CRUD + PDF generation
│   └── webhooks/              # Inngest + email webhooks
├── r/[shareSlug]/             # Public shareable report URL
└── layout.tsx

components/
├── ui/                        # shadcn/ui base components
├── charts/                    # Recharts wrappers
├── report/                    # Report section components
└── dashboard/                 # Dashboard widgets

lib/
├── seranking/client.ts        # SERanking API client class
├── seranking/types.ts
├── seranking/cache.ts
├── prisma.ts                  # Prisma client singleton
├── auth.ts                    # Auth.js config
├── branding.ts                # CSS variable injection per agency
└── utils.ts

prisma/schema.prisma           # Full DB schema (see 05_DATABASE_SCHEMA.md)
inngest/functions/             # Background jobs (daily sync, monthly reports)
emails/templates/              # React Email templates
```

---

## 🗄️ KEY DATABASE TABLES (summary — full schema in 05_DATABASE_SCHEMA.md)

| Table | Purpose |
|---|---|
| `Agency` | Tenant record — slug, subdomain, branding, plan |
| `User` | Users across all roles — linked to agency |
| `Client` | End-clients managed by an agency |
| `SERankingProject` | SERanking project synced to a client |
| `KeywordSnapshot` | Daily rank positions per keyword |
| `BacklinkSnapshot` | Backlink metrics per date |
| `AuditSnapshot` | Site audit health scores |
| `AnalyticsSnapshot` | Traffic/GSC data per period |
| `Report` | Generated report record — status, sections, PDF URL |
| `ReportSchedule` | Monthly automation config per client |
| `Invitation` | Client portal invite tokens |

Multi-tenancy is enforced via Supabase **Row-Level Security (RLS)** — every table has `agency_id`.

---

## 📊 REPORT SECTIONS (generated per client per month)

1. **Report Header** — Agency logo, client name, date range
2. **Executive Summary** — KPI scorecard (rankings, traffic, backlinks, health), wins, highlights
3. **Keyword Rankings** — Distribution pie, position trend, top keywords table, movers/losers
4. **Organic Traffic** — Sessions/clicks/CTR cards, trend chart, GSC top queries + pages
5. **Backlink Profile** — DA, total links, new/lost chart, referring domains table
6. **Technical Audit** — Health score gauge, issues by category, top critical issues
7. **Competitor Analysis** — Rank comparison table, visibility trend chart
8. **AI Visibility** — (optional, if data available)
9. **Recommendations** — AI-generated next steps
10. **Report Footer** — Branding, generated date

---

## 🔌 SERANKING API (key endpoints — full reference in 04_SERANKING_API.md)

| Endpoint | Data |
|---|---|
| `GET /sites` | List all projects |
| `GET /sites/{id}/rankings` | Keyword positions |
| `GET /sites/{id}/competitors` | Competitor data |
| `GET /sites/{id}/audit` | Site audit results |
| `GET /backlinks/summary` | Backlink overview |
| `GET /backlinks/new` | New backlinks |
| `GET /backlinks/lost` | Lost backlinks |
| Data API: domain overview | Traffic, authority estimates |

Auth: `Authorization: Token {api_key}` header. Keys stored AES-256 encrypted in DB.

---

## 🔐 ENVIRONMENT VARIABLES (needed for Phase 0 setup)

```bash
DATABASE_URL=postgresql://...         # Supabase PostgreSQL
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://app.rankflow.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
RESEND_API_KEY=...
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
ENCRYPTION_SECRET=...                 # 32-char string for AES-256 API key encryption
```

---

## 🚀 DEVELOPMENT PHASES (16 weeks total)

| Phase | Focus | Week | Status |
|---|---|---|---|
| 0 | Foundation & Setup | 1 | ⬜ Not started |
| 1 | Auth & Multi-Tenancy | 2–3 | ⬜ Not started |
| 2 | SERanking Integration | 4–5 | ⬜ Not started |
| 3 | Dashboard & Clients | 6–7 | ⬜ Not started |
| 4 | Report Engine | 8–10 | ⬜ Not started |
| 5 | Automation & Email | 11 | ⬜ Not started |
| 6 | Client Portal | 12 | ⬜ Not started |
| 7 | Branding & White-label | 13 | ⬜ Not started |
| 8 | Polish & Testing | 14–15 | ⬜ Not started |
| 9 | Launch Prep | 16 | ⬜ Not started |

**Update this table as phases complete.**

---

## ⚠️ KEY DECISIONS & CONSTRAINTS (do not re-litigate these)

- **Multi-tenancy via subdomain:** `agency-name.rankflow.app` — middleware resolves agency from subdomain
- **PDF via Puppeteer** (not @react-pdf/renderer) — for full chart/color fidelity
- **Vercel Pro required** — wildcard subdomains need Pro plan
- **Puppeteer on serverless** — use `@sparticuz/chromium` to handle Chromium layer size limits
- **SERanking API keys** — encrypted at rest using AES-256; never stored in plaintext
- **Supabase RLS** — primary multi-tenancy enforcement at DB level, not just app level

---

## 📝 CURRENT PROGRESS LOG

```
[2026-06-23] Planning complete. All 11 docs written. Wireframes (HTML) finalized.
             Mock report HTML created. No source code yet.
             Next step: Begin Phase 0 — project scaffolding.

[2026-06-23] AI_PROJECT_CONTEXT.md created — single-file project transport log.
             All 11 docs reviewed and distilled into this context file.
             AI can now be onboarded on any device by reading this file alone.
             README.md reviewed. No source code yet. Phase 0 not started.
             Next step: Scaffold Next.js 14 project (Phase 0).
```

> **Add entries here as you make progress.** Format: `[YYYY-MM-DD] What was done. What is next.`

---

## 💡 FOR THE AI ASSISTANT — HOW TO HELP

1. **Start here.** This file is your source of truth for project context.
2. **Read full docs only when needed** — e.g., read `05_DATABASE_SCHEMA.md` only when working on DB, `04_SERANKING_API.md` only when building the API client.
3. **Update the Progress Log** above every session with what was done.
4. **Update Phase status** in the table above when a phase completes.
5. **Preserve existing decisions** — the tech stack and architecture are locked. Don't suggest alternatives unless the user raises an issue.
6. **Source code goes in `src/`** — but the project root doesn't have a `src/` yet; Next.js scaffold creates it in Phase 0.

---

*AI_PROJECT_CONTEXT.md — v1.1 | Created: June 2026 | Last Updated: 2026-06-23*
