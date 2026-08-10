# RankFlow Project Knowledge Base — Master Index

> **Last updated:** 2026-07-27  
> **Project:** RankFlow — SEO Report Automation SaaS  
> **Root:** `c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main`

---

## 📋 About This Knowledge Base

This knowledge base is maintained automatically by the **Knowledge Curator** agent after every task completion. All AI agents working on this project **MUST** read `PROJECT_SNAPSHOT.md` and relevant category files before starting any work.

---

## 🗂 Category Files

| File | What It Covers | Last Updated |
|------|---------------|--------------|
| [PROJECT_SNAPSHOT.md](./PROJECT_SNAPSHOT.md) | Current project state, working environment, critical facts | 2026-07-27 |
| [architecture.md](./architecture.md) | High-level design, multi-tenancy, routing patterns | 2026-07-27 |
| [auth.md](./auth.md) | NextAuth v5, roles, credentials, sessions | 2026-07-27 |
| [database.md](./database.md) | Prisma schema, SQLite dev.db, migrations | 2026-07-27 |
| [api.md](./api.md) | API routes, server actions, cron jobs | 2026-07-27 |
| [frontend.md](./frontend.md) | React components, pages, Tailwind v4, routing | 2026-07-27 |
| [billing.md](./billing.md) | Plan tiers, Stripe modal, invoice PDF | 2026-07-27 |
| [pdf-reports.md](./pdf-reports.md) | PDF generation engine, puppeteer, jsPDF | 2026-07-27 |
| [multi-tenancy.md](./multi-tenancy.md) | Domain routing, middleware, agency separation | 2026-07-27 |
| [devops.md](./devops.md) | Node.js path, launch commands, env vars, ports | 2026-07-27 |
| [bugs-and-gotchas.md](./bugs-and-gotchas.md) | Known issues, workarounds, fragile code | 2026-07-27 |

---

## 📌 Recent Entries (Latest First)

| Date | Title | Category | Summary |
|------|-------|----------|---------|
| 2026-08-10 | Settings Module Full Persistence Fix | frontend | Stored all remaining mock UI states (Notifications, 2FA, GSC) in brandingJson for frontend persistence |
| 2026-07-27 | Initial Knowledge Base Bootstrap | architecture | Full project seeded from README, package.json, and codebase exploration |
| 2026-07-27 | Node.js Environment Discovery | devops | Found node.exe inside Cursor's bundled helpers; npm/pnpm not in PATH |
| 2026-07-27 | Dev Server Launch | devops | Next.js 16.2.10 launched on port 3000 using Cursor's bundled node.exe |

---

## 🔑 Quick Reference

- **Dev server command:** `& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\next\dist\bin\next" dev`
- **App URL:** http://localhost:3000
- **Super Admin login:** http://localhost:3000/login → `superadmin@rankflow.app` / `admin@123`
- **Agency login:** http://demo.localhost:3000/login → `demo@rankflow.app` / `demo123`
- **DB file:** `c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main\dev.db` (SQLite)
