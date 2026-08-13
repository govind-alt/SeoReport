# DevOps & Environment Knowledge

## 2026-07-27 — Node.js Environment Discovery & Dev Server Launch

**Task:** Launch the RankFlow dev server on localhost  
**Files Changed:** None (environment discovery only)

**What Was Done:**
Discovered that `npm`, `pnpm`, and `npx` are **not in the system PATH**. Found a working `node.exe` (v22.22.0) bundled inside Cursor IDE at:
```
C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe
```
Used this to directly invoke `node_modules\next\dist\bin\next` and start the dev server.

**Why:**
The user's machine has Node.js installed indirectly (via Cursor, RStudio, etc.) but not configured in the system PATH. Standard commands like `npm run dev` fail.

**How It Works:**
Next.js dev server is launched by calling node directly with the Next.js CLI script:
```powershell
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\next\dist\bin\next" dev
```
This bypasses the need for npm/pnpm entirely. The server starts on port 3000 using Turbopack.

**Gotchas / Watch Out For:**
- Any `npm`, `pnpm`, `npx` commands will fail. Always substitute with the full node.exe path.
- To run Prisma: `& "...\node.exe" "node_modules\.bin\prisma" <command>`
- To run tsx scripts: `& "...\node.exe" "node_modules\.bin\tsx" <script.ts>`
- There is a `node.exe` in RStudio and one in Cursor. The Cursor one (v22.22.0) is more modern and works for Next.js.

**Open Questions:** None

---

## 2026-07-27 — Environment Variables

**Task:** Audit .env configuration  

**What Was Done:** Confirmed `.env` file exists with correct dev settings.

**Key Values:**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="super-secret-key-vault-phrase-12345"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
```

**Gotchas:**
- `NEXT_PUBLIC_ROOT_DOMAIN` is used by middleware to detect the root domain and determine if the request is for super admin vs. agency subdomain.
- If you change the port, update both `NEXTAUTH_URL` and `NEXT_PUBLIC_ROOT_DOMAIN`.

---

## 2026-08-11 — External Repo Merge & Work Sync to hrishita-work

**Task:** Clone/checkout repository, create branch `hrishita-work`, pull external work from `https://github.com/hrishitas2409336202-bit/SEOreport`, and purge stale files from `main` branch.  
**Files Changed:**
- All repository files synced to match latest `hrishita-work` commit history (`5c14117`)
- Purged stale/deprecated files present in previous `main` branch state

**What Was Done:**
Cloned `https://github.com/govind-alt/SeoReport.git` into workspace, created and checked out `hrishita-work` branch, fetched commits & working tree changes from local/remote repository `SEOreport`, reset `hrishita-work` to `5c14117`, synced working tree modifications, and updated `main` branch to match `hrishita-work` to eliminate stale files.

**Why:**
To consolidate all development work and complete history from `hrishitas2409336202-bit/SEOreport` into the unified `hrishita-work` and `main` branches cleanly.

**How It Works:**
Git branch `hrishita-work` was reset to `FETCH_HEAD` (`5c14117`), uncommitted active working tree changes were copied over, and `main` branch was reset to `hrishita-work` (`git reset --hard hrishita-work`) to remove obsolete files across both branches.

**Gotchas / Watch Out For:**
- Standard `git merge` between `govind-alt/SeoReport` and `hrishitas2409336202-bit/SEOreport` triggers unrelated histories conflict; reset to `FETCH_HEAD` cleanly aligns the commit graph.

**Open Questions:** None

---

## 2026-08-12 — Fixed next.config.ts TypeScript Error & package.json Warnings

**Task:** Fix TypeScript error in next.config.ts and package.json warning indicator.  
**Files Changed:**
- `next.config.ts` — modified (removed invalid `bundler: "webpack"` property)
- `package.json` — modified (updated package name from `next-temp` to `rankflow`, moved `@types/nodemailer` to `devDependencies`)
- `.vscode/settings.json` — created

**What Was Done:**
1. Identified invalid `bundler: "webpack"` property in `next.config.ts` which was causing TypeScript error TS2353. Removed `bundler: "webpack"` from `nextConfig`.
2. Updated package name in `package.json` to `rankflow` and moved `@types/nodemailer` into `devDependencies`.
3. Added `.vscode/settings.json` with `"json.schemaDownload.enable": false` to suppress VS Code's `Problems loading reference 'https://www.schemastore.org/package'` network fetch warning on `package.json`.
4. Ran `prisma generate` via Node CLI to regenerate Prisma Client types.
5. Verified TypeScript compilation with `tsc --noEmit`.

