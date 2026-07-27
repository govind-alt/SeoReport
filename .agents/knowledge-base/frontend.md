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
