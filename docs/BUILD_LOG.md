# RankFlow Build Log

This document serves as the **source of truth** for the current state of the RankFlow repository. It is heavily token-optimized to allow AI agents to instantly understand the architecture and resume development.

## Current State
**Phase 1 (Static UI/UX Prototypes) is 100% COMPLETE.**
- The repository strictly contains pure HTML/CSS/JavaScript files.
- There is NO React, Next.js, Node.js, Prisma, or backend infrastructure currently in the codebase.
- The `wireframes/` folder contains the original un-split source designs.

## Repository Architecture

All production-ready HTML wireframes are located in `src/`.

### 1. Global Assets
- `src/css/styles.css`: Contains ALL global styling, variables, layout grids, components (cards, buttons, inputs), and responsive media queries.
- `src/js/app.js`: The global JavaScript controller. It handles:
  - Sidebar toggling and active states.
  - Tabs and Modal opening/closing (`Modal.open('id')`).
  - Toast notifications (`Toast.success('msg')`).
  - Chart.js rendering and dummy data generation.
  - Table filtering and bulk actions.

### 2. Marketing & Auth Pages
- `index.html`: Public marketing site explaining the product.
- `login.html`: Unified authentication page. Contains a **Role Selector** (Agency / Client / Admin) that dynamically routes the user to the correct portal upon sign-in. All login paths (Standard, Google, Password Reset) pass through a centralized `routeToRoleDashboard()` JavaScript function.
- `onboarding.html`: The multi-step agency setup wizard.

### 3. Agency Portal (Core SaaS)
The dashboard used by SEO Agencies.
- `dashboard.html`: Main analytics overview.
- `clients.html`: Client management and bulk actions.
- `client-detail.html`: Deep dive into a specific client's metrics.
- `reports.html`: Report generation, scheduling, and history.
- `settings.html`: White-labeling, API integrations (SERanking), billing, and team management.
- `help.html`: Knowledge base and support.
- `report-pdf.html`: The standalone white-labeled HTML template that gets converted to PDF for clients.

### 4. Client Portal
The restricted view where an agency's clients log in to see their own metrics.
- `client-portal-dashboard.html`: Read-only analytics overview for the client.
- `client-portal-reports.html`: Archive of past reports.

### 5. Superadmin Portal
The overarching system dashboard used by RankFlow operators to manage tenant agencies.
- `superadmin-dashboard.html`: Global MRR, active agencies, and system health.
- `superadmin-agencies.html`: Tenant management, impersonation, and manual provisioning.

## Getting Started
To view the prototype locally:
```bash
npx serve src -p 3000
```
Then open `http://localhost:3000/login.html` in your browser.

### Live Deployment
The project is configured for continuous deployment to **GitHub Pages**. 
Any push to the `main` branch automatically triggers the `.github/workflows/pages.yml` workflow, which deploys the `src/` directory to the live public URL: `https://govind-alt.github.io/SeoReport/`.

## Next Steps (Phase 2)
The next major architectural shift is the Next.js App Router migration.
- **Goal**: Port `src/` HTML into React Server Components.
- **Stack**: Next.js 15, TailwindCSS (optional, standard CSS preferred to keep Phase 1 aesthetics), Prisma (PostgreSQL), NextAuth.
- **Rule**: Phase 2 must maintain pixel-perfect fidelity with the Phase 1 UI.
