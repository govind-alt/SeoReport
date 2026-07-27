# 🔌 API Client & SERanking Integration

## SERanking Proxy Architecture (`lib/seranking/`)
- Integrates with SERanking REST API for rank tracking, site audit scores, backlink profiles, and organic traffic estimation.
- Auth Header: `Authorization: Token {api_key}`.

---

## API Key Security
- API keys stored in database are encrypted using **AES-256** (`ENCRYPTION_SECRET`).
- Plaintext keys are never logged or transmitted to client components.
