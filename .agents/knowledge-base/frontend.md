# Frontend Knowledge

> Maintained by Knowledge Curator. Append new entries using the format defined in SKILL.md.

## Context

- **Framework:** Next.js 16.2.10 App Router (React 19)
- **Styling:** Tailwind CSS v4 (PostCSS plugin, not CLI)
- **Icons:** lucide-react v1
- **Charts:** Recharts v3
- **Notifications:** Sonner v2
- **Forms:** react-hook-form v7 + zod v4
- **State:** Zustand v5

## Important: Tailwind v4 Differences

Tailwind v4 uses a CSS-first configuration. No `tailwind.config.js` — configuration is done in `globals.css` using `@theme` directive. Class names and utilities may differ from v3.

## Global Styles

`app/globals.css` — glassmorphism & executive dark slate theme. Check here before adding custom styles.

## Providers

`app/providers.tsx` — wraps the app with auth context (NextAuth SessionProvider) and notification provider (Sonner's Toaster).

## Layout Structure

```
app/
  layout.tsx                          ← Root layout (wraps everything)
  [domain]/
    layout.tsx                        ← Agency/client layout
    (dashboard)/
      layout.tsx                      ← Dashboard layout (sidebar, header)
      page.tsx                        ← Dashboard home
      clients/page.tsx
      reports/page.tsx
      ...
    c/
      layout.tsx                      ← Client portal layout
```

---

## 2026-07-27 — Color Scheme Updated to Black/Red

**Task:** Update the entire app color scheme from Deep Navy + Electric Blue to Obsidian Black + Crimson Red  
**Files Changed:**
- `app/globals.css` — modified

**What Was Done:**
All CSS design tokens in `:root` and `html.dark` were updated. Every blue/navy color reference replaced with black/red equivalents. Sidebar, buttons, hero banner, avatars, badge accents, glow shadows, and progress fills all updated.

**Key Token Changes:**
- `--primary`: `#4F8EF7` → `#E53E3E` (Crimson Red)
- `--primary-dark`: `#2563EB` → `#9B2C2C`
- `--navy`/sidebar-bg: `#1A1A2E` → `#0A0A0A`
- Hero banner: navy-to-blue gradient → black-to-dark-red gradient
- All `rgba(79,142,247,…)` glow values → `rgba(229,62,62,…)`

**Gotchas:**
- The design system is 100% CSS-variable driven. All components pick up changes automatically — no component files needed editing.
- Dark mode sidebar is now `#000000` (pure black) for maximum contrast.

---

## 2026-07-27 — Knowledge Curator Git Commit/Push Rule Added

**Task:** After every Knowledge Curator run, automatically git commit and push  
**Files Changed:**
- `.agents/skills/knowledge-curator/SKILL.md` — added Step 6: git commit + push
- `.agents/AGENTS.md` — updated Rule 2 to include git step and new confirmation format

**What Was Done:**
Added a mandatory Step 6 to the Knowledge Curator workflow: after writing all knowledge entries, agents must run:
```powershell
git add .agents/knowledge-base/ .agents/AGENTS.md
git commit -m "knowledge: <summary>"
git push
```

Updated the output confirmation string in both SKILL.md and AGENTS.md Rule 2.

**Why:**
User wants every knowledge base update to be version-controlled and synced to remote automatically, so knowledge is never lost and is visible in git history.

**Gotchas:**
- If `git push` fails (no remote configured, auth error), log a warning but don't block. The local commit is still valuable.
- `git` IS available in PATH on this machine (confirmed earlier via `where.exe git`).

---

## 2026-08-10 — Settings Module Full Persistence Fix

**Task:** Make all remaining mock UI settings (Notifications, Security, Integrations, Billing) fully functional and persistent  
**Files Changed:**
- `app/[domain]/(dashboard)/settings/page.tsx` — modified

**What Was Done:**
- Cleaned up duplicate modals in the Billing tab (removed static "Upgrade Plan Modal").
- Converted all local-only React state UI components (Notification toggles, 2FA toggle, Session Timeout select, Integrations connect buttons for GSC and Webhooks) into persistent functional mocks.
- Used the `brandingJson` object field on the Agency database model as a generic JSON data store to save all these disparate mock settings.
- Renamed `saveBillingState` to `saveMockState` which performs a `PATCH /api/agency/settings` pushing all UI settings into the `brandingJson` blob.

**Why:**
The user wanted the Settings page to feel "fully functional" and not lose state on page refresh. Since adding 15 new columns to Prisma for demo features is overkill, storing them in `brandingJson` provides real persistence for the frontend without database migrations.

**How It Works:**
When `page.tsx` loads, `fetch('/api/agency/settings')` retrieves the Agency object. The `brandingJson` is parsed, and any keys matching `notif*`, `mfaEnabled`, `hasGsc`, `paymentMethod`, etc. are loaded into local React state. When the user interacts with any UI element, `saveMockState({ key: newValue })` patches the entire JSON object back to the database.

**Gotchas / Watch Out For:**
- The `brandingJson` blob is now being used for settings far beyond just branding (e.g., security, billing, notifications). If the backend is ever moved to production, these should be migrated to proper database columns or a dedicated `settingsJson` field.

## 2026-08-13 — PDF Report Render Full-Screen Layout & Self-Hosted Font Fix

**Task:** Make the PDF report preview/render page (`/reports/render/[id]`) full-screen edge-to-edge on screen, and fix network font issues.  
**Files Changed:**
- `app/reports/render/[id]/render.css` — modified
- `app/reports/render/[id]/page.tsx` — modified

**What Was Done:**
1. Updated `.report-page` CSS from fixed `794px` (A4) centered layout with box-shadows to `width: 100%; max-width: 100%; margin: 0;` for full-screen edge-to-edge display on desktop screens.
2. Kept `@media print` rules intact so PDF exports and printing still enforce exact A4 dimensions and page-break handling.
3. Removed Google Fonts `@import` from `render.css` and replaced it with Next.js built-in `next/font/google` (`Inter`) in `page.tsx`.

**Why:**
- The report rendered inside a small 794px container in the browser window, leaving huge grey sidebars. User asked to "make this full screen".
- Google Fonts `@import` caused `wsarecv` / connection abort errors in local dev environment during network drops. Self-hosting via `next/font/google` bundles fonts at build time and serves them locally.

**How It Works:**
- `Inter` from `next/font/google` provides `inter.className` which is applied to the root container in `page.tsx`.
- CSS in `render.css` uses `width: 100%` on screen, expanding the cover and report sections to the full viewport width while print media queries keep exact A4 dimensions.

---

## 2026-08-14 — PDF Section Pagination Gap Removal & Natural Content Flow

**Task:** Remove large blank white space before Section 03 (Keyword Rankings) and allow sections to flow naturally without empty page bottoms.  
**Files Changed:**
- `app/reports/render/[id]/render.css` — modified
- `c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main\app\reports\render\[id]\render.css` — synced

**What Was Done:**
1. Replaced `page-break-inside: avoid` on `.report-section` with `page-break-inside: auto` in both base CSS and `@media print`.
2. Applied `page-break-inside: avoid` strictly to atomic children (`.kpi-card`, `.ranking-strip-card`, `.audit-stat`, `.rec-item`, `.data-table tr`, `.metric-bar-row`) and added `page-break-after: avoid` to `.section-header`.
3. Scaled down KPI card paddings (`18px 14px`), ranking strip card paddings (`16px 12px`), table cell paddings (`11px 14px`), and section paddings (`24px 32px`).
4. This allows subsequent sections to begin immediately on the same page where previous sections end, eliminating large empty white gaps at the bottom of PDF pages.

---






