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

## 2026-08-16 — Superadmin Server Actions Implementation (Cross-Admin Connectivity)

**Task:** Implement all missing superadmin server actions that were being called in the UI but never defined, enabling real cross-admin data visibility and all CRUD operations.

**Files Changed:**
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\app\actions.ts` — modified (appended 10 new server actions)

**What Was Done:**
Added the following 10 server actions to `app/actions.ts` (all were called by `SuperadminClient.tsx` and `app/admin/page.tsx` but were missing from the file):

1. `getSuperadminData()` — reads live DB in parallel: agencies (with `_count`), users (with agency), reports (with client+agency), messages. Computes KPIs (MRR, totalClients, planStats), chart data (6-month MRR trend, agency growth), formats support tickets from messages, and returns everything as one object.
2. `createUserSuperadmin(data)` — creates a User with bcrypt-hashed password, linked to optional `agencyId`.
3. `updateUserRoleSuperadmin(userId, role)` — updates user role in DB.
4. `deleteUserSuperadmin(userId)` — deletes user; guards against deleting superadmin accounts.
5. `updateAgencyPlanSuperadmin(agencyId, plan)` — updates agency plan field.
6. `deleteAgencySuperadmin(agencyId)` — deletes agency (Prisma cascade deletes all related data).
7. `createAgencySuperadmin(data)` — creates new Agency row, checks slug/subdomain uniqueness.
8. `toggleSuspendAgencySuperadmin(agencyId)` — toggles plan between `'suspended'` and `'starter'`.
9. `impersonateAgencyAction(agencySlug)` — looks up the agency, returns a redirect URL using `NEXTAUTH_URL` + subdomain routing pattern.
10. `respondToTicketSuperadmin(ticketId, replyText)` — updates the `Message.body` to append ` | Response: "{reply}" [RESOLVED]` and sets `isRead: true`.

**Why:**
The superadmin page (`/superadmin` → `SuperadminClient.tsx`) and admin page (`/admin/page.tsx`) were importing and calling these server actions but the functions were completely absent from `actions.ts`. This caused silent failures on all CRUD buttons (Create User, Edit Role, Deactivate, etc.). The `getSuperadminData()` absence meant the superadmin page loaded with empty/stale props on every render.

**How It Works:**
- All actions use `prisma` client imported at top of `actions.ts`.
- All actions call `revalidatePath('/superadmin')` after mutations so Next.js ISR cache is busted.
- `getSuperadminData()` uses `Promise.all([...])` to run all DB queries concurrently.
- Support tickets are derived from `Message` rows where `isFromAgency === false` (client-to-agency messages).
- Reports are formatted with `toLocaleDateString` for display.
- MRR is calculated as: enterprise=249, pro/professional=99, suspended=0, else=49 per agency.

**Gotchas / Watch Out For:**
- The `@react-email/render` warning from `resend` module is pre-existing and harmless — it does not block compilation.
- `getSuperadminData()` returns `formattedReports` under the key `reports` — this is what `SuperadminClient.tsx` expects as `data.reports`.
- Support tickets sourced from `Message` model — if no messages exist in the DB, the tickets tab will be empty (correct behavior, not a bug).
- `deleteUserSuperadmin` uses `prisma.user.delete` which will also cascade-delete their sessions/accounts.

**Open Questions:**
- Impersonation (`impersonateAgencyAction`) currently returns a URL — there is no actual session-swap/cookie mechanism. The redirect just takes the superadmin to the agency subdomain where they'll be prompted to log in as that agency.

---
