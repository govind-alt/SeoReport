# 🔐 Authentication & Role-Based Access Control (RBAC)

## User Roles Hierarchy
- **`superadmin`**: Platform owner — access to Superadmin Console, Database Explorer, API credit allocations, security logs, and user role management.
- **`admin`**: Agency owner — access to agency tenant dashboard, client management, SERanking API keys, branding settings, and report generation.
- **`member`**: Agency team member — view clients, track keyword rankings, trigger site audits, draft reports.
- **`client`**: End-client — read-only access to client portal dashboard (`/c/dashboard`), traffic charts, and report downloads.

---

## NextAuth Provider Config (`lib/auth.ts`)
- Credentials provider uses bcrypt password hashing.
- Fallback verification for demo accounts: `Password123!`, `password123`, `superadmin123`.
- Automatic hash sync on successful login.

---

## 1-Click Test Credentials Matrix

| Role | Portal URL | Email | Password |
|---|---|---|---|
| 🛡️ **Superadmin** | `/login/admin` | `superadmin@rankflow.app` | `Password123!` |
| 🏢 **Agency Admin** | `/login` | `sarah.jenkins@digitalhorizons.com` | `Password123!` |
| 👤 **Agency Client** | `/login/client` | `john@acmestore.com` | `Password123!` |
