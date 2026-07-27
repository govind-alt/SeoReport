# 🗄️ Database Schema & Database Explorer

## Prisma Schema Models (`prisma/schema.prisma`)
The schema defines 15 core Prisma models:
- `Agency`, `User`, `Client`, `KeywordSnapshot`, `AnalyticsSnapshot`, `AuditSnapshot`, `BacklinkSnapshot`, `Report`, `ReportSchedule`, `AuditLog`, `ApiQuota`, `BroadcastBanner`, `EmailVerificationToken`, `Invitation`, `SERankingProject`.

---

## Database Explorer REST API (`app/api/superadmin/database/route.ts`)
Provides full REST CRUD endpoints for superadmins:
- `GET /api/superadmin/database?model={ModelName}&search={Query}&page=1&limit=25`
- `POST /api/superadmin/database` — Body: `{ model, data }`
- `PUT /api/superadmin/database` — Body: `{ model, id, data }`
- `DELETE /api/superadmin/database?model={ModelName}&id={RecordId}`

---

## Database Explorer UI (`app/superadmin/database/page.tsx`)
Features live table selection, column filtering, search query matching, record modal editing, 1-click **Export CSV**, and **Export JSON**.