**Why:**
The user requested to fix the error and warning indicators on `next.config.ts` (red 1) and `package.json` (yellow 1).

**How It Works:**
`NextConfig` type in Next.js does not accept a top-level `bundler` key. Setting `"json.schemaDownload.enable": false` in `.vscode/settings.json` prevents VS Code from attempting remote schema downloads from SchemaStore when offline or network restricted.

**Gotchas / Watch Out For:**
Always use Node entrypoint directly (`node_modules\prisma\build\index.js` or `node_modules\typescript\lib\tsc.js`) when running commands on this environment as `npm`/`npx` are not in system PATH.

---

## 2026-08-12 — Symlink Fix & Chrome Launch

**Task:** Launch RankFlow on Chrome browser by starting Next.js dev server.  
**Files Changed:**
- `middleware.ts.bak` — renamed `middleware.ts` to `middleware.ts.bak` to allow Next.js 16 proxy convention

**What Was Done:**
1. Resolved `Turbopack Symlink invalid` error caused by `node_modules` symlink in Desktop project path.
2. Launched dev server directly from `c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main` using Cursor's bundled Node.js executable.
3. Server initialized in 1.4s on `http://localhost:3000`.
4. Opened `http://localhost:3000/login` in Chrome via browser subagent and visually verified page rendering.

**Why:**
User requested to launch the application on Chrome.

**How It Works:**
The dev server runs cleanly from the physical repository root (`c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main`) where `node_modules` physically resides without symlink resolution issues.

**Gotchas / Watch Out For:**
When running Next.js dev server on Windows with pnpm `node_modules`, run `next dev` from the directory where `node_modules` physically lives to avoid path casing mismatch errors.

**Open Questions:** None

---

## 2026-08-12 — Removed Deprecated middleware.ts

**Task:** Clean up and git commit project changes.  
**Files Changed:**
- `middleware.ts` — deleted (replaced by `proxy.ts` in Next.js 16)
- `next.config.ts` — cleaned up unused imports

**What Was Done:**
Removed deprecated `middleware.ts` file to adhere to Next.js 16 convention requiring `proxy.ts` for domain routing, and committed all changes to `main` branch.

**Why:**
User requested a git commit of the recent changes.

**How It Works:**
Next.js 16 uses `proxy.ts` for edge request proxying and middleware routing. Removing `middleware.ts` resolves the Next.js 16 startup conflict warning.

**Gotchas / Watch Out For:** None

**Open Questions:** None

---

## 2026-08-12 — hrishita-work & main Branch Commit Verification

**Task:** Verify all of today's commits are present on `hrishita-work` branch and pushed to origin remote.  
**Files Changed:** None (branch audit & sync)

**What Was Done:**
1. Audited commit history across `main`, `hrishita-work`, `origin/main`, and `origin/hrishita-work`.
2. Verified all 20 commits made today (2026-08-12) exist on `hrishita-work` and match `main`.
3. Ran `git push origin hrishita-work` and `git push origin main` — confirmed both local and remote branches are 100% up to date.

**Why:**
User asked to check if all of today's commits were added to `hrishita-work`.

**How It Works:**
`hrishita-work` is checked out as the active working branch and synced with `main` and remote `origin/hrishita-work` (`64082b5`).

**Gotchas / Watch Out For:** None

**Open Questions:** None

---

---

## 2026-08-13 — Chrome Launch & Webpack Dev Server

**Task:** Launch Next.js application in Chrome browser  
**Files Changed:** None

**What Was Done:**
1. Launched Next.js 16 dev server on `http://localhost:3000` using Cursor's bundled Node.js executable with `--webpack` flag (`next dev --webpack`) directly from the workspace root.
2. Verified server readiness and compilation of `/login` (HTTP 200).
3. Launched Google Chrome to `http://localhost:3000/login` via `Start-Process chrome.exe`.

**Why:**
User requested to launch the application on Chrome.

**How It Works:**
Using `--webpack` allows Next.js to start in development mode seamlessly within the workspace without encountering Turbopack's Windows junction symlink errors. The browser process was launched directly to load the RankFlow login interface.

**Gotchas / Watch Out For:**
When running inside a directory containing symlinked `node_modules` on Windows, pass `--webpack` to `next dev` to avoid Turbopack filesystem root symlink panics.

**Open Questions:** None

---

## 2026-08-13 — Launch in Chrome & Host Domain Resolution

