<div align="center">
  <h1>🚀 RankFlow — SEO Report Automation</h1>
  <p>
    <strong>A robust, multi-tenant SaaS platform that automates monthly SEO report generation for agencies.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-7+-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
  </p>
</div>

---

## 🎯 Phase 2-5 Features & Improvements

RankFlow is now fully functional from Phase 2 up to the completion of **Phase 5**, including major upgrades to white-label branding, API routes, mock data fallback modes, and premium UI aesthetics.

### Key Upgrades:
- **Upgraded Database Schema:** Restructured snaps and reports database schema using Prisma. Added `SERankingProject` models and enhanced reporting configuration arrays (`sectionsJson`, `aiRecsJson`, `shareSlug`).
- **Interactive Demo Mode:** The system automatically falls back to **rich, highly detailed demo data** if no SE Ranking API key is configured. Agencies can present the entire client portal experience (all 7 tabs, including historic Area/Line charts, keyword position gains, backlinks count, and site audit issue warnings) immediately to clients.
- **Premium white-label UI Overhaul:**
  - Animated sidebars with modern Lucide SVG icons.
  - Interactive tab switches with charts, custom metric rings, and indicator badges.
  - Custom glassmorphic modals for report generation and bulk operations.
  - WHITE-LABEL branding color picking preview support in agency Settings.

---

## 🏗️ Project Architecture

```text
SEOReport-main/
├── app/
│   ├── [domain]/             ← Multi-tenant Subdomain Dashboard views
│   │   └── (dashboard)/
│   │       ├── clients/      ← Clients List and Detail view tabs
│   │       ├── reports/      ← Reports list and preview workspace
│   │       └── settings/     ← Agency profile and branding config
│   ├── api/
│   │   ├── agency/settings/  ← White-label preferences and encrypted keys
│   │   ├── clients/          ← Clients CRUD API
│   │   ├── dashboard/summary/← Global KPIs API aggregation
│   │   └── seranking/        ← API proxy adapters for rank/audit logs
│   ├── globals.css           ← Advanced glassmorphism theme system
│   └── providers.tsx         ← Session Provider and Sonner notification context
├── components/               ← Reusable layout items
├── lib/                      ← Encryption tools and SERanking API wrappers
├── scripts/                  ← Database seeding scripts for demo presentations
└── prisma/                   ← DB Schema defining multi-tenant indexes
```

---

## 🚀 Local Installation & Seeding

Follow these steps to run the Next.js application locally with the pre-configured developer demo dataset:

### 1. Install Dependencies
Make sure you use **pnpm** (version 11+) to handle package generation:
```bash
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="super-secret-key-vault-phrase-12345"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
```

### 3. Apply Schema Migrations
```bash
pnpm exec prisma migrate dev --name init
```

### 4. Seed the Database
Run the TypeScript seed script using `tsx` to import the 5 preconfigured client records, monthly organic traffic lines, keyword snaps, and audit alerts:
```bash
pnpm exec tsx scripts/seed.ts
```

### 5. Launch the Development Server
```bash
pnpm run dev
```

### 🔑 Demo Portal Credentials
- **Access URL:** [http://localhost:3000/login](http://localhost:3000/login)
- **Login Email:** `demo@rankflow.app`
- **Password:** `demo123`
