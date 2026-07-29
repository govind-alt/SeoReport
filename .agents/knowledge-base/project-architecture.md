# RankFlow — Project Architecture Overview
**Last Updated:** 2026-07-29T10:41 IST

---

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **DB ORM:** Prisma 7 (SQLite `dev.db` for dev, supports PostgreSQL via libsql/pg adapter)
- **Auth:** NextAuth v5 (`@auth/prisma-adapter`)
- **UI:** Vanilla CSS (no Tailwind) with custom design system
- **Charts:** Recharts
- **Email:** Nodemailer + Resend
- **SEO Data:** SE Ranking API v3
- **PDF Generation:** Puppeteer

---

## Routing Architecture

### Multi-Tenant Pattern
The app uses `[domain]` as a dynamic segment for agency routing:
```
/[domain]/(dashboard)/         → Dashboard home
/[domain]/(dashboard)/reports  → Reports list
/[domain]/(dashboard)/clients  → Client management
/[domain]/(dashboard)/settings → Agency settings
/report/[slug]                 → Public shared report
/reports/render/[id]           → PDF render template (used by Puppeteer)
```

### Auth Pages
```
/login        → Agency admin login
/register     → New agency registration
```

---

## Database Schema (Key Models)

### Agency
```
id, name, slug, subdomain, serankingApiKey (encrypted), brandingJson, plan, users[], clients[]
```

### User
```
id, name, email, password (bcrypt), role (admin|member), agencyId
```

### Client
```
id, name, domain, industry, contactEmail, agencyId, serankingProjectId (Int?), reports[], serankingProject
```

### Report
```
id, clientId, periodStart, periodEnd
status: 'draft' | 'generating' | 'done' | 'failed'
sectionsJson, shareSlug, viewCount, generatedAt
```

### Snapshots (all have @@unique([serankingProjectId, date]))
- `KeywordSnapshot` — top3Count, top10Count, top100Count, avgPosition
- `AuditSnapshot` — healthScore, pagesCrawled, criticalIssues, warningIssues
- `BacklinkSnapshot` — domainTrust, totalBacklinks, referringDomains
- `AnalyticsSnapshot` — organicSessions, clicks, impressions, ctr

---

## SE Ranking Integration

### API Key Flow
1. User pastes key in Settings → Integrations
2. `PATCH /api/agency/settings` saves encrypted key via `encrypt()` from `lib/encryption.ts`
3. On sync/process: key is decrypted via `decrypt()` and passed to `new SERankingClient(apiKey)`

---

## Report Generation Flow
1. User clicks "Generate" → `POST /api/reports` → creates DB record with `status: 'generating'`
2. `POST /api/reports` fire-and-forgets `POST /api/reports/[id]/process`
3. `/process` endpoint:
   - Fetches data from SE Ranking (if API key configured)
   - Saves snapshots to DB
   - Updates report `status: 'done'`
4. Frontend polls `GET /api/reports` every 3 seconds while any report is `generating`
5. When `status === 'done'`: user can preview, download PDF, or share

### PDF Generation
- Puppeteer renders `/reports/render/[id]` page
- `PrintButton.tsx` component triggers print dialog or Puppeteer call
- Report render template: `app/reports/render/[id]/page.tsx`
