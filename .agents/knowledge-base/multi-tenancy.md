# 🌐 Multi-Tenancy Architecture

## Wildcard Subdomain & Path Routing
RankFlow supports dual multi-tenancy access:
1. **Subdomain Syntax**: `agency-name.rankflow.app` or `t23.localhost:3000`
2. **Path Syntax**: `localhost:3000/t23` or `rankflow.app/agency-name`

---

## Middleware Resolution (`middleware.ts`)
The middleware checks the `Host` header:
- Standard platform root (`localhost:3000`, `rankflow.app`, `www.rankflow.app`) passes directly to Next.js routes.
- Subdomain requests (e.g. `t23.localhost:3000/c/dashboard`) are rewritten internally to `app/[domain]/c/dashboard/page.tsx` with `domain = "t23"`.

---

## Automatic Demo Data Seeding
If an agency tenant has zero clients or metrics (e.g. newly registered agency `t23`), [`seedAgencyDemoData(domain)` in `app/actions.ts`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/app/actions.ts) automatically seeds:
- 3 demo clients (`Acme E-Commerce Store`, `Apex Tech Solutions`, `GreenEarth Organics`)
- 6 months of historical keyword and traffic snapshots
- Technical site health audit snapshots & PDF reports
