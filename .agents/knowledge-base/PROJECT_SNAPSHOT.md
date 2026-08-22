# RankFlow — Project Snapshot

> Maintained by the **Knowledge Curator** agent. Updated after every task.  
> **ALL AGENTS MUST READ THIS BEFORE STARTING ANY TASK.**

---

## 🏗 Project Identity

| Field | Value |
|-------|-------|
| **Name** | RankFlow — SEO Report Automation SaaS |
| **Type** | Multi-tenant white-label Next.js SaaS |
| **Framework** | Next.js 16.2.10 (App Router + Turbopack) |
| **Language** | TypeScript 5 |
| **DB ORM** | Prisma 7 (SQLite in dev, PostgreSQL/libSQL in prod) |
| **Auth** | NextAuth v5 (beta.31) with Prisma adapter |
| **Styling** | Tailwind CSS v4 |
| **State** | Zustand v5 |
| **Forms** | react-hook-form + zod v4 |
| **Charts** | Recharts v3 |
| **Notifications** | Sonner v2 |
| **PDF** | Puppeteer v25 + jsPDF (html2canvas) |

---

## 🗂 Project Root

```
c:\Users\hrish\OneDrive\Desktop\SeoReport
```

---

## ⚙️ Environment — CRITICAL

### Node.js
- **`npm`, `pnpm`, `npx` are NOT in PATH** — these commands will fail
- **Use this exact command to run Node scripts:**
  ```powershell
  & "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" <script>
  ```
- **Node version:** v22.22.0

### Launch Dev Server
```powershell
# ALWAYS run from the PHYSICAL path (not Desktop symlink):
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\next\dist\bin\next" dev --webpack
```
Run from: `c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main`  
Server starts on **http://localhost:3000**.

> ⚠️ **CRITICAL**: Do NOT run from `c:\Users\hrish\OneDrive\Desktop\SeoReport` — the `node_modules` there is a Windows junction (symlink). Running from the symlink path causes Webpack to load two copies of React/Next.js → `invariant: layout router not mounted` crash.

### Run Prisma Commands
```powershell
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\.bin\prisma" <command>
```

### Environment File
`.env` exists at project root with:
- `DATABASE_URL` (Supabase PostgreSQL transaction pooler, port 6543)
- `DIRECT_URL` (Supabase PostgreSQL direct session pooler, port 5432)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET` set
- `NEXTAUTH_URL="http://localhost:3000"`
- `NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"`

### Database
- Active Database: **Supabase PostgreSQL** (`aws-0-ap-southeast-1.pooler.supabase.com`)
- ORM: Prisma 7 (`@prisma/adapter-pg` with `pg.Pool`)
- Schema: Synchronized via `prisma db push` (17 models, all relations and constraints intact)

---

## 🚀 Running State (as of 2026-08-22)

| Status | Detail |
|--------|--------|
| Dev server | ✅ Running on http://localhost:3000 (Next.js 16.2.10 Turbopack) |
| Database | ✅ Supabase PostgreSQL (connected via @prisma/adapter-pg + pg.Pool) |
| Auth | ✅ NextAuth v5 credentials + SessionProvider wrapping active |

---

## 🔑 Demo Credentials

| Role | Email | Password | URL |
|------|-------|----------|-----|
| Super Admin | `superadmin@rankflow.app` | `admin@123` | http://localhost:3000/login |
| Agency Admin | `demo@rankflow.app` | `demo123` | http://demo.localhost:3000/login |
| Client | `client@acme.com` | `client123` | http://demo.localhost:3000/c/login |

---

## 🏛 Architecture Overview

### Multi-tenancy
- The `[domain]` segment in `app/[domain]/` separates agency workspaces
- Middleware reads the subdomain and routes accordingly
- `localhost:3000` → Super Admin territory (`/admin/...`)
- `demo.localhost:3000` → Agency "demo" dashboard
- `demo.localhost:3000/c/...` → Client portal for agency "demo"

### Three Dashboard Layers
1. **Super Admin** (`/admin`) — platform-wide control
2. **Agency Dashboard** (`/[domain]/(dashboard)`) — per-agency workspace
3. **Client Portal** (`/[domain]/c/`) — per-client read-only view

### Key Directories
```
app/
  [domain]/
    (dashboard)/     ← Agency dashboard pages
    c/               ← Client portal pages
  admin/             ← Super admin pages
  api/               ← All API routes
lib/                 ← Shared utilities (Prisma client, auth, PDF)
components/          ← Shared React components
prisma/              ← Schema + migrations
wireframes/          ← HTML wireframes (static, no server needed)
```

---

## ⚠️ Known Issues & Gotchas

