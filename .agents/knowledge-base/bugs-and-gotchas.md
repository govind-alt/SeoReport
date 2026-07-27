# 🐛 Known Bugs, Resolved Issues & Gotchas

## 1. Newly Registered Profile Infinite Loop
- **Issue**: Registering a new agency profile (e.g. `t23`) resulted in 0 clients, causing dashboard and client portal queries to return null and loop infinitely.
- **Fix**: Updated [`seedAgencyDemoData(domain)`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/app/actions.ts) and [`app/api/auth/register/route.ts`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/app/api/auth/register/route.ts) to auto-seed demo clients, 6 months of historical traffic/keyword snapshots, and reports on account registration or empty agency access.

---

## 2. Next.js 15 Async Route Params
- **Issue**: Next.js 15 treats dynamic route `params` as a Promise.
- **Fix**: Always await `params` before accessing properties:
  ```ts
  const resolvedParams = await params;
  const domain = resolvedParams.domain;
  ```

---

## 3. Windows Command Execution
- **Issue**: In PowerShell, `&&` is not a valid statement separator.
- **Fix**: Use `;` in PowerShell commands or combine scripts inside `package.json`.
