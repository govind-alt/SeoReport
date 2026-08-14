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

## 2026-08-12 — Topbar.tsx Entire File Red (Missing React Import)

**Severity:** 🔴 High (all JSX in file flagged as errors)

**Problem:** `Topbar.tsx` used `React.ReactNode` and `React.MouseEvent` without importing React. With the new JSX transform, you don't need React for JSX syntax, but **you still need it for namespace types like `React.ReactNode` and `React.MouseEvent`**. This caused the entire file to show cascading red errors in VS Code.

**Fix:** Add `import React from 'react'` at the top of the file.

**Files affected:**
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\components\ui\Topbar.tsx`

---

## 2026-08-12 — Array Index Access Undefined Type Error (Sidebar/Topbar)

**Severity:** 🟡 Medium

**Problem:** TypeScript strict mode flags `array[0]` as `string | undefined`. Using it directly in `.includes()` or ternary without narrowing causes a type error. Both `Topbar.tsx` and `Sidebar.tsx` had this pattern with `pathSegments[0]` / `segments[0]`.

**Fix:** Use `?? ''` fallback and `.length > 0` guard:
```typescript
// ❌ Wrong
const firstSeg = pathSegments[0];
const isDomain = firstSeg && !['...'].includes(firstSeg);

// ✅ Correct
const firstSeg = pathSegments[0] ?? '';
const isDomain = firstSeg.length > 0 && !['...'].includes(firstSeg);
```

**Files affected:**
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\components\ui\Topbar.tsx` (2 occurrences)
- `c:\Users\hrish\OneDrive\Desktop\SeoReport\components\ui\Sidebar.tsx` (1 occurrence)

---

## 2026-08-12 — Dev Server Must Run from Downloads Folder (Turbopack Symlink Bug)

**Severity:** 🔴 Critical (dev server won't start from workspace)

**Problem:** The workspace at `c:\Users\hrish\OneDrive\Desktop\SeoReport` has no `node_modules`. The actual `node_modules` are in `c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main\`. Turbopack (Next.js 16 default) crashes with `Symlink [project]/node_modules is invalid` when a Windows junction is used. `--no-turbopack` flag does not exist in Next.js 16.

**Workaround:** Always run the dev server from the Downloads folder, NOT the workspace:
```powershell
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\next\dist\bin\next" dev
# CWD: c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main
```

After editing files in the workspace (`OneDrive\Desktop\SeoReport`), sync changed files with:
```powershell
Copy-Item "c:\Users\hrish\OneDrive\Desktop\SeoReport\components\ui\Topbar.tsx" "c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main\components\ui\Topbar.tsx" -Force
```

---

## 2026-08-14 — globals.css CSS Cascade Bleeds into Report Render Page

**Severity:** 🔴 High (causes visual regression — red bar on KPI cards)

**Problem:** The report render page (`/reports/render/[id]`) shares the root layout which loads `app/globals.css`. That global stylesheet defines `.kpi-card.accent::after` (and similar pseudo-element rules) using the `--primary` CSS variable which resolves to red (`#E53E3E` or similar). This causes a bright red bar to appear at the top of all `.kpi-card.accent` elements on the report page, even though `render.css` defines completely different styles.

**Root Cause:** Next.js App Router loads the root `layout.tsx` for all routes including `/reports/render/[id]`, which means ALL global CSS is always in scope. The pseudo-element rule in globals.css wins over the render.css styles due to specificity.

**Fix Applied in render.css:**
```css
/* Suppress globals.css pseudo-element leak */
.report-page .kpi-card::before,
.report-page .kpi-card::after,
.report-page .kpi-card.accent::before,
.report-page .kpi-card.accent::after {
  display: none !important;
  content: none !important;
}
```

Also use `!important` on the accent card background to ensure the gradient wins:
```css
.kpi-card.accent {
  background: linear-gradient(to bottom, #0F3460 3px, #F4F7FF 3px) !important;
  border: 1px solid #BFCEF7;
}
```

**Also Fixed in This Session:**
1. **Cover page height** — Added `min-height: 100vh` to `.cover` + `flex: 1` on `.cover-inner` so the cover fills the full screen in browser preview.
2. **Footer text clipped** — Added explicit `.footer-left { display: flex; flex-direction: column; gap: 3px; }` and `white-space: nowrap` to prevent "Prepared exclusively for..." text being truncated.
3. **kpi-card-top-bar divs removed from JSX** — The absolutely-positioned `<div className="kpi-card-top-bar">` elements were removed from `page.tsx` entirely (replaced by background-gradient approach in CSS).

**File Sync Reminder:** Since the workspace is a symlink, ALL CSS/TSX changes must be copied to the physical Downloads path using the PS1 script at:
```
C:\Users\hrish\.gemini\antigravity-ide\brain\543b0153-cd61-45c7-8f2c-8e9c854f6255\scratch\copy_all.ps1
```

**Files Changed:**
- `app/reports/render/[id]/render.css` — cover, footer, and KPI card fixes
- `app/reports/render/[id]/page.tsx` — removed kpi-card-top-bar divs from JSX

---
