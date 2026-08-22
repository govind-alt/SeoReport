# RankFlow — Transactional Email Templates & Formatting Guide

> **Official Design Specification & Template Repository**  
> **Mailer Gateway:** Resend API (`lib/email.ts`)  
> **Design Language:** Executive Professional (Responsive, Dark Header Accent, Crisp Slate Typography, Accessible CTAs)

---

## 🎨 Master Template System Architecture

All transactional emails in RankFlow share a unified, cross-client tested base container designed for maximum deliverability, visual clarity, and responsiveness across desktop and mobile clients (Apple Mail, Gmail, Outlook, Yahoo).

### Design Features
1. **Header**: `#0f172a` (Slate 900) header with brand avatar, agency / platform name, and context badge.
2. **Main Card**: `#ffffff` container on `#f1f5f9` ambient background, subtle `1px solid #e2e8f0` border, `12px` border-radius, soft elevation shadow.
3. **Typography**: Clean system stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
4. **Key-Value Meta Boxes**: `#f8fafc` container for structured parameter summaries (e.g., Agency Name, Role, Submitter).
5. **Call-to-Action**: Gradient blue (`#3b82f6` → `#1d4ed8`) pill button with direct fallback URL link.
6. **Footer**: Confidentiality notice, automated notification disclaimer, and dynamic copyright year.

---

## 📧 Template Catalog

---

### 1. Password Reset
* **Function:** `sendPasswordResetEmail(to, resetUrl, userName)`
* **Subject:** `RankFlow — Password Reset Request`
* **Badge:** `SECURITY`
* **Expiry:** 15 Minutes
* **Sample Payload:**
  * **Title:** Reset Your Account Password
  * **Subtitle:** A secure password reset request was received for your RankFlow account.
  * **Body:** Hello **John**, We received a request to reset your password. You can set a new secure password by clicking the button below. For your security, this link will expire in 15 minutes.
  * **CTA:** `Reset Account Password →`

---

### 2. Agency Welcome / Workspace Provisioned
* **Function:** `sendWelcomeEmail(to, userName, agencyName, dashboardUrl)`
* **Subject:** `Welcome to RankFlow — Your {agencyName} Workspace is Active`
* **Badge:** `ONBOARDING`
* **Sample Payload:**
  * **Title:** Welcome to RankFlow, John
  * **Subtitle:** Your agency workspace for Digital Horizons has been provisioned and is ready for use.
  * **Next Steps:**
    * **Add your first client:** Set up target domains and keywords for automated tracking.
    * **Connect integrations:** Link your SE Ranking and Search Console data sources.
    * **Generate a branded report:** Create and distribute white-labeled performance audits in minutes.
  * **Meta Box:** Agency Workspace, Primary Contact, Account Tier.
  * **CTA:** `Launch Agency Dashboard →`

---

### 3. Team Member Workspace Invitation
* **Function:** `sendTeamInviteEmail(to, inviteUrl, agencyName, inviterName, role)`
* **Subject:** `Invitation to collaborate with {agencyName} on RankFlow`
* **Badge:** `TEAM ACCESS`
* **Expiry:** 7 Days
* **Sample Payload:**
  * **Title:** Invitation to Join Digital Horizons
  * **Subtitle:** Alex Smith has invited you to collaborate on the RankFlow platform.
  * **Body:** Hello, Alex Smith has granted you workspace access to Digital Horizons on RankFlow with the role of SEO Specialist.
  * **Meta Box:** Invited Organization, Assigned Role, Invited By.
  * **CTA:** `Accept Invitation & Join Team →`

---

### 4. Client SEO Performance Report Ready
* **Function:** `sendReportReadyEmail(to, clientName, reportTitle, reportId, agencyName)`
* **Subject:** `{reportTitle} — Performance Report Ready for Review`
* **Badge:** `REPORT READY`
* **Sample Payload:**
  * **Title:** Your Performance Report is Ready
  * **Subtitle:** The latest SEO audit and analytics report prepared by Digital Horizons is now available.
  * **Body:** Hello **Acme Corp**, Your performance report August 2026 SEO Audit has been generated and published to your client portal.
  * **Meta Box:** Report Document, Prepared For, Auditing Agency.
  * **CTA:** `View Performance Report →`

---

### 5. Client Portal Inquiry Notification (To Agency)
* **Function:** `sendClientMessageNotificationEmail(agencyEmail, clientName, subject, messageBody, agencyName)`
* **Subject:** `[Client Message] {clientName}: {subject}`
* **Badge:** `CLIENT MESSAGE`
* **Sample Payload:**
  * **Title:** Inquiry Received from Acme Corp
  * **Subtitle:** A new communication has been submitted via the Client Portal.
  * **Message Box:** Highlighted callout containing the inquiry subject and full message text.
  * **CTA:** `Open Agency Dashboard →`

---

### 6. Agency Response Notification (To Client)
* **Function:** `sendAgencyReplyEmail(clientEmail, clientName, messageBody, agencyName, portalUrl)`
* **Subject:** `Response from {agencyName} — SEO Portal Update`
* **Badge:** `AGENCY REPLY`
* **Sample Payload:**
  * **Title:** New Update from Digital Horizons
  * **Subtitle:** Your agency has responded to your inquiry in the Client Portal.
  * **Statement Box:** Blue-accented response box displaying the agency's remarks.
  * **CTA:** `View Conversation & Reply →`

---

### 7. Support Ticket Dispatch (To Super Admin)
* **Function:** `sendSupportTicketEmail(adminEmail, userEmail, userName, agencyName, issueType, subject, message)`
* **Subject:** `[Support Desk] [{issueType}] {subject} — {agencyName}`
* **Badge:** `SUPPORT DESK`
* **Sample Payload:**
  * **Title:** Support Ticket: {subject}
  * **Subtitle:** An inbound platform support inquiry has been submitted.
  * **Meta Box:** Submitter (`Name (email)`), Agency, Category.
  * **Reply-To:** Direct user email address.

---

## 🛠️ Resend Configuration & Production Setup

### Environment Variables (`.env`)
```env
# Outgoing Mailer
RESEND_API_KEY="re_your_live_api_key_here"
FROM_EMAIL="RankFlow Notifications <onboarding@resend.dev>"
NEXTAUTH_URL="https://app.rankflow.com"
```

### Production Best Practices
1. **Domain Authentication**: Verify SPF, DKIM, and DMARC records for your custom domain on [Resend Domains](https://resend.com/domains).
2. **From Address**: Configure a verified sending address like `RankFlow <notifications@app.yourdomain.com>`.
3. **Local Dev Resilience**: In development mode or without an API key, `lib/email.ts` outputs the formatted emails with direct clickable action URLs straight to the terminal without failing requests.
