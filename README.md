<div align="center">
  <img src="src/assets/logo.png" alt="RankFlow Logo" width="80" height="80" style="border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
  <h1 align="center">RankFlow — SEO Report Automation</h1>
  <p align="center">
    <strong>A multi-tenant SaaS platform that automates monthly SEO report generation for SEO agencies and their clients.</strong>
  </p>
</div>

---

## 🎯 Project Overview

RankFlow connects directly with the **SERanking API** and **Google Search Console** to automatically generate stunning, 100% white-labeled PDF and web reports for SEO agencies. 

It is designed as a Multi-Tenant SaaS platform with three distinct portal experiences:
1. **Agency Dashboard:** Where SEO teams manage their clients, configure integrations, and view global KPIs.
2. **Client Portal:** A secure, read-only interface where an agency's clients can view their historical reports and metrics.
3. **Superadmin Control Panel:** The master administrative dashboard for the SaaS owner to manage agency subscriptions, MRR, and platform API limits.

---

## 📁 Repository Structure

We are currently operating in a two-phase development lifecycle. **Phase 1 (UI/UX Prototype) is complete, and Phase 2 (Next.js Application) is in progress.**

```text
SEOReportAutomationApp/
├── app/                      ← Phase 2: Next.js App Router (React Components)
│   ├── (dashboard)/          ← Agency Dashboard Routes
│   ├── globals.css           ← Tailwind CSS + Design Tokens
│   └── layout.tsx            ← Root React Layout
├── components/               ← Phase 2: Reusable React UI Components
│   └── ui/                   (Sidebar, Topbar, KPI Cards)
├── prisma/                   ← Phase 3: Database ORM
│   └── schema.prisma         (Multi-tenant Postgres Schema)
├── src/                      ← Phase 1: High-Fidelity HTML/CSS Frontend Prototype
│   ├── dashboard.html        (Original HTML Prototype)
│   ├── css/styles.css        (Original Vanilla CSS Design System)
│   └── ...                   (Other HTML templates)
├── docs/                     ← Architecture & Scope Specifications
│   ├── AI_PROJECT_CONTEXT.md (AI Context rules)
│   └── AGENTS.md             (Subagent documentation)
├── public/                   ← Static assets (Logos, Fonts)
└── README.md                 ← You are here
```

---

## 🚀 Phase 1: HTML Prototype (Completed)

The `src/` directory contains the fully responsive, production-ready frontend templates built with HTML, CSS, and vanilla JS. It features a bespoke design system utilizing CSS variables for easy white-labeling, micro-animations, and integrated Chart.js visualizations.

**To run the Phase 1 prototype:**
1. Clone the repository.
2. Use an extension like [Live Server (VS Code)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) to serve the `src/` directory.
3. Start by opening `src/index.html`.

---

## 🏗️ Phase 2: Next.js Full-Stack Application (In Progress)

The HTML/CSS templates from Phase 1 are currently being migrated into a robust React application in the root `app/` directory.

**Target Tech Stack:**
- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** TailwindCSS v4 + Custom Design Tokens
- **Components:** React Server Components (RSC)

**To run the Phase 2 Next.js App:**
1. Run `npm install`
2. Run `npm run dev`
3. Open `http://localhost:3000/dashboard`

---

<div align="center">
  <p>Built exclusively for Digital Horizons Agency.</p>
</div>
