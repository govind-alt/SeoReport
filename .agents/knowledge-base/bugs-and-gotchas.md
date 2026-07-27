# Known Issues, Bugs & Gotchas

## 2026-07-27 — npm/pnpm/npx Not In PATH

**Severity:** 🔴 Critical (blocks all node execution if not known)

**Problem:** `npm`, `pnpm`, and `npx` are not available in the system PATH. All commands using these will fail with `CommandNotFoundException`.

**Workaround:**
Use the full path to Cursor's bundled node.exe:
```powershell
# Start dev server
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\next\dist\bin\next" dev

# Run any npm script equivalent
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\.bin\<tool>" <args>
```

---

## 2026-07-27 — Next.js 16.2.10 API Surface

**Severity:** 🟡 Medium

**Problem:** Next.js 16.2.10 is a post-v15 release with breaking changes in App Router APIs, server component patterns, and middleware APIs. AI agent training data may be outdated.

**Workaround:** Before writing any Next.js-specific code, check:
```
node_modules/next/dist/docs/
```
Pay special attention to:
- Route Handler conventions
- Layout and template patterns
- Server Action signatures
- Middleware matcher config

---

## 2026-07-27 — NextAuth v5 Beta API

**Severity:** 🟡 Medium

**Problem:** NextAuth v5 (beta.31) has a completely different API from v4. `getServerSession()` does not exist. Session callbacks and adapter config differ.

**Correct pattern:**
```typescript
import { auth } from "@/lib/auth"

// In server components / route handlers:
const session = await auth()
```

**Do NOT use:**
```typescript
// WRONG — v4 API, does not exist in v5
import { getServerSession } from "next-auth"
```

---

## 2026-07-27 — Subdomain Routing on Localhost

**Severity:** 🟡 Medium

**Problem:** Multi-tenant subdomain routing (e.g., `demo.localhost:3000`) requires browser support for localhost subdomains. Chrome supports this; some tools and environments do not.

**Gotcha:** When testing in the built-in browser or automated tools, subdomains may not resolve. Navigate directly to `http://demo.localhost:3000` in Chrome.

---

## 2026-07-27 — Prisma 7 with SQLite in Dev

**Severity:** 🟢 Low

**Context:** The project uses Prisma 7 with the libSQL adapter configured, but in dev mode it uses plain SQLite (`file:./dev.db`). The `prisma.config.ts` file at project root handles this.

**Gotcha:** Do not run `prisma migrate dev` casually — the dev.db already has seed data including demo users. Running a fresh migration would wipe it.

**Safe commands:**
```powershell
# Introspect schema (read-only)
& "...\node.exe" "node_modules\.bin\prisma" db pull

# Studio (GUI browser)
& "...\node.exe" "node_modules\.bin\prisma" studio
```

---
