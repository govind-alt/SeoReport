# Multi-Tenancy Knowledge

> Maintained by Knowledge Curator. Append new entries using the format defined in SKILL.md.

## Context

### How Multi-Tenancy Works

RankFlow uses **subdomain-based multi-tenancy**. The middleware reads the hostname of incoming requests and extracts the subdomain to determine which agency workspace to serve.

```
localhost:3000              → Root (Super Admin area)
demo.localhost:3000         → Agency workspace for "demo"
acme.localhost:3000         → Agency workspace for "acme"
demo.localhost:3000/c/      → Client portal under agency "demo"
```

### Middleware

Middleware file (likely `middleware.ts` at project root) intercepts all requests, extracts the subdomain, and maps it to the `[domain]` dynamic segment in the App Router.

### Environment Variable

`NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"` — used to detect the root domain and separate it from agency subdomains.

### Browser Requirement

Subdomain routing on localhost requires Chrome. Some tools and environments (curl, basic fetch, etc.) may not resolve subdomains to localhost automatically.

---
