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
c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main
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
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\next\dist\bin\next" dev
```
Run from project root. Server starts on **http://localhost:3000**.

### Run Prisma Commands
```powershell
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\.bin\prisma" <command>
```

### Environment File
`.env` exists at project root with:
- `DATABASE_URL="file:./dev.db"` (SQLite)
- `NEXTAUTH_SECRET` set
- `NEXTAUTH_URL="http://localhost:3000"`
- `NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"`

### Database
- Dev database: `dev.db` (SQLite, 303 KB, already has seed data)
- Do NOT run `prisma migrate dev` unless you know migrations are needed

---

## 🚀 Running State (as of 2026-07-27)

| Status | Detail |
|--------|--------|
| Dev server | ✅ Running on http://localhost:3000 |
| Database | ✅ SQLite dev.db with seeded users |
| Auth | ✅ Credentials provider active |

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

---

## 📅 Task History Summary

| Date | Task | Outcome |
|------|------|---------|
| 2026-07-27 | Launch dev server on Chrome | ✅ Server running on port 3000 via Cursor's bundled node.exe |
| 2026-07-27 | Create Knowledge Curator system | ✅ Skill + knowledge base + global rules created |
