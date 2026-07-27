<div align="center">
  <h1>🚀 RankFlow — SEO Report Automation</h1>
  <p>
    <strong>A multi-tenant SaaS platform that automates monthly SEO report generation for agencies.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=Puppeteer&logoColor=white" alt="Puppeteer" />
    <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge" alt="Status" />
  </p>
</div>

---

## 🎯 Project Overview

RankFlow connects directly with the **SERanking API** and **Google Search Console** to automatically generate stunning, 100% white-labeled PDF and web reports for SEO agencies.

It is engineered as a **Multi-Tenant SaaS** platform utilizing Next.js subdomain routing, providing three distinct portal experiences:
1. **Agency Dashboard:** Where SEO teams manage their clients, configure integrations, and view global KPIs.
2. **Client Portal:** A secure, read-only interface where an agency's clients can view their historical reports and metrics.
3. **Superadmin Panel:** The master administrative dashboard for the SaaS owner to manage agency subscriptions, MRR, and platform limits.

---

## ✅ Current Build Status

| Phase | Focus | Status |
|---|---|---|
| Phase 0 | Foundation & Setup | ✅ Complete |
| Phase 1 | Auth & Multi-Tenancy | ✅ Complete |
| Phase 2 | SERanking Integration | ✅ Complete |
| Phase 3 | Dashboard & Clients | ✅ Complete |
| Phase 4 | Report Engine (Puppeteer PDF) | ✅ Complete |
| Phase 5 | Automation & Email | ✅ Complete |
| Phase 6 | Client Portal | ✅ Complete |
| Phase 7 | Branding & White-label | ✅ Complete |
| Phase 8 | Polish & Error Handling | ✅ Complete |
| Phase 9 | Launch Prep & Finalization | ✅ Complete |

## ⚡ 1-Minute Quick Start (Running on Any New Device)

RankFlow is engineered for **100% device portability**. You can run the project on any Windows, macOS, or Linux machine in 3 simple steps:

### Option A: Via Git Clone
```bash
# 1. Clone the repository
git clone https://github.com/govind-alt/SeoReport.git
cd SeoReport

# 2. Copy the pre-configured local environment file
cp .env.example .env   # (On Windows CMD: copy .env.example .env)

# 3. One-Command Setup (Installs packages, initializes DB, seeds test accounts)
npm run setup

# 4. Start the application
npm run dev
```

