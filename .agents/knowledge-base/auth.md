# Authentication Knowledge

> Maintained by Knowledge Curator. Append new entries using the format defined in SKILL.md.

## Context

This project uses **NextAuth v5 (beta.31)** with the Prisma adapter. It uses a **Credentials provider** (email + password) with bcrypt password hashing.

### Critical: v5 vs v4 API

```typescript
// ✅ CORRECT — v5
import { auth } from "@/lib/auth"
const session = await auth()

// ❌ WRONG — v4 API, does not exist in v5
import { getServerSession } from "next-auth"
```

### Auth Config Location
- `lib/auth.ts` — main auth config (providers, callbacks, adapter)
- `app/api/auth/[...nextauth]/route.ts` — NextAuth route handler

### User Roles
- `SUPER_ADMIN` — platform-wide access to `/admin`
- `AGENCY_ADMIN` — full access to agency dashboard
- `TEAM_MEMBER` — limited agency dashboard access
- `CLIENT` — client portal only

### Session Shape (inferred)
```typescript
session.user = {
  id: string,
  email: string,
  role: "SUPER_ADMIN" | "AGENCY_ADMIN" | "TEAM_MEMBER" | "CLIENT",
  agencyDomain?: string,
  clientId?: string,
}
```

---