1. **npm/pnpm not in PATH** — Always use the full Cursor node.exe path (see Environment section)
2. **Multi-tenant subdomain routing** — `demo.localhost:3000` requires browsers that support subdomain localhost (Chrome works; some setups may not)
3. **Next.js 16.2.10** — This is a cutting-edge version; APIs may differ from training data. Check `node_modules/next/dist/docs/` for guidance
4. **Prisma 7 + SQLite** — The libSQL adapter is configured but dev uses plain SQLite via `file:./dev.db`
5. **NextAuth v5 beta** — The auth API differs from NextAuth v4; use `auth()` from `lib/auth.ts`, not `getServerSession()`
6. **Desktop workspace node_modules** — Fresh local install active (574 audited packages); Turbopack dev server operational.
7. **Git branch rule (USER RULE)** — NEVER commit or push to `main` without explicit user permission. All work goes to `hrishita-work` only.

---

## 📅 Task History Summary

| Date | Task | Outcome |
|------|------|---------|
| 2026-08-22 | Launch on Chrome | ✅ Next dev server started on http://localhost:3000 & opened Chrome to login page |
| 2026-08-21 | UI Text Polish & Removal of "AI" Terminology | ✅ Replaced all user-facing occurrences of the word AI with natural executive and strategic terms |
| 2026-08-21 | PDF Download Filename Fix & Personal Note Box Resize | ✅ Resolved Blob revocation race condition causing raw UUID download filenames, added UTF-8 headers, and enlarged Personal Note box |
| 2026-08-21 | Enterprise Advance-Level Report Studio & AI Generation Suite | ✅ Upgraded report generator with live AI narrative generation (4 tones), batch multi-client mode, YoY/MoM benchmarks, and 8 modules |
| 2026-08-21 | Agency Sidebar & Route Inbox Removal | ✅ Removed Inbox item and icon from Sidebar.tsx and deleted /inbox dashboard route across workspaces |
| 2026-08-18 | Actions & API TypeScript Alignment & Full Commit | ✅ Resolved 5 actions.ts errors, exported helper server actions, synchronized API routes with schema, committed & pushed to hrishita-work |
| 2026-08-18 | Google OAuth, /auth-success Router & Login Scroll Polish | ✅ Configured Google OAuth client credentials, built /auth-success role router, and unified login page scroll |
| 2026-08-18 | SQLite Schema Sync & Agency Status Column Fix | ✅ Synchronized dev.db with prisma db push, regenerated Prisma client, and verified 100% DB test suite pass rate |
| 2026-08-18 | Client Portal MessagesSection Purge | ✅ Completely removed MessagesSection UI component, state, and hash listeners from client dashboard page.tsx |
| 2026-08-18 | Client Portal Inbox & Chat Removal | ✅ Removed Inbox & Chat navigation item and unused icon from client portal layout.tsx |
| 2026-08-18 | Agency Sidebar Inbox Removal | ✅ Removed Inbox item and unused icon from Sidebar.tsx navItems for streamlined agency navigation |
| 2026-08-18 | Full Agency Portal Audit & SessionProvider Fix | ✅ Fixed SessionProvider wrapping in root providers, fixed duplicate export in actions.ts, and verified full 10-module agency workspace in Chrome |
| 2026-08-18 | Resend Email Gateway Audit, Fallback & Team Invites | ✅ Tested Resend integration across all touchpoints, resolved 401 error behavior with console fallback, and implemented team invite actions |
| 2026-08-18 | Database Connectivity Analysis & Prisma Adapter Env Fix | ✅ Verified SQLite connection (18 tables, 31 reports), updated lib/prisma.ts to read process.env.DATABASE_URL |
| 2026-08-18 | TypeScript Error Resolution & Fresh Node Modules | ✅ Fixed all 9 missing path/fs/resend errors in email.ts and installed local node_modules |
| 2026-08-16 | Admin Reports PDF Download & Superadmin Connectivity | ✅ Added 10 missing server actions and PDF download functionality to admin reports |
| 2026-08-14 | Launch on Chrome | ✅ Next dev server started on http://localhost:3000 & opened Chrome to login page |
| 2026-08-13 | Full session: app launch, routing, full-screen report, git hygiene | ✅ All 7 changed files committed to hrishita-work (b837cb4) |
| 2026-08-13 | Launch on Chrome & Host Domain Resolution | ✅ Dev server started, .env & proxy configured, opened in Chrome |
| 2026-07-27 | Launch dev server on Chrome | ✅ Server running on port 3000 via Cursor's bundled node.exe |
| 2026-07-27 | Create Knowledge Curator system | ✅ Skill + knowledge base + global rules created |
