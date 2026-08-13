/**
 * lib/email.ts — Real email delivery via Resend
 * Docs: https://resend.com/docs
 *
 * All functions fall back to console logging if RESEND_API_KEY is not set,
 * so the app works in development without any email config.
 */

let ResendClass: any = null;
try {
  ResendClass = require('resend').Resend;
} catch {
  // Module optional fallback when resend package is not present in node_modules
}

const resend = (ResendClass && process.env.RESEND_API_KEY) ? new ResendClass(process.env.RESEND_API_KEY) : null;

// From address — in Resend free tier, only "onboarding@resend.dev" works
// until you verify a custom domain. Switch to your own domain once verified.
const FROM = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// ── Helpers ────────────────────────────────────────────────────────────────

function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!resend || !process.env.RESEND_API_KEY) {
    // Dev fallback — print to console
    console.log('\n[EMAIL — no RESEND_API_KEY]\nTo:', opts.to, '\nSubject:', opts.subject, '\n');
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: `RankFlow <${FROM}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });

    if (error) {
      console.error('[Resend error]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email send failed]', err);
    return false;
  }
}

// ── Email Templates ────────────────────────────────────────────────────────

function baseTemplate(content: string, agencyName = 'RankFlow'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${agencyName}</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #e2e8f0; }
    .wrapper { max-width: 580px; margin: 40px auto; background: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px 40px; }
    .header-title { font-size: 22px; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.5px; }
    .header-sub { font-size: 13px; color: rgba(255,255,255,0.7); margin: 4px 0 0; }
    .body { padding: 36px 40px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; margin: 20px 0; }
    .muted { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 20px; }
    p { color: #94a3b8; line-height: 1.7; font-size: 15px; }
    h2 { color: #f1f5f9; font-size: 20px; margin: 0 0 16px; }
    .code-box { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 8px; color: #dc2626; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-title">⚡ ${agencyName}</div>
      <div class="header-sub">SEO Report Automation Platform</div>
    </div>
    <div class="body">
      ${content}
    </div>
  </div>
</body>
</html>`;
}

// ── Public API ─────────────────────────────────────────────────────────────

/** Password reset email */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  userName?: string
) {
  const html = baseTemplate(`
    <h2>Reset your password</h2>
    <p>Hi${userName ? ` ${userName}` : ''},</p>
    <p>We received a request to reset the password for your RankFlow account.</p>
    <p>Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.</p>
    <a href="${resetUrl}" class="btn">Reset Password →</a>
    <p>If you didn't request this, you can safely ignore this email. Your password won't change.</p>
    <div class="muted">
      If the button doesn't work, copy and paste this link:<br/>
      <span style="color:#dc2626;word-break:break-all">${resetUrl}</span>
    </div>
  `);

  return sendEmail({
    to,
    subject: 'Reset your RankFlow password',
    html,
  });
}

/** Welcome email after agency signup */
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  agencyName: string,
  dashboardUrl: string
) {
  const html = baseTemplate(`
    <h2>Welcome to RankFlow, ${userName}! 🚀</h2>
    <p>Your <strong>${agencyName}</strong> workspace is ready. You can now:</p>
    <ul style="color:#94a3b8;line-height:2">
      <li>Add your first client</li>
      <li>Connect your SE Ranking API key</li>
      <li>Generate your first SEO report</li>
    </ul>
    <a href="${dashboardUrl}" class="btn">Open Dashboard →</a>
    <div class="muted">If you have any questions, just reply to this email.</div>
  `, agencyName);

  return sendEmail({
    to,
    subject: `Welcome to RankFlow — Your ${agencyName} workspace is ready`,
    html,
  });
}

