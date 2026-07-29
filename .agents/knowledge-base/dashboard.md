# Dashboard Features

> Maintained by Knowledge Curator. Append new entries using the format defined in SKILL.md.

---

## 2026-07-28 17:15 IST — Analytics, PDF Export, and Competitor Analysis

**Task:** Finalize core reporting features including real Analytics DB integration, PDF export via html2canvas/jsPDF, and a new Competitor Analysis page.

### Files Changed / Created
| File | What Changed |
|------|-------------|
| `app/[domain]/(dashboard)/clients/[clientId]/page.tsx` | Replaced placeholder analytics tab with real Recharts graphs and DB data. Added "PDF" download button to Reports tab. |
| `app/api/seranking/analytics/route.ts` | **NEW** — API endpoint that reads analytics snapshots from DB (current, previous, history). |
| `app/api/seranking/competitors/route.ts` | **NEW** — API endpoint that fetches competitors via `SERankingClient` or falls back to rich mock data. |
| `app/[domain]/(dashboard)/competitor-analysis/page.tsx` | **NEW** — Full page with RadarChart, BarChart, sortable tables, and KPI cards. |
| `components/ui/Sidebar.tsx` | Added `Competitor Analysis` link to the main navigation menu using the `Target` icon. |

### Feature Details

#### 1. Client Analytics Tab
- Integrates with the `sERankingProject.analyticsSnapshots` relation.
- Displays 6-month historical trend line chart for organic sessions.
- Calculates month-over-month percentage changes for Sessions, Clicks, and Impressions.
- Includes Top Queries and Top Pages tables (parsed from JSON in the DB).

#### 2. PDF Report Export
- Implemented purely on the client-side inside `PrintButton.tsx`.
- Uses `html2canvas` and `jsPDF`.
- Renders the report DOM into a canvas at `3x` scale for crisp text.
- Automatically calculates intelligent page breaks between `.report-section` boundaries to prevent text cutoff.
- Forces A4 proportions via inline styles before snapshotting, then restores original styles.

#### 3. Competitor Analysis Page
- Accessible via the sidebar menu.
- Visualizes competitor data (Visibility, Traffic, Keywords, Trust Score, Avg Position) using Recharts (Radar + Bar).
- Includes an interactive table that can be sorted by any column.
- Clicking a competitor row highlights it and updates the Radar chart profile at the top.
- Gracefully falls back to mock data with a "Demo Data" badge if no SE Ranking API key is configured.

---
