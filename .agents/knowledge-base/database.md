# Database Knowledge

> Maintained by Knowledge Curator. Append new entries using the format defined in SKILL.md.

## Context

- **ORM:** Prisma v7
- **Dev DB:** SQLite (`file:./dev.db`) — 303 KB, has seeded demo data
- **Prod adapter:** `@prisma/adapter-libsql` or `@prisma/adapter-pg` (depending on deployment)
- **Schema:** `prisma/schema.prisma`
- **Config:** `prisma.config.ts` at project root

## Critical Rules

- **Do NOT run `prisma migrate dev`** casually — it wipes seed data
- Safe read-only commands: `prisma db pull`, `prisma studio`
- For schema changes: `prisma db push` (applies without migration file)

## Prisma Client

Single client instance in `lib/prisma.ts`. Import it as:
```typescript
import { db } from "@/lib/prisma"
// or
import prisma from "@/lib/prisma"
// (check the actual export name in lib/prisma.ts before using)
```

## Known Seeded Users

| Email | Role | Password |
|-------|------|----------|
| superadmin@rankflow.app | SUPER_ADMIN | admin@123 |
| demo@rankflow.app | AGENCY_ADMIN | demo123 |
| client@acme.com | CLIENT | client123 |

---

## 2026-08-17 — Supabase-Ready Architecture & Prisma 7 Model Enhancements

**Task:** Advance database architecture with Supabase compatibility, Supabase Storage client, and new schema models.  
**Files Changed:**
- `prisma/schema.prisma` — added `AuditLog`, `GoogleCredential`, and `Competitor` models
- `lib/supabase.ts` — created Supabase Storage helper (`uploadToSupabaseStorage`, `getSupabasePublicUrl`)

**What Was Done:**
1. Built Supabase Storage helper (`lib/supabase.ts`) supporting upload & public URL generation for white-label agency logos, PDF report downloads, and branding assets.
2. Added 3 new Prisma models (`AuditLog`, `GoogleCredential`, `Competitor`).
3. Ran `prisma db push` to sync new models with SQLite `dev.db` while preserving existing seed data.
4. Regenerated Prisma Client and verified 0-error TypeScript compilation.

**Why:**
User requested advancing database capabilities with Supabase PostgreSQL readiness.

**How It Works:**
`lib/supabase.ts` handles Supabase Storage bucket operations with local fallback, while Prisma 7 handles multi-tenant database operations with PostgreSQL compatibility.

---

## 2026-08-18 — Minimalist Database Optimization & Secondary Tables Purge

**Task:** Prune 5 optional tables (`SERankingProject`, `Competitor`, `WebhookEndpoint`, `AuditLog`, `Notification`) and link SEO snapshot models directly to `Client`.  
**Files Changed:**
- `prisma/schema.prisma` — optimized to 7 core application models and 4 SEO snapshot models
- `scripts/seed.ts` — updated to attach snapshots directly to `Client`
- `scripts/test-db.js` — streamlined database test suite for core models
- `lib/webhook-dispatcher.ts` & notification API routes — adjusted for lightweight operation

**What Was Done:**
1. Dropped `SERankingProject`, `Competitor`, `WebhookEndpoint`, `AuditLog`, and `Notification` from Supabase PostgreSQL.
2. Directly attached `KeywordSnapshot`, `BacklinkSnapshot`, `AuditSnapshot`, and `AnalyticsSnapshot` to `Client` (eliminating unnecessary join hops).
3. Pushed clean schema to Supabase PostgreSQL and seeded complete demo workspace.
4. Ran `scripts/test-db.js` with 100% pass rate.
5. Verified authentication via `scripts/test-login.ts` (100% success).

**Why:**
User requested removing all optional/secondary tables to keep Supabase as clean, performant, and minimal as possible.

---

## 2026-08-18 — Database Pruning & Unnecessary Tables Removal

**Task:** Remove 5 unused and redundant database tables (`Message`, `GoogleCredential`, `Account`, `Session`, `VerificationToken`) from Supabase PostgreSQL and Prisma schema.  
**Files Changed:**
- `prisma/schema.prisma` — removed 5 unused models and cleaned relations in `Agency`, `User`, `Client`
- `lib/auth.ts` — removed unnecessary `PrismaAdapter` (using JWT strategy)
- `app/api/admin/stats/route.ts` & `app/api/admin/activity/route.ts` — cleaned stats and activity feed
- `app/api/messages/...` — cleaned dummy responses for deprecated message routes
- `scripts/test-db.js` — updated test suite for the 12 active models

**What Was Done:**
1. Dropped `Message`, `GoogleCredential`, `Account`, `Session`, and `VerificationToken` tables from Supabase PostgreSQL via `prisma db push --accept-data-loss`.
2. Regenerated Prisma Client (`prisma generate`).
3. Ran `scripts/test-db.js` verifying 100% pass rate across all 12 remaining core models.
4. Ran `scripts/test-login.ts` verifying all login flows remain 100% operational.

**Why:**
User requested removing all unnecessary and redundant tables from the Supabase database to keep the schema clean and minimal.

---

## 2026-08-18 — Supabase PostgreSQL Database Integration & Schema Migration
 
**Task:** Configure and migrate database to Supabase PostgreSQL, connect Prisma 7 via `@prisma/adapter-pg`, and seed all demo data.  
**Files Changed:**
- `.env` — added Supabase `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `prisma/schema.prisma` — configured provider `postgresql`
- `prisma.config.ts` — configured datasource URL routing to `DIRECT_URL` for migrations
- `lib/prisma.ts` — migrated client to `@prisma/adapter-pg` with `pg.Pool` and `dotenv/config`
- `scripts/seed.ts` & `scripts/test-db.js` — updated to test/seed Supabase PostgreSQL

**What Was Done:**
1. Configured Supabase project credentials in `.env` with connection pooler and direct URLs.
2. Switched Prisma provider to `postgresql`.
3. Pushed all 17 schema tables directly into Supabase PostgreSQL (`prisma db push`).
4. Seeded superadmin, agency admin, clients, SERanking projects, snapshots, and reports via `scripts/seed.ts`.
5. Executed `scripts/test-db.js` against Supabase PostgreSQL with 100% test suite pass rate.
6. Verified password hashing comparison and authentication against Supabase PostgreSQL for all demo roles.

**Why:**
User requested setting up Supabase as the primary live database for the RankFlow SaaS application.

---

## 2026-08-18 — SQLite Schema Sync & Agency Status Column Fix

**Task:** Fix `SQLITE_ERROR: no such column: main.Agency.status` runtime driver adapter error.  
**Files Changed:**
- `dev.db` — synced schema columns with `prisma db push`

**What Was Done:**
1. Ran `node_modules/prisma/build/index.js db push` to synchronize SQLite `dev.db` with the current `prisma/schema.prisma` definition.
2. Regenerated Prisma Client (`prisma generate`).
3. Ran `scripts/test-db.js` verifying 100% pass rate across all 17 models, relational integrity, CRUD tests, and unique constraints.

**Why:**
The SQLite database file `dev.db` was missing the `status` column on the `Agency` table that was recently introduced in `prisma/schema.prisma`.

**How It Works:**
`prisma db push` introspects `prisma/schema.prisma` and applies missing columns and indexes directly to SQLite `dev.db` without wiping the seeded data.

---