/** Monthly SEO report ready notification */
export async function sendReportReadyEmail(
  to: string,
  clientName: string,
  reportTitle: string,
  reportId: string,
  agencyName: string
) {
  const portalLink = `${APP_URL}/reports/render/${reportId}`;

  const html = baseTemplate(`
    <h2>Your SEO report is ready 📊</h2>
    <p>Hi ${clientName},</p>
    <p>Your <strong>${reportTitle}</strong> has been generated and is now available for review.</p>
    <a href="${portalLink}" class="btn">View Report →</a>
    <p style="font-size:13px;color:#64748b">This report includes keyword rankings, backlink analysis, and site health score for the past month.</p>
    <div class="muted">
      This report was prepared by <strong>${agencyName}</strong> via RankFlow.
    </div>
  `, agencyName);

  return sendEmail({
    to,
    subject: `${reportTitle} — Your SEO Report is Ready`,
    html,
  });
}

/** Client message notification to agency */
export async function sendClientMessageNotificationEmail(
  agencyEmail: string,
  clientName: string,
  subject: string,
  messageBody: string,
  agencyName: string
) {
  const html = baseTemplate(`
    <h2>New message from ${clientName}</h2>
    <p>Your client <strong>${clientName}</strong> has sent a new message through the client portal:</p>
    <div style="background:#1e293b;border-left:4px solid #dc2626;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0">
      <div style="font-size:12px;color:#dc2626;font-weight:700;margin-bottom:8px;text-transform:uppercase">${subject || 'General Inquiry'}</div>
      <p style="margin:0;color:#e2e8f0">${messageBody}</p>
    </div>
    <a href="${APP_URL}" class="btn">Reply in Dashboard →</a>
    <div class="muted">You received this because you are an admin of <strong>${agencyName}</strong>.</div>
  `, agencyName);

  return sendEmail({
    to: agencyEmail,
    subject: `New message from client: ${clientName}`,
    html,
    replyTo: undefined,
  });
}

/** Agency reply notification to client */
export async function sendAgencyReplyEmail(
  clientEmail: string,
  clientName: string,
  messageBody: string,
  agencyName: string,
  portalUrl: string
) {
  const html = baseTemplate(`
    <h2>New reply from ${agencyName} 💬</h2>
    <p>Hi ${clientName},</p>
    <p>Your SEO agency <strong>${agencyName}</strong> has responded to your inquiry in the client portal:</p>
    <div style="background:#1e293b;border-left:4px solid #dc2626;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0">
      <div style="font-size:12px;color:#dc2626;font-weight:700;margin-bottom:8px;text-transform:uppercase">Agency Reply</div>
      <p style="margin:0;color:#e2e8f0;white-space:pre-wrap">${messageBody}</p>
    </div>
    <a href="${portalUrl}" class="btn">View Full Conversation →</a>
    <div class="muted">You received this because you are a client of <strong>${agencyName}</strong>. Log in to your portal to reply.</div>
  `, agencyName);

  return sendEmail({
    to: clientEmail,
    subject: `New reply from ${agencyName} — SEO Agency Update`,
    html,
  });
}

/** Support ticket notification */
export async function sendSupportTicketEmail(
  adminEmail: string,
  userEmail: string,
  userName: string,
  agencyName: string,
  issueType: string,
  subject: string,
  message: string
) {
  const html = baseTemplate(`
    <h2>Support Ticket: ${subject}</h2>
    <p><strong>From:</strong> ${userName} (${userEmail})<br/>
    <strong>Agency:</strong> ${agencyName}<br/>
    <strong>Type:</strong> ${issueType}</p>
    <div style="background:#1e293b;border-left:4px solid #dc2626;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0">
      <p style="margin:0;color:#e2e8f0">${message}</p>
    </div>
    <div class="muted">Reply directly to <a href="mailto:${userEmail}" style="color:#dc2626">${userEmail}</a> to respond to this ticket.</div>
  `);

  return sendEmail({
    to: adminEmail,
    subject: `[Support] [${issueType}] ${subject} — ${agencyName}`,
    html,
    replyTo: userEmail,
  });
}
