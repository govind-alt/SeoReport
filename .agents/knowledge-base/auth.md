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
- `lib/rate-limit.ts` — in-memory brute-force rate limiter (max 5 attempts / 15 min per email)
- `app/api/auth/[...nextauth]/route.ts` — NextAuth route handler

### User Roles
- `SUPER_ADMIN` — platform-wide access to `/admin`
- `AGENCY_ADMIN` — full access to agency dashboard
- `TEAM_MEMBER` — limited agency dashboard access
- `CLIENT` — client portal only

### Session Shape
```typescript
session.user = {
  id: string,
  email: string,
  name: string | null,
  image: string | null,
  role: "superadmin" | "admin" | "member" | "client",
  agencyId: string | null,
}
```

---

## 2026-07-28 16:36 IST — Security Hardening (JWT + Auth)

**Task:** Secure Google Auth, JWT, registration and login flows end-to-end.

### Changes Made

| File | What Changed |
|------|-------------|
| `.env` | Replaced weak hardcoded secret with a cryptographically-secure 64-byte random `AUTH_SECRET` |
| `lib/auth.ts` | Full rewrite — see below |
| `lib/rate-limit.ts` | **NEW** — in-memory rate limiter |
| `app/actions.ts` | `registerAgency` + `registerClient` hardened |
| `app/(auth)/login/page.tsx` | Shows specific error messages, routing via `/auth-success` |

### JWT Security (lib/auth.ts)
- `session.strategy = "jwt"` with 24-hour `maxAge` and 1-hour `updateAge`
- Token carries `id`, `name`, `email`, `role`, `agencyId`, `picture`
- On every Google sign-in, `agencyId` and `role` are **re-fetched from DB** (cannot be spoofed via token)
- `AUTH_SECRET` environment variable is now mandatory — no hardcoded fallback

### Brute-Force Protection (lib/rate-limit.ts)
- Per-email rate limiter: max **5 failed attempts** within **15 minutes**
- On 5th failure, account is **locked for 15 minutes**
- Rate limit is **cleared automatically** on successful login
- Login page now surfaces the exact remaining lock time to the user

### Google OAuth Security
- Added `checks: ["state", "pkce"]` — PKCE (Proof Key for Code Exchange) + state verification
- `prompt: "select_account"` forces Google account chooser on every sign-in
- New Google users automatically get an Agency created via `events.createUser`

### Registration Hardening
- **Email validation**: regex check before DB lookup
- **Password policy**: minimum 8 characters enforced on both Agency and Client registration
- **Email normalization**: all emails stored as `trim().toLowerCase()` — prevents duplicate accounts with different case
- **Subdomain validation**: `^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$` regex
- **bcrypt cost**: bumped from 10 → **12** (significantly stronger hashing)
- Duplicate email error now says: *"An account with this email already exists. Please sign in instead."* (clear, actionable)

### Login Page
- Error message is now **dynamic** — shows specific message from the server (rate-limit timer, etc.)
- Credentials are normalized (trimmed + lowercased) before sending
- Post-login routing goes through `/auth-success` which reads DB role → redirects to correct dashboard

---
