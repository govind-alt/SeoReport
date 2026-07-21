/**
 * RankFlow Email Service
 * Uses Nodemailer for transactional email delivery.
 * Set EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD
 * and EMAIL_FROM in your .env to enable real email delivery.
 * Falls back to console.log in development when SMTP is not configured.
 */

import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Transporter setup
// ---------------------------------------------------------------------------

function createTransporter() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = parseInt(process.env.EMAIL_SERVER_PORT || '587', 10);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM || 'noreply@rankflow.app';

  if (!host || !user || !pass) {
    // Return null — caller will fall back to console.log
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendEmail(to: string, subject: string, html: string, from?: string) {
  const fromAddress = from || process.env.EMAIL_FROM || 'RankFlow <noreply@rankflow.app>';
  const transporter = createTransporter();

  if (!transporter) {
    // Dev fallback — log to console
    console.log('\n══════════════════════════════════════════════');
    console.log('[SIMULATED EMAIL — configure SMTP to send real emails]');
    console.log(`To:      ${to}`);
    console.log(`From:    ${fromAddress}`);
    console.log(`Subject: ${subject}`);
    console.log('──────────────────────────────────────────────');
    console.log(html.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim());
    console.log('══════════════════════════════════════════════\n');
    return true;
  }

  await transporter.sendMail({ from: fromAddress, to, subject, html });
  return true;
}

// ---------------------------------------------------------------------------
// HTML Template helper
// ---------------------------------------------------------------------------

function baseTemplate(agencyName: string, content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${agencyName}</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1d27;border-radius:12px;border:1px solid #2a2d3e;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">${agencyName}</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:4px;letter-spacing:1px;text-transform:uppercase;">SEO Report Automation</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#13151f;padding:24px 40px;text-align:center;border-top:1px solid #2a2d3e;">
              <p style="margin:0;font-size:12px;color:#6b7280;">
                This email was sent by ${agencyName} via RankFlow.<br/>
                You are receiving this because you have an account on this platform.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string) {
  return `<div style="text-align:center;margin:32px 0;">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">${label} →</a>
  </div>`;
}

function bodyText(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#c9d1e0;">${text}</p>`;
}

function infoBox(content: string) {
  return `<div style="background:#13151f;border:1px solid #2a2d3e;border-radius:8px;padding:20px;margin:24px 0;">
    ${content}
  </div>`;
}

// ---------------------------------------------------------------------------
// Email: Report Ready
// ---------------------------------------------------------------------------

export async function sendReportReadyEmail(
  to: string,
  clientName: string,
  reportTitle: string,
  reportId: string,
  agencyName: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const portalLink = `${appUrl}/localhost/c/dashboard`;

  const content = `
    <h2 style="margin:0 0 24px;font-size:24px;font-weight:800;color:#f1f5f9;">Your SEO Report is Ready 📊</h2>
    ${bodyText(`Hello <strong style="color:#f1f5f9;">${clientName}</strong>,`)}
    ${bodyText(`Your latest SEO performance report has been generated and is now available in your client portal.`)}
    ${infoBox(`
      <div style="font-size:13px;color:#6b7280;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">Report</div>
      <div style="font-size:16px;font-weight:700;color:#f1f5f9;">${reportTitle}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:8px;">Prepared by ${agencyName}</div>
    `)}
    ${bodyText(`Log in to your secure client portal to review your traffic performance, keyword rankings, backlink profile, and site health score.`)}
    ${ctaButton(portalLink, 'View My Report')}
    ${bodyText(`If you have any questions about your report, please reach out to your account manager.`)}
  `;

  return sendEmail(to, `${reportTitle} — Ready to View`, baseTemplate(agencyName, content));
}

// ---------------------------------------------------------------------------
// Email: Team Member Invite
// ---------------------------------------------------------------------------

export async function sendTeamInviteEmail(
  to: string,
  agencyName: string,
  role: string,
  inviteToken: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const acceptLink = `${appUrl}/invite/accept?token=${inviteToken}`;

  const content = `
    <h2 style="margin:0 0 24px;font-size:24px;font-weight:800;color:#f1f5f9;">You've Been Invited 🎉</h2>
    ${bodyText(`You have been invited to join <strong style="color:#f1f5f9;">${agencyName}</strong> on RankFlow as a <strong style="color:#a78bfa;">${role}</strong>.`)}
    ${bodyText(`Click the button below to accept your invitation and create your account. This link expires in 7 days.`)}
    ${ctaButton(acceptLink, 'Accept Invitation')}
    ${bodyText(`If you did not expect this invitation, you can safely ignore this email.`)}
  `;

  return sendEmail(to, `You're invited to join ${agencyName} on RankFlow`, baseTemplate(agencyName, content));
}

// ---------------------------------------------------------------------------
// Email: Client Portal Invite
// ---------------------------------------------------------------------------

export async function sendClientPortalInviteEmail(
  to: string,
  clientName: string,
  agencyName: string,
  domain: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const loginLink = `${appUrl}/${domain}/c/login`;

  const content = `
    <h2 style="margin:0 0 24px;font-size:24px;font-weight:800;color:#f1f5f9;">Your Client Portal is Ready 🔑</h2>
    ${bodyText(`Hello <strong style="color:#f1f5f9;">${clientName}</strong>,`)}
    ${bodyText(`<strong style="color:#f1f5f9;">${agencyName}</strong> has set up a secure, private client portal where you can view your SEO performance reports, keyword rankings, and site health — all in one place.`)}
    ${infoBox(`
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px;">📊</div>
        <div>
          <div style="font-size:14px;font-weight:700;color:#f1f5f9;">Your Personal SEO Dashboard</div>
          <div style="font-size:13px;color:#6b7280;margin-top:2px;">Keyword rankings · Traffic · Reports</div>
        </div>
      </div>
    `)}
    ${bodyText(`To log in, simply click the button below and enter your email address. We'll send you a secure magic link — no password needed.`)}
    ${ctaButton(loginLink, 'Access My Portal')}
  `;

  return sendEmail(
    to,
    `${agencyName} has set up your SEO client portal`,
    baseTemplate(agencyName, content)
  );
}

// ---------------------------------------------------------------------------
// Email: Welcome (post-registration)
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(
  to: string,
  name: string,
  agencyName: string,
  domain: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const dashboardLink = `${appUrl}/${domain}`;

  const content = `
    <h2 style="margin:0 0 24px;font-size:24px;font-weight:800;color:#f1f5f9;">Welcome to RankFlow 🚀</h2>
    ${bodyText(`Hi <strong style="color:#f1f5f9;">${name}</strong>, welcome to RankFlow!`)}
    ${bodyText(`Your agency workspace <strong style="color:#a78bfa;">${agencyName}</strong> has been created and is ready to use.`)}
    ${bodyText(`Here's what you can do to get started:`)}
    ${infoBox(`
      <div style="font-size:14px;color:#c9d1e0;line-height:2;">
        <div>✅ &nbsp;Connect your SERanking API key in Settings → API Keys</div>
        <div>✅ &nbsp;Add your first client in the Clients section</div>
        <div>✅ &nbsp;Generate your first SEO report</div>
        <div>✅ &nbsp;Invite clients to their private portal</div>
      </div>
    `)}
    ${ctaButton(dashboardLink, 'Open My Dashboard')}
  `;

  return sendEmail(
    to,
    `Welcome to RankFlow — Your agency is live!`,
    baseTemplate(agencyName, content)
  );
}
