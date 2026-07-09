<div align="center">
  <h1>🚀 RankFlow — SEO Report Automation</h1>
  <p>
    <strong>A robust, multi-tenant SaaS platform that automates monthly SEO report generation for agencies.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=Puppeteer&logoColor=white" alt="Puppeteer" />
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

## 🏗️ Architecture & Features

- **Next.js 15 App Router:** Fully utilizes the latest React Server Components paradigm for optimal data fetching and routing.
- **Dynamic Multi-Tenancy:** Uses dynamic route matching (`app/[domain]`) to isolate environments and branding for different agencies.
- **Headless PDF Generation:** Leverages a built-in Puppeteer integration to render print-optimized Next.js views into beautiful A4 PDF reports directly on the server.
- **Pure CSS Aesthetics:** Designed with custom, high-fidelity CSS for maximum control over micro-interactions and animations, avoiding generic Tailwind components.
- **Secure API Hub:** Implements a backend proxy using Next.js Route Handlers (`app/api/...`) to securely process SERanking API calls and encrypted payloads.
- **Type-Safe ORM:** Powered by Prisma for strict, scalable database schema management.

---

## 📁 Repository Structure

```text
SEOReportAutomationApp/
├── archive/src/              ← Legacy Static HTML/CSS Prototypes (Phase 1)
├── app/                      ← Next.js App Router (React Components)
│   ├── (auth)/               ← Global Authentication Routes
│   ├── [domain]/             ← Multi-tenant Subdomain Routes (Dashboard)
│   ├── api/                  ← Backend API Handlers (Puppeteer, OAuth)
│   ├── reports/render/       ← Print-optimized PDF Web Views
│   ├── globals.css           ← Core Application Styling
│   └── layout.tsx            ← Root Application Layout
├── components/               ← Reusable React UI Components (Sidebar, Charts)
├── lib/                      ← Core utilities (Auth, Encryption, Prisma)
├── prisma/                   ← Database ORM Schema
└── docs/                     ← Build Logs and Scope Specifications
```

---

## 🚀 Getting Started

Follow these steps to run the Next.js application locally.

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Environment Variables
Ensure your local `.env` file is properly configured with your database and API credentials (see `.env.example`).
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/rankflow"
```

### 3. Start the Development Server
Launch the application:
```bash
npm run dev
```

### 4. Accessing the Portals
Because RankFlow uses a dynamic domain-based routing structure, you must pass the domain identifier in the URL path during local development (e.g., `/localhost/`):
- **Login / Authentication:** [http://localhost:3000/login](http://localhost:3000/login)
- **Agency Dashboard Overview:** [http://localhost:3000/localhost/reports](http://localhost:3000/localhost/reports)
- **Settings & Config:** [http://localhost:3000/localhost/settings](http://localhost:3000/localhost/settings)

---

<div align="center">
  <p><i>Built exclusively for Digital Horizons Agency.</i></p>
</div>
