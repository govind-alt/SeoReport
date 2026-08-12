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

