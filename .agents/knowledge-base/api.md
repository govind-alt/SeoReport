## SERanking Proxy Architecture (`lib/seranking/`)
- **Client**: [`lib/seranking/client.ts`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/lib/seranking/client.ts) (Methods: `getSites`, `getRankings`, `getCompetitors`, `getAudit`, `getBacklinks`).
- **REST Endpoints**:
  - `GET /api/seranking/projects`: Lists SERanking sites/projects with DB key decryption or fallback.
  - `GET /api/seranking/rankings?siteId=101`: Returns keyword rankings and position shifts.
- **Auth Header**: `Authorization: Token {api_key}`.

---

## API Key Security
- API keys stored in database are encrypted using **AES-256-GCM** ([`lib/encryption.ts`](file:///c:/Users/somna/OneDrive/Desktop/SEO%20TASK/SeoReport/lib/encryption.ts) `encrypt` / `decrypt`).
- Plaintext keys are never logged or transmitted to client components.
