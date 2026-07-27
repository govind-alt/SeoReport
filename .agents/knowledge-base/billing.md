# 💳 Billing & Agency Tiers

## Subscription Tiers (`Agency.plan`)
- **`starter`**: Up to 5 clients, basic report generation.
- **`professional`**: Up to 25 clients, automated monthly scheduling, white-label branding.
- **`enterprise`**: Unlimited clients, priority API quotas, custom subdomains.

---

## Billing Management (`app/[domain]/(dashboard)/billing/page.tsx`)
- Displays current active plan, credit usage, payment methods, and downloadable invoice PDFs (`app/invoices/[id]/page.tsx`).
