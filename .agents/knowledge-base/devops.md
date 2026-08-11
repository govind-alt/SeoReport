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

