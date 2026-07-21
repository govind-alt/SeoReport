<div align="center">
  <h1>🚀 RankFlow — SEO Report Automation SaaS</h1>
  <p>
    <strong>A multi-tenant white-label SaaS platform automating monthly SEO report generation, client portals, keyword research, and billing for digital agencies.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-7+-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/jsPDF-2.5-red?style=for-the-badge" alt="jsPDF" />
  </p>
</div>

---

## 🌟 Latest Major Upgrades & Features

RankFlow has been expanded with full **Super Admin Control Capabilities**, **3 Agency Operational Feature Suites**, a **Fully Functional Billing Suite**, and an **Executive High-Resolution Vector PDF Generator**.

---

### 💳 1. Fully Functional Plan & Billing Suite (`/settings?tab=billing`)
- **Interactive Subscription Plan Upgrades**: Switch between `Starter ($49/mo)`, `Pro ($149/mo)`, and `Agency ($299/mo)` tiers with real-time quota expansions (`maxClients` up to Unlimited).
- **Payment Method Management**: Dynamic card updating modal with live card brand recognition (Visa, Mastercard, Amex).
- **Stripe Billing Customer Portal Modal**: Subscription account summary displaying renewal dates, invoice history, and recipient dispatches.
- **Cancellation & Retention Workflow**: Retention offer workflow featuring a 50% discount claim or scheduled end-of-cycle cancellation.

---

### 📄 2. Executive High-Resolution Vector PDF Invoice Generator (`lib/invoicePdfGenerator.ts`)
- **High-DPI Vector Canvas Rendering**: Built a 2.5× scale `html2canvas` + `jsPDF` render engine producing crisp, printable A4 PDF documents.
- **Forced `.pdf` Filename Download**: Forced DOM download link attribute execution ensuring files save directly as `RankFlow_Invoice_INV-2026-06.pdf` across Windows, Mac, iOS, and Android.
- **Executive Invoice Preview Modal**: Live HTML modal preview on screen with single-click **Download PDF File** and **Print Invoice** options.

---

### 🎯 3. New Agency Operational Feature Suites
- **Keyword Research & Opportunity Explorer (`/keyword-explorer`)**: Analyze SERP search volumes, Keyword Difficulty (KD 0-100%), Intent categories, and 1-click tracking for client campaigns.
- **Automated Report Scheduler & Dispatcher (`/schedules`)**: Hero Automation Control Hub, background engine status indicator (`● ENGINE ACTIVE`), batch execution triggers, and live dispatch logs.
- **SEO Action Task Manager (`/tasks`)**: Hero Campaign Milestone Tracker banner with progress bars, technical audit checklists, priority filters, and client assignment.

---

### 🛠️ 4. Super Admin Control Panel (`/admin`)
- **Platform Broadcasts Center**: Compose global agency alerts, filter target audiences, and archive broadcast history.
- **Feature Flags & Tier Limits Configurator**: System Toggles for feature rollouts and tier limits manager (`Starter`, `Pro`, `Agency`).
- **Integration Gateways Monitor**: Live status dashboard and webhook log console for SE Ranking, OpenAI, Resend, and Stripe.
- **User & Agency Account Modals**: Full modals for user creation, agency edits, role assignments, and password resets.

---

## 🏗️ Project Architecture

```text
SEOReport-main/
├── app/
│   ├── [domain]/                ← Multi-tenant Agency Dashboard & Client Portal
│   │   └── (dashboard)/
│   │       ├── clients/         ← Client workspaces & detailed audit views
│   │       ├── keyword-explorer/← Keyword research & volume explorer
│   │       ├── reports/         ← PDF report generator & preview workspace
│   │       ├── schedules/       ← Automated PDF report scheduler & cron engine
│   │       ├── settings/        ← Agency branding, CNAME domain & Billing suite
│   │       └── tasks/           ← Agency SEO checklist & campaign milestone tracker
│   ├── admin/                   ← Super Admin Platform Control Panel
│   ├── api/
│   │   ├── agency/settings/     ← Agency profile & encrypted API keys
│   │   ├── billing/invoice-pdf/ ← PDF Invoice generation API endpoint
│   │   ├── clients/             ← Clients CRUD API
│   │   ├── dashboard/summary/   ← Global KPIs aggregation
│   │   └── seranking/           ← SE Ranking API proxy adapters
│   ├── globals.css              ← Glassmorphism & executive dark slate theme
│   └── providers.tsx            ← Notification & auth context providers
├── lib/
│   ├── invoicePdfGenerator.ts   ← High-res vector PDF rendering engine (html2canvas + jsPDF)
│   ├── seranking.ts             ← SE Ranking API client wrapper
│   └── prisma.ts                ← Prisma ORM client instance
└── prisma/                      ← DB schema defining multi-tenant database models
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="super-secret-key-vault-phrase-12345"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
```

### 3. Run Migrations & Launch Server
```bash
pnpm exec prisma migrate dev --name init
pnpm run dev
```

### 🔑 Credentials & Links
- **Agency Dashboard:** [http://localhost:3000/digital-horizons](http://localhost:3000/digital-horizons)
- **Plan & Billing Settings:** [http://localhost:3000/digital-horizons/settings?tab=billing](http://localhost:3000/digital-horizons/settings?tab=billing)
- **Super Admin Panel:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Login Email:** `demo@rankflow.app` | **Password:** `demo123`