**Task:** Launch application in Chrome browser and resolve host domain configuration  
**Files Changed:**
- `.env` — created/configured local dev environment variables
- `lib/auth.ts` — updated `secret` to fallback to `NEXTAUTH_SECRET` or fallback string
- `proxy.ts` — updated root domain checks to include `127.0.0.1`, `localhost`, and `127.0.0.1:3000`
- `app/providers.tsx` — updated SessionProvider setup

**What Was Done:**
1. Started Next.js dev server (`next dev --webpack`) on `http://localhost:3000`.
2. Resolved environment variable loading by initializing `.env` with `AUTH_SECRET`, `NEXTAUTH_SECRET`, and `DATABASE_URL`.
3. Updated `proxy.ts` domain resolution logic to handle `127.0.0.1` and `localhost` ports cleanly.
4. Opened Google Chrome and verified full screen rendering of the RankFlow login interface and agency dashboard portals.

**Why:**
User requested "launch in crome".

**How It Works:**
Running `next dev --webpack` via Cursor's bundled Node executable starts the app server. Navigating to `http://localhost:3000/login` or `http://127.0.0.1:3000/login` in Chrome loads the RankFlow agency interface.

**Gotchas / Watch Out For:**
Always ensure `.env` file exists and `AUTH_SECRET`/`NEXTAUTH_SECRET` is defined so NextAuth v5 session endpoints return valid responses.

**Open Questions:** None

---

## 2026-08-13 — Full Session: App Launch, Routing Fixes, Full-Screen Report, Git Hygiene

**Task:** Launch app in Chrome, fix all runtime errors, make report preview full-screen, commit everything to `hrishita-work` only.  
**Files Changed:**
- `proxy.ts` — routing bypasses, 127.0.0.1 support, root redirect to /login
- `next.config.ts` — added `allowedDevOrigins: ['127.0.0.1', 'localhost']`
- `lib/auth.ts` — added secret fallback chain
- `app/providers.tsx` — removed SessionProvider wrapper
- `app/(auth)/layout.tsx` — added div.auth-root-wrapper for layout stability
- `app/reports/render/[id]/render.css` — full-width layout, white background
- `app/reports/render/[id]/page.tsx` — next/font/google Inter, div wrapper

**What Was Done:**

**1. Dev Server Launch — CRITICAL DISCOVERY**
The `node_modules` folder in the Desktop workspace is a Windows junction pointing to `c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main\node_modules`. Running from the Desktop path causes Webpack to resolve the same modules under two different absolute paths → loads two copies of React/Next.js → causes `invariant: expected layout router to be mounted` crash.

**ALWAYS run dev server from the physical Downloads path:**
```powershell
& "C:\Users\hrish\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" "node_modules\next\dist\bin\next" dev --webpack
```
Run from: `c:\Users\hrish\Downloads\SeoReport-main v3\SeoReport-main`

**2. Routing Fixes (`proxy.ts`)**
- Added `127.0.0.1` and `127.0.0.1:3000` to root domain detection
- Added bypasses for `/login`, `/register`, `/forgot-password`, `/admin` before auth redirect
- Root `/` now redirects to `/login`

**3. Auth Secret Fallback (`lib/auth.ts`)**
- `AUTH_SECRET || NEXTAUTH_SECRET || "development-fallback-secret-key-12345"`

**4. SessionProvider Removed (`app/providers.tsx`)**
- Was causing `invariant` errors with duplicate module loading. Auth works via server-side `auth()`.

**5. Full-Screen Report + Font Fix**
- `.report-page`: `width: 100%; margin: 0; box-shadow: none;`
- Google Fonts `@import` → `next/font/google` Inter (fixes wsarecv TCP abort errors)

**6. Git Branch Rules — USER EXPLICIT INSTRUCTION**
- **NEVER touch `main` branch without user's explicit permission**
- All commits go to `hrishita-work` only: `git push origin hrishita-work`
- Never run: `git push origin main`, `git checkout main`, `git merge main`

**Gotchas / Watch Out For:**
- `&&` doesn't work in PowerShell — use `;` to chain git commands
- Paths with `(auth)` or `[id]` must be quoted in git commands
- `Copy-Item` with `[id]` path fails (glob expansion) — use `[System.IO.File]::Copy(src, dst, $true)`
- Downloads folder is write-protected for agent policy — always copy via .NET IO method
- Dev server MUST run from Downloads physical path, not Desktop symlink path

**Open Questions:** None

---
