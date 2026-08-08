<div align="center">
  <h1>🚀 RankFlow — Multi-Tenant SEO Report Automation SaaS</h1>
  <p>
    <strong>A complete white-label SaaS platform automating monthly SEO reports, client portals, keyword rank tracking, and platform management for digital marketing agencies.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16%20Turbopack-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-7+-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/SQLite-Dev.db-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
    <img src="https://img.shields.io/badge/NextAuth.js-v5-purple?style=for-the-badge" alt="NextAuth" />
    <img src="https://img.shields.io/badge/Resend-Mailer-blue?style=for-the-badge" alt="Resend" />
  </p>
</div>

---

## 🌟 Platform Highlights & Capabilities

RankFlow provides a complete three-tier architecture: **Super Admin Platform Management**, **Multi-Tenant Agency Workspaces**, and **White-Label Client Portals**.

---

### 🛡️ 1. Super Admin Platform Console (`/admin`)
- **Persistent Platform Settings (`/admin?tab=settings`)**:
  - **Platform Branding**: Custom platform brand name, support email (`hrishitavinherkar1234@gmail.com`), and system domain configuration.
  - **Access & Registration**: Interactive toggles for public self-serve registration and mandatory email verification before workspace activation.
  - **Email Delivery (Resend API Gateway)**: Configurable Resend API Key with show/hide toggle, sender address (`onboarding@resend.dev`), dedicated test recipient email field, and live delivery diagnostic modal with sandbox verification.
  - **Super Admin Credentials**: Master credential manager with bcrypt verification and SQLite database updates.
  - **System & Maintenance**: Global maintenance mode switch with real-time banner display and one-click binary SQLite `dev.db` database snapshot download (`/api/admin/settings/backup`).
- **Agency & Tenant Management**: Monitor active agencies, manage subscription quotas, assign team members, and inspect tenant usage.
- **Top Action Bar**: Instant toast feedback and persistent disk storage in `data/platform-settings.json`.

---

### 🏢 2. Multi-Tenant Agency Workspace (`/:subdomain`)
- **Executive Agency Dashboard (`/digital-horizons`)**:
  - Real-time KPI summaries: Active Clients (5), Total Reports (31), Health Scores, and Monthly Dispatch metrics.
  - Live activity feed and client health score monitoring.
- **Client Management (`/digital-horizons/clients`)**:
  - Dedicated client profiles (Acme Corp, BlueSky Marketing, GreenLeaf Organics, RetailPro Ltd, TechStart.io).
  - Domain oversight, target keywords, crawl health audit metrics, and competitor benchmarks.
- **Automated Report Engine (`/digital-horizons/reports`)**:
  - High-DPI Vector PDF report generator (`lib/invoicePdfGenerator.ts`) and interactive web report viewer.
  - White-labeled PDF branding with custom agency logos, brand colors, and executive summaries.
- **Keyword Research & SERP Tracking (`/digital-horizons/keyword-explorer`)**:
  - Search volume analysis, Keyword Difficulty (KD%), search intent categorization, and ranking trajectories.
- **Automated Cron Scheduler (`/digital-horizons/schedules`)**:
  - Automated recurring report scheduler with batch execution engine and dispatch logs.
- **Agency Settings & Custom Branding (`/digital-horizons/settings`)**:
  - Custom subdomain & CNAME domain mapping, notification email recipient settings, SE Ranking API credentials, and billing management.

---

### 👤 3. White-Label Client Portal (`/:subdomain/client`)
- **Client Self-Service Dashboard (`/digital-horizons/client`)**:
  - Dedicated portal for agency clients (e.g. Acme Corp) to review their monthly organic search performance.
  - Interactive keyword position rankings, technical audit health status, backlink summaries, and one-click PDF report downloads.

---

### 🔐 4. Authentication & Security (`lib/auth.ts`)
- **NextAuth.js Multi-Role Credentials Provider**:
  - Secure bcrypt password comparison supporting standard 6+ character passwords.
  - Brute-force rate limiting per email with automatic temporary account lockouts.
- **Google OAuth 2.0 PKCE**: Seamless single sign-on with automatic agency workspace provisioning.
- **Smart Workspace Router (`/auth-success`)**:
  - Super Admins auto-redirected to `/admin`.
  - Agency Admins auto-redirected to `/${agency.slug}` (e.g. `/digital-horizons`).
  - Clients auto-redirected to `/${agency.slug}/client`.

---

## 🔑 Demo Credentials

| Role | Email | Password | Destination Workspace |
| :--- | :--- | :--- | :--- |
| 🛡️ **Super Admin** | `superadmin@rankflow.app` | `admin@123` | [http://localhost:3000/admin](http://localhost:3000/admin) |
| 🏢 **Agency Admin** | `demo@rankflow.app` | `demo123` | [http://localhost:3000/digital-horizons](http://localhost:3000/digital-horizons) |
| 👤 **Client (Acme)** | `client@acme.com` | `client123` | [http://localhost:3000/digital-horizons/client](http://localhost:3000/digital-horizons/client) |

*Clicking any row on the demo login card automatically selects the role tab and fills the credentials.*

---

## 🏗️ Project Directory Structure

```text
SeoReport-main/
├── app/
│   ├── (auth)/
│   │   ├── login/                  ← Unified multi-role authentication page
│   │   └── auth-success/           ← Smart session-based workspace router
│   ├── [domain]/                   ← Multi-tenant Agency Dashboard & Client Portal
│   │   ├── (dashboard)/
│   │   │   ├── clients/            ← Client workspaces & detailed audit views
│   │   │   ├── keyword-explorer/   ← Keyword research & SERP volume explorer
│   │   │   ├── reports/            ← PDF report generator & preview workspace
│   │   │   ├── schedules/          ← Automated report scheduler & cron engine
│   │   │   ├── settings/           ← Agency branding, CNAME domain & notification settings
│   │   │   └── tasks/              ← SEO checklist & campaign milestone tracker
│   │   └── client/                 ← White-labeled client portal interface
│   ├── admin/                      ← Super Admin Platform Management & Settings console
│   └── api/
│       ├── admin/settings/         ← Persistent platform settings JSON storage
│       │   ├── test-email/         ← Resend test email dispatcher & diagnostics
│       │   ├── backup/             ← SQLite dev.db binary snapshot streaming
│       │   └── password/           ← Super Admin bcrypt credential updater
│       ├── seranking/              ← SE Ranking data synchronization adapters
│       └── client-portal/          ← Client portal data endpoints
├── data/
│   └── platform-settings.json      ← Persistent disk storage for Super Admin settings
├── lib/
│   ├── auth.ts                     ← NextAuth credentials & Google OAuth configuration
│   ├── prisma.ts                   ← Prisma ORM client instance
│   ├── rate-limit.ts               ← Login brute-force rate limiter
│   └── invoicePdfGenerator.ts      ← Vector PDF rendering engine (html2canvas + jsPDF)
├── prisma/
│   └── schema.prisma               ← SQLite database models (User, Agency, Client, Report, Task)
└── proxy.ts                        ← Multi-tenant hostname & subdomain router middleware
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or later
- **pnpm** / **npm** / **yarn**

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secure-random-secret-key-32-chars-min"
AUTH_SECRET="your-secure-random-secret-key-32-chars-min"
AUTH_TRUST_HOST=true
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"

# Transactional Email (Resend)
RESEND_API_KEY="re_..."
FROM_EMAIL="onboarding@resend.dev"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 3. Database Migration & Seeding
```bash
# Push database schema
npx prisma db push

# (Optional) Seed demo agencies, clients, and reports
npx prisma db seed
```

### 4. Run the Development Server
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
