# RankFlow Build Log

This document serves as the **source of truth** for the current state of the RankFlow repository. It is heavily token-optimized to allow AI agents to instantly understand the architecture and resume development.

## Current State
**Phase 4 (Next.js Application Architecture & Refinement) is 100% COMPLETE.**
- The repository has been fully migrated from static HTML/CSS to a **Next.js 15 App Router** architecture.
- The original static wireframes are preserved in the `archive/src/` folder for reference.
- Dynamic routing, multi-tenant structures (`[domain]`), and API integrations (like headless PDF generation) are fully functional.

## Repository Architecture

### 1. Global Configuration
- **Next.js 15 App Router:** The application utilizes the new app router paradigm, including `page.tsx`, `layout.tsx`, and `route.ts` conventions.
- **Styling:** We maintained the pure, high-fidelity CSS styling from Phase 1 (`app/globals.css`, `app/marketing.css`), avoiding Tailwind to preserve the exact pixel-perfect aesthetics of the original designs.
- **Database / Auth:** Prisma schema is configured with SQLite/PostgreSQL support. NextAuth is set up in `lib/auth.ts`, though Google OAuth is currently mocked to bypass directly into the dashboard for rapid prototyping.

### 2. Multi-Tenant Dashboard (`app/[domain]/(dashboard)`)
The core SaaS portal is built with multi-tenant routing, dynamically determining the agency environment based on the `[domain]` parameter.
- **Routing Note:** Next.js 15 handles dynamic route params as Promises. We successfully unwrapped these using `React.use(params)` to prevent sync-API access errors.
- **Dashboard (`page.tsx`):** Features interactive Recharts graphs for sessions and keywords, KPI cards, and functional action buttons.
- **Clients (`clients/page.tsx` & `clients/[clientId]/page.tsx`):** Client management tables and detailed drill-down views.
- **Reports (`reports/page.tsx`):** The reporting hub for tracking and generating white-labeled PDF reports.
- **Settings (`settings/page.tsx`):** Agency branding, API configurations, and billing settings.
- **Help Center (`help/page.tsx` & `help/guide/[id]/page.tsx`):** Interactive knowledge base cards with functional dedicated article pages.
- **Sidebar Navigation:** A unified `Sidebar.tsx` component automatically injects the current tenant's domain into all navigation links to prevent 404s.

### 3. Headless PDF Generation (`app/reports/render` & `app/api/reports/generate`)
- We built a powerful headless PDF rendering pipeline.
- The `app/reports/render/[id]/page.tsx` route acts as a print-optimized web view, specifically styled to look exactly like an A4 document on screen.
- `app/api/reports/generate/route.ts` spins up a **Puppeteer** headless browser in the background. It navigates to the render page and snaps a high-fidelity PDF. 
- *Windows Resolution Note:* The API explicitly falls back to the system's local Google Chrome or Microsoft Edge executable to ensure PDF generation works flawlessly across OS environments without false-positive antivirus blocks.

### 4. Authentication (`app/(auth)/login`)
- A unified login portal supporting sign-in, registration, and password resets.
- "Sign in with Google" has been explicitly mocked to simulate a successful login and route the user directly to the dashboard, ensuring a seamless prototype experience without requiring complex Google Cloud API setups.

## Getting Started
To run the Next.js development server locally:
```bash
npm run dev
```
Then open `http://localhost:3000/localhost/reports` or `http://localhost:3000/login` in your browser.

## Next Steps (Phase 5)
- **Goal:** Connect the real SERanking API endpoints.
- **Focus:** Replace the dummy JSON data in the dashboard and client drill-downs with live data fetched via Server Actions or API routes.
- **Database:** Finalize the Prisma database migrations to store connected API keys, agency brand settings, and synced historical data.
