# Billing Knowledge

> Maintained by Knowledge Curator. Append new entries using the format defined in SKILL.md.

## Context

### Plan Tiers
| Plan | Price | Max Clients |
|------|-------|-------------|
| Starter | $49/mo | Limited |
| Pro | $149/mo | More |
| Agency | $299/mo | Unlimited |

### Features
- Interactive plan upgrades via `/settings?tab=billing`
- Payment method modal with live card brand detection (Visa, Mastercard, Amex)
- Stripe Billing Customer Portal modal (subscription summary, renewal dates, invoice history)
- Cancellation workflow with 50% retention offer or scheduled end-of-cycle cancellation

### Invoice PDF Generator
- Located: `lib/invoicePdfGenerator.ts`
- Technique: 2.5× scale `html2canvas` + `jsPDF` for crisp A4 PDFs
- API endpoint: `app/api/billing/invoice-pdf/`
- Downloads as: `RankFlow_Invoice_INV-2026-XX.pdf`

---

## 2026-08-17 — Subscription Tier Upscaling & Superadmin Subscription Management

**Task:** Upscale subscription billing tiers across the platform and add complete Superadmin controls to modify, upgrade, downgrade, cancel, or reactivate agency subscriptions.

**What Changed:**
- **Single Source of Truth (`lib/plans.ts`)**: Built unified plan config with 4 active upscaled tiers:
  - **Starter** ($49/mo): 5 clients, 50 kw/client, core white-label PDFs.
  - **Professional (Pro)** ($149/mo): 25 clients, 250 kw/client, GSC/GA4, AI recommendations.
  - **Agency** ($399/mo): 500 clients, 1,000 kw/client, REST API, Webhooks, custom domain.
  - **Enterprise** ($799/mo): Unlimited clients & keywords, dedicated CDN, SLA guarantee.
  - **Canceled** ($0/mo): Suspended access state.
- **Server Actions (`app/actions.ts`)**: Added `cancelAgencySubscriptionSuperadmin` and `reactivateAgencySubscriptionSuperadmin` with automated `Notification` and `AuditLog` logging.
- **Superadmin Console (`app/admin/page.tsx` & `app/superadmin/SuperadminClient.tsx`)**:
  - Added `📦 Plan` button in Agencies table.
  - Interactive **Manage Subscription Plan** modal showing all 4 plan cards.
  - **Cancel Subscription** warning confirmation modal.
  - Reactivation selector for canceled agencies.
- **Agency Billing (`app/[domain]/(dashboard)/billing/BillingClient.tsx`)**:
  - Updated Change Plan modal to render all 4 upscaled tiers dynamically.
  - Added warning banner for canceled subscriptions with one-click reactivation link.

**Gotchas / Watch Out For:**
- The Notification schema uses `body` (not `message`) and `read` (not `isRead`).
- MRR computations use `getPlanMRR(planId)` to keep financial stats accurate across all components.

**Open Questions:** None

