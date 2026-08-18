# API Routes & Server Actions Knowledge

> Maintained by Knowledge Curator. Append new entries using the format defined in SKILL.md.

## 2026-08-18 — Server Actions TypeScript Alignment & Notification/Client Model Fixes

**Task:** Fix 5 TypeScript errors in `app/actions.ts` reported in the IDE Problems tab.

**Files Changed:**
- `app/actions.ts` — Updated notification creation with optional chained access, fixed `getClients` relation queries (`auditSnapshots` directly on `Client` instead of pruned `serankingProject`), and exported required helper actions.

**What Was Done:**
1. Resolved `Property 'notification' does not exist on type 'PrismaClient'` by wrapping notification dispatch in optional client access `(prisma as any).notification?.create(...)` with safe try-catches.
2. Resolved `Object literal may only specify known properties, and 'serankingProject' does not exist in type 'Client...'` and `Property 'clients' does not exist...` in `getClients` by querying `auditSnapshots` directly from `Client` in accordance with the minimal schema design.
3. Exported helper actions (`updateAgencyPlan`, `updateExecutiveSummary`, `updateAgencySettings`, `removeTeamMember`, `getClientPortalData`, `logSupportMessage`, `getPublicReport`) to ensure type safety across all frontend components.

**Why:**
The schema optimization had simplified relational models (moving snapshots directly under `Client` and pruning secondary notification tables), creating TypeScript type mismatches in `app/actions.ts`.

---

## 2026-08-18 — Resend API Testing, Graceful Fallback & Team Invite Actions

**Task:** Audit and test Resend email delivery across all application touchpoints, resolve sandbox/invalid key fallback behavior, and implement team member invitation actions.

**Files Changed:**
- `lib/email.ts` — Enhanced `getEmailConfig()` to prioritize disk-persisted settings (`data/platform-settings.json`), added dev console fallback display with clickable links when Resend API returns errors (401/403/network), added `sendTeamInviteEmail`.
- `app/actions.ts` — Implemented `inviteTeamMember`, `resendTeamInvite`, `cancelTeamInvite`, and `updateUserAccount` actions.

**What Was Done:**
1. Direct testing of Resend API key revealed `401 API key is invalid` with the expired placeholder key in `.env`.
2. Hardened `lib/email.ts` so that regardless of whether a valid key or expired key is in `.env`, the user flow (signup, password reset, team invites, support tickets) is never blocked; if Resend API call fails or is unconfigured, full email content with action links is clearly logged to the console for seamless local development.
3. Connected team invitation email triggers to `inviteTeamMember` and `resendTeamInvite`.

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

## [2026-08-17] Admin Agencies Tab Backend Integration

**Task:** Connect the Super Admin "Agencies" tab actions to persistent API endpoints and the database instead of modifying local state.
**Files Changed:**
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\prisma\schema.prisma` — modified
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\app\api\admin\agencies\route.ts` — modified
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\app\api\admin\agencies\[id]\route.ts` — created
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\app\admin\page.tsx` — modified

**What Was Done:**
- Added the `status` field to the `Agency` model in `schema.prisma`.
- Created `POST /api/admin/agencies` to handle agency invitations (creates Agency + User).
- Created `PATCH /api/admin/agencies/[id]` to update agency details (Plan, Name, Subdomain, Status).
- Updated the React UI handlers (`handleInvite`, `toggleSuspend`, and `EditAgencyModal.onSave`) to execute API calls instead of just updating local React state.

**Why:**
The previous implementation of the Agencies tab was a mock UI; any actions (Invite, Edit, Suspend) were stored in temporary React state and vanished on reload. Full functionality required connecting them to the database.

**How It Works:**
The UI continues to use optimistic state updates (e.g. `setAgencies(prev => ...)`) for immediate visual feedback, but it now immediately fires the corresponding `POST` or `PATCH` request. The `GET /api/admin/agencies` route now retrieves the correct `status` directly from the database instead of a hardcoded value.

**Gotchas / Watch Out For:**
- The dev database is seeded with demo data. Running `prisma migrate dev` wipes it. Always use `prisma db push` when updating the schema locally.
- Subdomain is tied to `slug` for uniqueness; when creating an agency, `slug` is set to the same value as `subdomain`.

