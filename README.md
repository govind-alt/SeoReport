<div align="center">
  <img src="https://via.placeholder.com/120x120/6366f1/ffffff?text=RF" alt="RankFlow Logo" width="80" height="80" style="border-radius: 20px;" />
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

We are currently operating in a two-phase development lifecycle. **Phase 1 (UI/UX Prototype) is 100% complete.**

```text
SEOReportAutomationApp/
├── README.md                 ← You are here
├── src/                      ← Phase 1: High-Fidelity HTML/CSS Frontend Prototype
│   ├── index.html            (Marketing Landing Page)
│   ├── login.html            (Authentication Flow)
│   ├── dashboard.html        (Agency Dashboard)
│   ├── reports.html          (Automated Report Management)
│   ├── report-pdf.html       (Printable PDF Output Template)
│   ├── client-portal-*.html  (End-Client Read-Only Portal)
│   ├── superadmin-*.html     (SaaS Owner Global Dashboard)
│   ├── css/                  (Vanilla CSS Design System)
│   └── js/                   (Frontend Interactivity & Charts)
├── docs/                     ← Architecture & Scope Specifications
└── AI_PROJECT_CONTEXT.md     ← AI Generation Context
```

---

## 🚀 Phase 1: HTML Prototype (Completed)

The `src/` directory contains the fully responsive, production-ready frontend templates built with HTML, CSS, and vanilla JS. It features a bespoke design system utilizing CSS variables for easy white-labeling, micro-animations, and integrated Chart.js visualizations.

**To run the Phase 1 prototype:**
1. Clone the repository.
2. Use an extension like [Live Server (VS Code)](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) to serve the `src/` directory.
3. Start by opening `src/index.html`.

---

## 🏗️ Phase 2: Next.js Full-Stack Migration (Incoming)

The next step for this repository is migrating the pristine HTML/CSS templates into a robust React application.

**Target Tech Stack:**
- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Styling:** TailwindCSS (porting existing design tokens)
- **Background Jobs:** Inngest (for automated monthly SERanking syncing)

*The `src/` directory will soon be refactored into Next.js components and routes.*

---

<div align="center">
  <p>Built exclusively for Digital Horizons Agency.</p>
</div>
