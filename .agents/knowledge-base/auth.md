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

## 2026-07-28 17:00 IST — Resend Email Integration

**Task:** Wire real email delivery (password reset, welcome emails) using Resend API.

### Files Changed
| File | What |
|------|------|
| `.env` | Added `RESEND_API_KEY`, `FROM_EMAIL` |
| `lib/email.ts` | Full rewrite — mock replaced with real Resend calls + HTML templates |
| `app/api/auth/forgot-password/route.ts` | **NEW** — POST endpoint, generates 15-min reset token, sends email |
| `app/api/auth/reset-password/route.ts` | **NEW** — POST endpoint, validates token, hashes and stores new password |
| `app/(auth)/login/page.tsx` | Forgot Password form now calls real API, shows sent confirmation |
| `app/actions.ts` | `registerAgency` now sends welcome email via Resend after signup |

### Email Types Available
- **Welcome email** — sent on Agency signup (via `sendWelcomeEmail`)
- **Password reset** — sent on "Forgot Password" (via `sendPasswordResetEmail`)
- **Report ready** — available for future use (via `sendReportReadyEmail`)
- **Client message notification** — available for future use
- **Support ticket** — available for future use

### Security Details
- Reset tokens: 32-byte hex via `crypto.randomBytes(32)` — stored in `VerificationToken` table
- Token expiry: **15 minutes**
- Used tokens are **deleted immediately** after password reset
- User enumeration protection: API always returns success even if email not found

### Free Tier Limits (Resend)
- **3,000 emails/month** — free forever
- From address: `onboarding@resend.dev` until custom domain is verified
- To verify custom domain: Resend dashboard → Domains → Add domain

---

## [2026-08-10] Strict Role Routing & NextAuth v5 Error Handling

**Task:** Ensure the login page UI role tab strictly matches the user's actual database role, and properly block automatic account creation on Google login.
**Files Changed:**
- `lib/auth.ts` � modified
- `app/(auth)/login/page.tsx` � modified

**What Was Done:**
- Added `roleTab` to the `Credentials` provider payload to validate the selected UI tab against `user.role` from the database.
- Used Auth.js (NextAuth v5) `CredentialsSignin` class to throw auth errors (like role mismatches or 2FA checks) so that the error message makes it to the frontend without being masked as "Configuration".
- Added a `signIn` callback to check if an account exists for the email provided via Google OAuth; if not, it redirects the user to `/login?error=NoAccount` rather than auto-creating an agency.
- Updated the Login page UI to listen for `error=NoAccount` (switches to Register tab with a clear error) and `error=Configuration` (shows a descriptive server error instead of the raw keyword). Changed default tab to `Client`.

**Why:**
The user wanted strict security where a Client logging in via the Agency tab gets a direct error message telling them to switch tabs. They also did not want random users signing up via Google and automatically getting dummy agency accounts created.

**How It Works:**
When `Credentials` `authorize` is called, it checks `roleTab === 'agency' && user.role === 'client'`. If true, it throws `new CredentialsSignin()` with `.code` set to the message. NextAuth captures `.code` and forwards it to the client as `res.error`. The UI captures `res.error` and updates the `loginError` state to display the specific message in a red banner.

**Gotchas / Watch Out For:**
- Auth.js (NextAuth v5) aggressively masks unhandled `Error` objects as "Configuration". Any custom authentication failure logic MUST throw a subclass of `CredentialsSignin` and use the `.code` property for the custom message.

**Open Questions:**
None.

---