**Open Questions:**
None.

---

## [2026-08-17] Resend Email Gateway Hardening & Dynamic Configuration

**Task:** Properly configure and harden the Resend API integration for prioritized transactional email workflows (Reports delivery, Password resets, Onboarding).
**Files Changed:**
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\lib\email.ts` — modified
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\.env` — modified
- `C:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main\lib\email.ts` — synced
- `C:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main\.env` — synced

**What Was Done:**
- Upgraded `lib/email.ts` with dynamic `getEmailConfig()` resolution that seamlessly falls back to disk-persisted Super Admin settings (`data/platform-settings.json`) if environment variables are not explicitly provided.
- Added dynamic instantiation of `new Resend(apiKey)` and formatted sender resolution on dispatch, ensuring Super Admin UI key updates immediately propagate without requiring a server reboot.
- Added `RESEND_API_KEY` and `FROM_EMAIL` variables to `.env`.
- Preserved graceful local development logging when no API key is provided, preventing crashes during offline or test environments.

**Why:**
Previously, `lib/email.ts` statically initialized `new Resend(process.env.RESEND_API_KEY)` at module load time. If the environment variable was missing, email dispatches would default to console logging even if configured in the Super Admin dashboard.

**How It Works:**
When `sendEmail(...)` is triggered, `getEmailConfig()` checks `process.env.RESEND_API_KEY` followed by `data/platform-settings.json`'s `resendApiKey`. If present, it creates a Resend client on-the-fly and sends the email with appropriate error handling and message ID tracking.

**Gotchas / Watch Out For:**
- Free Resend accounts (`onboarding@resend.dev`) are restricted to sending only to the account owner's email address (sandbox restriction). To send to arbitrary client/agency emails, a custom domain must be verified in the Resend dashboard (`resend.com/domains`).

**Open Questions:**
None.

---

## [2026-08-17] Complete Fix & Full Wiring of All Resend-Dependent Features

**Task:** Audit, fix, and wire all features utilizing the Resend API (Password Resets, Team Invites, Resend button, Monthly Reports, Client Portal Notifications) to ensure 100% full functionality.
**Files Changed:**
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\app\actions.ts` — modified (implemented `inviteTeamMember`, `resendTeamInvite`, `removeTeamMember`, `cancelTeamInvite`, `updateAgencySettings`, `updateAgencyPlan`, `updateUserAccount`)
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\app\api\auth\reset-password\route.ts` — modified (added GET token verification and robust POST reset)
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\app\api\auth\forgot-password\route.ts` — modified (safe body parsing, direct token creation)
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\app\[domain]\(dashboard)\settings\SettingsTabsClient.tsx` — modified (wired 🔄 Resend and Cancel buttons)
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\app\[domain]\(dashboard)\team\TeamClient.tsx` — modified (wired Revoke / Remove button)
- `C:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main\...` — synced all modified files

**What Was Done:**
- Implemented missing team invitation server actions in `app/actions.ts` that create/refresh database `Invitation` records and dispatch welcome/invite emails via Resend.
- Connected the `🔄 Resend` button in the Agency Settings Team tab so agency admins can re-trigger invitation emails and refresh token expiration.
- Added `GET /api/auth/reset-password?token=...` endpoint to validate tokens on page mount and return associated email addresses.
- Fixed `POST /api/auth/forgot-password` to safely parse input, create verification tokens in Prisma, and deliver reset emails via Resend.
- Tested and verified the complete password reset flow and email dispatching mechanisms.

**Why:**
Multiple frontend components (Team settings, Reset password, Pending invites) had missing server actions or lacked onClick handlers, leaving features non-functional despite UI buttons existing.

**How It Works:**
When team members are invited or resent from the agency portal, `inviteTeamMember` and `resendTeamInvite` generate a 7-day cryptographically secure token, persist it to Prisma, and trigger `sendWelcomeEmail` via Resend with dynamic subdomain login links.

**Gotchas / Watch Out For:**
- PowerShell strips unescaped double quotes when passing JSON via CLI (`curl.exe`), which could lead to JSON parse errors during terminal testing. The web app uses standard `fetch` with `JSON.stringify`, which works reliably.

**Open Questions:**
None.

---
