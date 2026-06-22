# SEO Report Automation Tool — Wireframe & UI Flow

**Version:** 1.0 | **Date:** June 2026
**Design Prototype:** [View on Stitch](https://stitch.withgoogle.com/projects/1563741307647754713)

---

## 1. Overview of Screens

The web app has 4 main screens:

| Screen | Purpose |
|---|---|
| 1. Home / Landing Page | User enters a domain to generate a report |
| 2. Loading / Progress Screen | Shows real-time progress while fetching data |
| 3. SEO Report Dashboard | Full report displayed section by section |
| 4. Error Screen | Shown if domain is invalid or API fails |

---

## 2. Screen 1 — Home / Landing Page

**Purpose:** Entry point of the app. User types in a domain and clicks Generate.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         🔍 SEO Report Automation Tool           │
│                                                 │
│   Enter any website domain to get an instant   │
│   SEO report powered by SERanking API.         │
│                                                 │
│   ┌───────────────────────────────┐  ┌───────┐ │
│   │  example.com                  │  │  GO   │ │
│   └───────────────────────────────┘  └───────┘ │
│                                                 │
│   ✅ Keyword Rankings  ✅ Backlinks             │
│   ✅ Site Audit        ✅ Competitor Analysis   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Elements:**
- App title and tagline
- Domain input field (e.g. `example.com`)
- "Generate Report" button
- Feature highlights (what the report includes)

**Validations:**
- Domain must be non-empty
- Strip `https://`, `www.` automatically before sending to API
- Show inline error if format is invalid

---

## 3. Screen 2 — Loading / Progress Screen

**Purpose:** Keep user informed while API data is being fetched (can take 5–15 seconds).

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   Generating SEO Report for: example.com        │
│                                                 │
│   ████████████████░░░░░░░░  65%                 │
│                                                 │
│   ✅ Domain Overview       — Done               │
│   ✅ Keyword Rankings      — Done               │
│   ✅ Backlink Analysis     — Done               │
│   🔄 Site Audit            — In Progress...     │
│   ⏳ Competitor Analysis   — Waiting            │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Elements:**
- Domain name shown at top
- Progress bar with percentage
- Step-by-step status for each report section
- Animated spinner on current step

**Notes:**
- Site Audit is async — polling happens in background
- If any step fails, show warning but continue with remaining sections

---

## 4. Screen 3 — SEO Report Dashboard

**Purpose:** Display the full generated SEO report, section by section.

```
┌─────────────────────────────────────────────────┐
│  SEO Report — example.com          [Export PDF] │
├─────────────────────────────────────────────────┤
│  NAVIGATION                                     │
│  • Domain Overview                              │
│  • Keyword Rankings                             │
│  • Backlink Analysis                            │
│  • Site Audit                                   │
│  • Competitor Analysis                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 DOMAIN OVERVIEW                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Authority │ │ Organic  │ │Keywords  │        │
│  │  Score   │ │ Traffic  │ │  Total   │        │
│  │   42     │ │  8,500   │ │  1,240   │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│  🔑 KEYWORD RANKINGS                            │
│  ┌────────────────────────────────────────┐     │
│  │ Keyword         │ Position │ Traffic   │     │
│  │ seo tools       │    3     │  1,200    │     │
│  │ keyword rank    │    7     │    800    │     │
│  └────────────────────────────────────────┘     │
│                                                 │
│  🔗 BACKLINK ANALYSIS    (similar table)        │
│  🛠️  SITE AUDIT           (health score + list) │
│  🏆 COMPETITOR ANALYSIS  (comparison table)     │
│                                                 │
│                        [ Export PDF ] [ New ]   │
└─────────────────────────────────────────────────┘
```

**Elements:**
- Sidebar navigation to jump between sections
- Stat cards for Domain Overview (Authority, Traffic, Keywords)
- Tables for Keywords, Backlinks, Competitors
- Health score meter for Site Audit
- "Export PDF" button (top + bottom)
- "Generate New Report" button to go back to Screen 1

---

## 5. Screen 4 — Error Screen

**Purpose:** Shown if the domain is invalid, API is down, or no data is returned.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│               ⚠️  Something went wrong          │
│                                                 │
│   Could not fetch data for: invalidsite         │
│                                                 │
│   Possible reasons:                             │
│   • The domain entered may be incorrect         │
│   • No SEO data available for this domain       │
│   • SERanking API is temporarily unavailable    │
│                                                 │
│              [ Try Again ]                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 6. Full User Journey

```
[User opens app]
        ↓
[Screen 1: Enter domain]
        ↓
[Validate domain format]
        ↓ (invalid) ────────────→ [Show inline error on Screen 1]
        ↓ (valid)
[Screen 2: Loading — fetch API data]
        ↓ (API fails / no data) → [Screen 4: Error Screen]
        ↓ (success)
[Screen 3: SEO Report Dashboard]
        ↓
[User clicks Export PDF] ────────→ [PDF downloaded]
        ↓
[User clicks Generate New Report]
        ↓
[Back to Screen 1]
```

---

*SEO Report Automation Tool | UI Flow v1.0 | June 2026*
