# SERanking API Research Document

**Version:** 1.0 | **Date:** June 2026
**Base URL:** `https://api.seranking.com`
**Auth:** `Authorization: Token YOUR_API_KEY` (header on every request)

---

## 1. What is the SERanking API?

SERanking is an all-in-one SEO platform. Their Data API gives programmatic access to the same data their dashboard shows — keyword rankings, backlinks, site audits, and competitor analysis — for any domain.

We use this API as the **single data source** for our automation tool.

---

## 2. Authentication

Every API request must include this header:

```
Authorization: Token YOUR_API_KEY
Content-Type: application/json
```

The API key is stored securely in a `.env` file and never pushed to GitHub.

---

## 3. Endpoints We Will Use

### 3.1 Account Check
**Purpose:** Verify the API key is valid before making any other calls.

| Field | Value |
|---|---|
| Endpoint | `/v1/account/subscription` |
| Method | GET |
| Use When | App startup — confirm key works |

**Sample Response:**
```json
{
  "plan": "Pro",
  "requests_remaining": 4850,
  "requests_limit": 5000
}
```

---

### 3.2 Domain Overview
**Purpose:** Get top-level SEO metrics for any domain — authority score, organic traffic, total keywords.

| Field | Value |
|---|---|
| Endpoint | `/v1/domain/overview/db` |
| Method | POST |
| Key Input | `domain`, `db` (database/country e.g. "us") |

**Sample Request Body:**
```json
{
  "domain": "example.com",
  "db": "us"
}
```

**Sample Response:**
```json
{
  "domain_trust": 42,
  "organic_traffic": 8500,
  "organic_keywords": 1240,
  "paid_traffic": 0
}
```

---

### 3.3 Keyword Rankings
**Purpose:** Get the top keywords a domain ranks for, their positions, and traffic estimates.

| Field | Value |
|---|---|
| Endpoint | `/v1/keywords/overview` |
| Method | POST |
| Key Input | `domain`, `db`, `page`, `size` |

**Sample Request Body:**
```json
{
  "domain": "example.com",
  "db": "us",
  "page": 1,
  "size": 50
}
```

**Sample Response:**
```json
{
  "keywords": [
    {
      "keyword": "seo tools",
      "position": 3,
      "traffic": 1200,
      "difficulty": 67,
      "serp_features": ["featured_snippet"]
    }
  ]
}
```

---

### 3.4 Backlink Summary
**Purpose:** Get backlink stats for a domain — total links, referring domains, anchor texts.

| Field | Value |
|---|---|
| Endpoint | `/v1/backlinks/summary` |
| Method | POST |
| Key Input | `domain` |

**Sample Request Body:**
```json
{
  "domain": "example.com"
}
```

**Sample Response:**
```json
{
  "total_backlinks": 15400,
  "referring_domains": 820,
  "new_backlinks": 34,
  "lost_backlinks": 12,
  "top_anchors": ["seo tool", "keyword tracker", "example"]
}
```

---

### 3.5 Site Audit — Launch
**Purpose:** Start a site audit for a domain. This is **asynchronous** — it returns an audit ID, not the results immediately.

| Field | Value |
|---|---|
| Endpoint | `/v1/site-audit/audits/standard` |
| Method | POST |
| Key Input | `domain` |
| Returns | `audit_id` to poll later |

**Sample Request Body:**
```json
{
  "domain": "example.com"
}
```

**Sample Response:**
```json
{
  "audit_id": "abc123xyz",
  "status": "in_progress"
}
```

> ⚠️ **Important:** Site Audit is NOT instant. After launching, you must poll the status endpoint until it returns `"status": "completed"` before fetching the report. See Section 3.6.

---

### 3.6 Site Audit — Fetch Report
**Purpose:** Retrieve the completed site audit report using the `audit_id` from the launch step.

| Field | Value |
|---|---|
| Endpoint | `/v1/site-audit/audits/report` |
| Method | GET |
| Key Input | `audit_id` (query param) |

**Polling Flow:**
```
Launch audit → get audit_id
        ↓
Poll every 5 seconds:
GET /v1/site-audit/audits/report?audit_id=abc123xyz
        ↓
If status = "in_progress" → wait and poll again
If status = "completed"   → use the report data
If status = "failed"      → show error, skip audit section
```

**Sample Response (completed):**
```json
{
  "status": "completed",
  "health_score": 78,
  "critical_errors": 3,
  "warnings": 14,
  "notices": 22,
  "issues": [
    { "type": "missing_meta_description", "pages": 5 },
    { "type": "broken_links", "pages": 2 }
  ]
}
```

---

### 3.7 Competitor Analysis
**Purpose:** Get the top competing domains for a given domain and compare keyword overlap and traffic.

| Field | Value |
|---|---|
| Endpoint | `/v1/competitors/overview` |
| Method | POST |
| Key Input | `domain`, `db` |

**Sample Request Body:**
```json
{
  "domain": "example.com",
  "db": "us"
}
```

**Sample Response:**
```json
{
  "competitors": [
    {
      "domain": "competitor1.com",
      "common_keywords": 340,
      "organic_traffic": 22000
    },
    {
      "domain": "competitor2.com",
      "common_keywords": 210,
      "organic_traffic": 15000
    }
  ]
}
```

---

## 4. API Limits & Best Practices

| Topic | Detail |
|---|---|
| Rate Limiting | SERanking throttles heavy usage — add retry logic with delay |
| Site Audit | Always async — never treat it as an instant call |
| No Data Case | Some domains return empty data — handle gracefully, don't crash |
| API Key Security | Store in `.env` only, never hardcode or push to GitHub |
| Caching | Cache results by domain + date to avoid repeat API calls |
| Error Codes | 401 = bad key, 429 = rate limited, 404 = endpoint wrong |

---

## 5. Summary Table

| Section | Endpoint | Method | Async? |
|---|---|---|---|
| Account Check | /v1/account/subscription | GET | No |
| Domain Overview | /v1/domain/overview/db | POST | No |
| Keyword Rankings | /v1/keywords/overview | POST | No |
| Backlink Summary | /v1/backlinks/summary | POST | No |
| Site Audit Launch | /v1/site-audit/audits/standard | POST | **Yes** |
| Site Audit Report | /v1/site-audit/audits/report | GET | **Yes (poll)** |
| Competitor Analysis | /v1/competitors/overview | POST | No |

---

*SERanking API Research | v1.0 | June 2026 | github.com/govind-alt/SeoReport*
