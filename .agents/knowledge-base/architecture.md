# Architecture Knowledge

## 2026-07-27 — High-Level Architecture & Multi-Tenancy Pattern

**Task:** Initial knowledge base bootstrap from codebase exploration  

**What Was Done:** Documented the full architecture of RankFlow.

**Architecture Summary:**

RankFlow is a **multi-tenant SaaS** where each "agency" gets its own branded subdomain. The app uses Next.js App Router with a dynamic `[domain]` segment to serve different agency contexts from the same codebase.

### Routing Topology

```
localhost:3000                     → Super Admin (/admin/...)
localhost:3000/login               → Super Admin login
demo.localhost:3000                → Agency "demo" dashboard
demo.localhost:3000/login          → Agency Admin login
demo.localhost:3000/c/dashboard    → Client portal for agency "demo"
demo.localhost:3000/c/login        → Client login
```

### Three Dashboard Tiers

1. **Super Admin** (`app/admin/`)
   - Platform-wide: agencies, users, billing, system health, broadcasts
   - Only accessible to users with `SUPER_ADMIN` role
   - Login at `localhost:3000/login`

2. **Agency Dashboard** (`app/[domain]/(dashboard)/`)
   - Per-agency workspace: clients, reports, settings, schedules, keyword explorer, tasks
   - Accessible to `AGENCY_ADMIN` and `TEAM_MEMBER` roles
   - Login at `{domain}.localhost:3000/login`

3. **Client Portal** (`app/[domain]/c/`)
   - Read-only SEO dashboard for end clients
   - Login at `{domain}.localhost:3000/c/login`

### Key Design Patterns

**Server Actions** (`app/actions.ts`): Most data mutations use Next.js Server Actions (not REST API calls from client components). This keeps DB access server-side.

**API Routes** (`app/api/`): Used for:
- Cron jobs (`/api/cron/monthly-reports`)
- PDF generation (`/api/billing/invoice-pdf`)
- SE Ranking proxy (`/api/seranking/`)
- Auth callback (NextAuth)

**Middleware** (`middleware.ts` — inferred): Reads the hostname to determine which agency `[domain]` to serve. Routes super admin traffic differently.

**Prisma ORM**: Single Prisma client instance in `lib/prisma.ts`. Schema in `prisma/schema.prisma`. Dev uses SQLite (`dev.db`).

**Auth**: NextAuth v5 (beta) with credentials provider. Auth config in `lib/auth.ts`. Uses `auth()` helper (not `getServerSession()`).

**Gotchas:**
- Next.js 16.2.10 is post-15 — many App Router APIs differ from training data. Always check `node_modules/next/dist/docs/` before writing route handlers or layout patterns.
- The `(dashboard)` directory uses a route group — this affects layouts but not URL segments.
- Multi-tenancy requires subdomain support. In Chrome on localhost, subdomains work. In some environments they may not.

---
