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

