# RankFlow Project Knowledge Base — Master Index

> **Last updated:** 2026-08-13  
> **Project:** RankFlow — SEO Report Automation SaaS  
> **Root:** `c:\Users\hrish\OneDrive\Desktop\SeoReport`

---

## 📋 About This Knowledge Base

This knowledge base is maintained automatically by the **Knowledge Curator** agent after every task completion. All AI agents working on this project **MUST** read `PROJECT_SNAPSHOT.md` and relevant category files before starting any work.

---

## 🗂 Category Files

| File | What It Covers | Last Updated |
|------|---------------|--------------|
| [PROJECT_SNAPSHOT.md](./PROJECT_SNAPSHOT.md) | Current project state, working environment, critical facts | 2026-08-12 |
| [architecture.md](./architecture.md) | High-level design, multi-tenancy, routing patterns | 2026-07-27 |
| [auth.md](./auth.md) | NextAuth v5, roles, credentials, sessions | 2026-07-27 |
| [database.md](./database.md) | Prisma schema, SQLite dev.db, migrations | 2026-07-27 |
| [api.md](./api.md) | API routes, server actions, cron jobs | 2026-07-27 |
| [frontend.md](./frontend.md) | React components, pages, Tailwind v4, routing | 2026-08-10 |
| [settings-integration-2026-08-10.md](./settings-integration-2026-08-10.md) | Details on 2FA, Webhooks, and Stripe integrations | 2026-08-10 |
| [billing.md](./billing.md) | Plan tiers, Stripe modal, invoice PDF | 2026-07-27 |
| [pdf-reports.md](./pdf-reports.md) | PDF generation engine, puppeteer, jsPDF | 2026-07-27 |
| [multi-tenancy.md](./multi-tenancy.md) | Domain routing, middleware, agency separation | 2026-07-27 |
| [devops.md](./devops.md) | Node.js path, launch commands, env vars, ports | 2026-08-12 |
| [bugs-and-gotchas.md](./bugs-and-gotchas.md) | Known issues, workarounds, fragile code | 2026-07-27 |

---

## 📌 Recent Entries (Latest First)

| Date | Title | Category | Summary |
|------|-------|----------|---------|
| 2026-08-13 | Full Session: Launch, Routing, Full-Screen Report, Git Rules | devops | Dev server symlink fix, proxy routing, auth fallback, report full-screen, git branch rules |
| 2026-08-13 | Full-Screen PDF Report Render & Local Font Fix | frontend | Made PDF report preview page full-width edge-to-edge & migrated to next/font/google |
| 2026-08-13 | Chrome Launch & Webpack Dev Server | devops | Launched Next.js dev server on http://localhost:3000 using --webpack flag & opened in Chrome |
| 2026-08-13 | Comprehensive Feature Mapping of PDF Generation | pdf-reports | Mapped all features, APIs, rendering engines, and UI components using PDF generation |
| 2026-08-12 | hrishita-work Branch Commit Verification | devops | Verified all 20 of today's commits exist on hrishita-work and are 100% in sync with main & origin remote |
| 2026-08-12 | Removed Deprecated middleware.ts | devops | Removed deprecated middleware.ts in favor of Next 16 proxy.ts convention & committed to main |
| 2026-08-12 | Symlink Fix & Chrome Launch | devops | Launched Next.js dev server on http://localhost:3000 directly from physical root & verified Chrome rendering |
| 2026-08-12 | Fixed next.config.ts TypeScript Error & package.json Warnings | devops | Removed invalid bundler prop in next.config.ts, renamed package to rankflow, moved @types to devDeps, tsc verified |
| 2026-08-11 | External Repo Sync & Stale File Cleanup | devops | Synced all commits from external repo to hrishita-work & updated main branch cleanly |
| 2026-08-10 | Strict Role Routing & NextAuth v5 Error Handling | auth | Enforced strict UI tab to DB role matching, blocked Google auto-signup, and fixed NextAuth masking errors as 'Configuration' |
| 2026-08-10 | Settings Real-World Integrations | frontend | Converted 2FA, Webhooks, and Stripe Customer Portal into real API-backed implementations |
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
