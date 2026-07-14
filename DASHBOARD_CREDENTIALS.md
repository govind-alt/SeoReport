# RankFlow — 3 Dashboard Credentials

## 🔑 Login Credentials (Demo Mode)

| Role | Email | Password | Dashboard URL |
|------|-------|----------|--------------|
| **Super Admin** | `superadmin@rankflow.app` | `admin@123` | `http://localhost:3000/login` |
| **Agency Admin** | `demo@rankflow.app` | `demo123` | `http://demo.localhost:3000/login` |
| **Client (Acme Corp)** | `client@acme.com` | `client123` | `http://demo.localhost:3000/c/login` |

---

## Dashboard Sections

### 1. Super Admin Dashboard (`/admin/...`)
- **Overview**: Total agencies, MRR, system health, active users
- **Agencies**: Table of all registered agencies + status
- **Users**: All platform users with role management
- **System Health**: API latency, DB metrics, error rates
- **Billing**: Revenue, plan upgrades, invoices

### 2. Agency Dashboard (`/[domain]/(dashboard)/...`)
- **Dashboard**: KPI cards, traffic/keyword charts, activity feed
- **Clients**: Client cards with health scores, add/manage
- **Reports**: Generate, preview, download, share PDF reports
- **Settings**: Agency profile, SE Ranking API key, branding

### 3. Client Dashboard (`/[domain]/c/dashboard`)
- **Overview**: My SEO performance, health score, traffic
- **Rankings**: Keyword positions table + trend sparklines
- **Reports**: View/download past reports delivered by agency
- **Contact Agency**: Direct messaging/request form
