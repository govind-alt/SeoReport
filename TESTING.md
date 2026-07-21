# 🔑 RankFlow Testing Guide & Login Credentials

This document provides a reference of the seeded login credentials, user roles, security boundaries, and dynamic functions implemented for testing the multi-tenant SEO Report Automation app.

---

## 👥 Test User Credentials

Use these accounts to test login, dashboards, and role boundary restrictions. All users are seeded in the database.

| User Role | Login Email | Password | Target Dashboard / Workspace | Enforced Role Boundaries |
| :--- | :--- | :--- | :--- | :--- |
| 💼 **Agency Admin** | `admin@agency.com` | `password123` | [http://localhost:3000/localhost](http://localhost:3000/localhost) | Blocked from `/superadmin` and client portal dashboards |
| 🍕 **Zomato Client** | `client@zomato.com` | `password123` | [http://localhost:3000/localhost/c/dashboard](http://localhost:3000/localhost/c/dashboard) | Blocked from agency admin settings and other client dashboards |
| 🛵 **Swiggy Client** | `client@swiggy.com` | `password123` | [http://localhost:3000/localhost/c/dashboard](http://localhost:3000/localhost/c/dashboard) | Blocked from Zomato and Flipkart dashboards |
| 🛍️ **Flipkart Client** | `amit@flipkart.com` | `password123` | [http://localhost:3000/localhost/c/dashboard](http://localhost:3000/localhost/c/dashboard) | Blocked from other clients' metrics |
| 👑 **Global Superadmin** | `superadmin@rankflow.app` | `superadmin123` | [http://localhost:3000/superadmin](http://localhost:3000/superadmin) | Full global visibility across all tenants |

---

## 🔒 Security & Tenant Boundaries

The application uses server-side session checks and database-level boundaries to prevent unauthorized or cross-tenant access:

1. **Agency Admin Console (`/[domain]/`)**:
   - Access is restricted to `admin` and `superadmin` accounts.
   - Cross-agency isolation checks verify that the logged-in admin's `agencyId` matches the domain slug requested in the URL. If an admin tries to alter the URL parameter to inspect another agency, they are redirected back to their own workspace or login screen.
2. **Client Portal (`/[domain]/c/dashboard`)**:
   - Access is restricted strictly to accounts with the `client` role.
   - Client database separation ensures that a client portal user sees **only** their own dashboard performance snapshots and monthly reports, dynamically resolved based on their login session email.
3. **Global Control Panel (`/superadmin`)**:
   - Locked strictly to `superadmin` users. Anyone attempting to visit without permissions will be redirected to the main login.

---

## 📊 Seeded Performance Metrics & Reports

The database has been pre-populated with realistic historic search visibility logs:
- **6 Active Client Profiles**: Amazon India, Flipkart, Myntra, Zomato, Swiggy, and Paytm.
- **6 Months of Performance Snapshots**: Dynamic chart lines for traffic sessions (GSC click metrics), keyword positions (SERanking Top 3/10/100 distribution), backlinks reference metrics, and site health audits.
- **3 Months of Monthly Reports**: Pre-rendered report items available on client and admin lists. Clicking a report triggers the background Puppeteer PDF renderer dynamically to produce a ready-to-view A4 report.
