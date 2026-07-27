# 🏗️ Architecture & Component Structure

## Next.js 15 App Router Layout

```
app/
├── (auth)/                     # /login, /login/client, /login/admin, /register
├── (dashboard)/                # Agency tenant dashboard (/[domain])
│   ├── clients/                # Client list & drill-down views
│   ├── reports/                # Report generator & builder
│   ├── audit-issues/           # Site health diagnostic center
│   └── settings/               # Agency settings & API key management
├── (client-portal)/            # /c/dashboard (Read-only client view)
├── api/
│   ├── auth/                   # NextAuth API endpoints
│   ├── seranking/              # SERanking proxy & sync endpoints
│   ├── reports/                # Headless PDF generation endpoint
│   └── superadmin/database/    # Database Explorer REST CRUD API
├── superadmin/                 # Master Superadmin console & Database Explorer UI
└── r/[shareSlug]/              # Public shareable report page
```

---

## Data Flow & Server Actions
- **Data Mutation**: Handled via Server Actions in [`app/actions.ts`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/app/actions.ts).
- **Parallel Query Execution**: DB queries execute via `Promise.all` to minimize latency.
- **Subdomain Middleware**: [`middleware.ts`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/middleware.ts) rewrites incoming hostname subdomains to `/[domain]/...` dynamically.
