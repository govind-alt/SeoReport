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
