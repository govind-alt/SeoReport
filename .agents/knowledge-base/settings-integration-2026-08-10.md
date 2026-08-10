# Settings Integrations (2026-08-10)

## Overview
Replaced the "mock" settings UI with actual, real-world implementations for 2FA, Webhooks, and Stripe Customer Portal.

## Technical Implementations

### 1. Two-Factor Authentication (2FA)
- **Dependencies**: Added `speakeasy` for TOTP generation/verification and `qrcode` for rendering QR codes.
- **Database**: Added `twoFactorSecret` (String?) and `twoFactorEnabled` (Boolean) to the `User` model.
- **API**: 
  - `GET /api/agency/2fa/generate`: Generates a TOTP secret and returns it alongside a base64 QR code image.
  - `POST /api/agency/2fa/verify`: Verifies a 6-digit TOTP code against the generated secret and marks 2FA as enabled in the database.
  - `DELETE /api/agency/2fa/verify`: Disables 2FA (requires verification of a final TOTP code to prevent unauthorized disablement).
- **Authentication Core**: Updated `lib/auth.ts`. The `Credentials` provider now accepts an optional `totpCode` field. If `twoFactorEnabled` is true for the user, and the password matches, it checks for `totpCode`. If missing, it throws a specific `"2FA_REQUIRED"` error. If present, it verifies it using `speakeasy`.
- **UI Logic**: In `app/(auth)/login/page.tsx`, the `handleLogin` function catches `"2FA_REQUIRED"`, hides the email/password fields, and shows a 6-digit TOTP input field.

### 2. Webhooks Engine
- **Database**: Added a new `WebhookEndpoint` model to store URLs, an array of subscribed events (stored as a JSON string), an optional HMAC secret, and a link to the `Agency`.
- **API**: Created `GET`, `POST`, and `DELETE` handlers at `/api/agency/webhooks`.
- **Dispatcher Utility**: Added `lib/webhook-dispatcher.ts` containing the `dispatchWebhooks` function. It fetches all active endpoints for an agency, filters by subscribed events, signs the JSON payload using `HMAC-SHA256` if a secret is provided, and uses `Promise.allSettled` and `fetch` (with `AbortSignal.timeout`) to dispatch webhooks asynchronously without blocking the main thread.
- **Trigger Points**: Wired `dispatchWebhooks` into `app/api/reports/[id]/process/route.ts` to fire `report.generated` on success and `report.failed` on errors.

### 3. Stripe Billing Portal (Fallback implementation)
- **API**: Built `/api/agency/stripe/create-portal` using the official `stripe` Node SDK.
- **Logic**: If `STRIPE_SECRET_KEY` is not present, it returns a `400` error with a specific message. If present, it checks if the user has a `stripeCustomerId` in the DB. If not, it creates a new Stripe Customer and saves the ID. It then generates a billing portal session via `stripe.billingPortal.sessions.create()` and returns the URL.
- **UI Fallback**: In the Settings UI, clicking "Manage Billing Portal" attempts to hit this API. If the API returns the URL, it redirects (`window.location.href`). If it fails (e.g., due to missing keys), it catches the error and elegantly falls back to opening the mock billing portal modal (`setIsPortalModalOpen(true)`).

## Next Steps
- Obtain Stripe API Keys and Google OAuth Keys from the user to finalize Phase 3 (Live Checkout) and Phase 4 (GSC Authentication).