### Option B: Via File / ZIP Transfer
1. Copy or extract the project folder to your target machine.
2. Ensure `.env` exists (if missing, copy `.env.example` to `.env`).
3. Open a terminal in the folder and run:
   ```bash
   npm install
   npm run setup
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser. All test users (`superadmin@rankflow.app`, `sarah.jenkins@digitalhorizons.com`, `john@acmestore.com`) will work instantly with password **`Password123!`**.

---

## 🏗️ Architecture & Features

- **Next.js 16 App Router:** Fully utilizes the latest React Server Components paradigm for optimal data fetching and routing.
- **Dynamic Multi-Tenancy:** Uses dynamic route matching (`app/[domain]`) to isolate environments and branding for different agencies.
- **Headless PDF Generation:** Leverages a built-in Puppeteer integration to render print-optimized Next.js views into beautiful A4 PDF reports directly on the server.
- **Per-Agency White-Labeling:** Brand colors, logo, and font are loaded from the database and injected as CSS custom properties on every page render — zero flicker.
- **Real Email System:** Nodemailer-based transactional email for report-ready notifications, team invites, client portal invites, and welcome emails. Falls back to console.log in development when SMTP is not configured.
- **Automated Monthly Reports:** Vercel cron job runs on the 1st of every month to auto-generate reports for all clients with active schedules.
- **Secure API Hub:** Implements a backend proxy using Next.js Route Handlers (`app/api/...`) to securely process SERanking API calls with AES-256 encrypted API key storage.
- **Built-in Billing Module:** Fully wired Stripe Billing implementation supporting multi-tiered Agency plans (Starter, Professional, Enterprise) and usage metrics.
- **Superadmin Database Explorer:** Secure, in-app GUI for platform owners to directly view and query all raw database tables without external tools.
- **Type-Safe ORM:** Powered by Prisma for strict, scalable database schema management.
- **Error Boundaries:** Per-section error boundaries with friendly recovery UI for both the agency dashboard and client portal.

---

## 📁 Repository Structure

```text
SeoReport/
├── app/                          ← Next.js App Router
│   ├── (auth)/                   ← Login, register, forgot-password
│   ├── [domain]/
│   │   ├── (dashboard)/          ← Agency dashboard (multi-tenant)
│   │   │   ├── page.tsx          ← Main dashboard with KPI charts
│   │   │   ├── clients/          ← Client list + [clientId] drill-down
│   │   │   ├── reports/          ← Report list + [reportId] detail
│   │   │   ├── settings/         ← Branding, API keys, team, billing
│   │   │   ├── help/             ← Knowledge base
│   │   │   ├── industry/         ← Industry benchmarks
│   │   │   ├── error.tsx         ← Error boundary
│   │   │   └── loading.tsx       ← Loading skeleton
│   │   ├── c/                    ← Client portal (magic link login)
│   │   │   ├── dashboard/        ← Client-facing dashboard
│   │   │   ├── login/            ← Magic link login page
│   │   │   └── error.tsx         ← Client portal error boundary
│   │   ├── r/[slug]/             ← Public shareable report URL
│   │   └── onboarding/           ← Agency onboarding wizard (4 steps)
│   ├── superadmin/               ← Global admin panel (MRR, agencies)
│   ├── api/
│   │   ├── auth/                 ← NextAuth endpoints
│   │   ├── reports/[id]/         ← Report GET + regenerate POST
│   │   ├── cron/monthly-reports/ ← Vercel cron (secured)
│   │   ├── seranking/            ← SERanking API proxy
│   │   └── webhooks/daily-sync/  ← Daily data sync webhook
│   └── reports/render/[id]/      ← Print-optimized PDF web view
├── lib/
│   ├── auth.ts                   ← NextAuth config (Credentials + Google + Magic Link)
│   ├── branding.ts               ← Per-agency CSS var generation
│   ├── email.ts                  ← Nodemailer transactional email
│   ├── encryption.ts             ← AES-256 API key encryption
│   ├── report-compiler.ts        ← Puppeteer PDF compilation
│   ├── prisma.ts                 ← Prisma singleton
│   └── seranking/                ← SERanking API client
├── prisma/schema.prisma          ← Full DB schema
├── .env.example                  ← Environment variable template
├── vercel.json                   ← Vercel cron configuration
└── TESTING.md                    ← Test credentials and seeded data
```

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

The minimum required variables for local development:

```bash
# SQLite works out of the box — no DATABASE_URL needed for local dev
NEXTAUTH_SECRET="any-random-string"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_SECRET="exactly-32-characters-long-here!"
```

### 3. Database Setup

```bash
npx prisma migrate dev
npx prisma db seed    # Seeds test users and demo data (see TESTING.md)
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Accessing the Portals

| Portal | URL |
|---|---|
| Login / Auth | http://localhost:3000/login |
| Agency Dashboard | http://localhost:3000/localhost |
| Client Portal | http://localhost:3000/localhost/c/dashboard |
| Superadmin Panel | http://localhost:3000/superadmin |

See [TESTING.md](./TESTING.md) for all seeded login credentials.

---

## 🌐 Production Deployment

### Deploying to Vercel

1. Push this repo to GitHub
2. Import into Vercel
3. Set all environment variables from `.env.example` in the Vercel dashboard
4. Use a **PostgreSQL** database (e.g., Supabase, Neon, or Vercel Postgres)
5. Run `npx prisma migrate deploy` to apply schema to production DB
6. Deploy — the cron job in `vercel.json` will auto-configure

> **Note:** Wildcard subdomain support (`*.youragency.app`) requires a Vercel **Pro** plan.

### Key Production Env Vars

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | JWT signing secret (32+ chars) |
| `NEXTAUTH_URL` | Your production app URL |
| `ENCRYPTION_SECRET` | 32-char AES-256 key for API key encryption |
| `CRON_SECRET` | Vercel cron auth secret |
| `EMAIL_SERVER_*` | SMTP credentials for email delivery |

---

<div align="center">
  <p><i>Built exclusively for Digital Horizons Agency.</i></p>
</div>
