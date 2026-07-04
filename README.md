<div align="center">
  <h1>🚀 RankFlow — SEO Report Automation</h1>
  <p>
    <strong>A robust, multi-tenant SaaS platform that automates monthly SEO report generation for agencies.</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
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

- **Subdomain Multi-Tenancy:** Custom Next.js middleware dynamically routes traffic based on the active subdomain (e.g., `agency.rankflow.app`).
- **Server React Components (RSC):** Fully utilizes the Next.js App Router for optimal hydration and server-side rendering.
- **Secure API Proxy:** Implements a backend proxy using Next.js API Routes to securely handle SERanking API keys and payload encryption.
- **Dynamic Charting:** Integrated `Recharts` for stunning, responsive, and animated data visualizations.
- **Type-Safe ORM:** Powered by Prisma and PostgreSQL for strict database schemas.

---

## 📁 Repository Structure

```text
SEOReportAutomationApp/
├── app/                      ← Next.js App Router (React Components)
│   ├── (auth)/               ← Global Authentication Routes
│   ├── [domain]/             ← Multi-tenant Subdomain Routes (Dashboard)
│   ├── api/                  ← Secure Backend API Proxies & Services
│   └── globals.css           ← Tailwind CSS + Core Design Tokens
├── components/               ← Reusable React UI Components (Sidebar, Topbar)
├── lib/                      ← Core utilities (Auth, Encryption, SDKs)
├── prisma/                   ← Database ORM Schema
├── src/                      ← Legacy HTML/CSS Prototypes (Phase 1)
├── docs/                     ← Architecture & Scope Specifications
└── proxy.ts                  ← Next.js Subdomain Routing Middleware
```

---

## 🚀 Getting Started

Follow these steps to run the Next.js application locally.

### 1. Installation
Clone the repository and install the dependencies using your preferred package manager.
```bash
npm install
```

### 2. Environment Variables
Copy the `.env.example` to `.env` and fill in your database and API credentials.
```bash
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
DATABASE_URL="postgresql://user:pass@localhost:5432/rankflow"
```

### 3. Start the Development Server
Launch the application with Turbopack enabled:
```bash
npm run dev
```

### 4. Accessing the Portals
Because RankFlow uses subdomain multi-tenancy, you must use a subdomain to access the Agency Dashboard during local development.
- **Main Marketing Site:** [http://localhost:3000](http://localhost:3000)
- **Agency Dashboard:** [http://test.localhost:3000](http://test.localhost:3000)
- **Client Details View:** [http://test.localhost:3000/clients/1](http://test.localhost:3000/clients/1)

> **Note on Windows:** Modern browsers like Chrome and Edge automatically resolve `*.localhost` to your local machine. If you are using an older browser or a command-line tool, you may need to map the subdomain in your `hosts` file.

---

<div align="center">
  <p><i>Built exclusively for Digital Horizons Agency.</i></p>
</div>
