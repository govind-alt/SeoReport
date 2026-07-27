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
