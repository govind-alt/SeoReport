/**
 * lib/email.ts — Real email delivery via Resend
 * Docs: https://resend.com/docs
 *
 * All functions fall back to console logging if RESEND_API_KEY is not set,
 * so the app works in development without any email config.
 */

import path from 'path';
import fs from 'fs';

let ResendClass: any = null;
try {
  const req = eval('require');
  ResendClass = req('resend').Resend;
} catch {
  // Module optional fallback when resend package is not present in node_modules
}

/**
 * Dynamically resolves Resend configuration from environment variables or disk-persisted settings.
 */
export function getEmailConfig(): { apiKey?: string; from: string; appUrl: string; isConfigured: boolean } {
  let apiKey = process.env.RESEND_API_KEY;
  let from = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // Check disk-persisted platform settings (takes precedence if updated via Admin Settings UI)
  try {
    const settingsPath = path.join(process.cwd(), 'data', 'platform-settings.json');
    if (fs.existsSync(settingsPath)) {
      const data = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      if (data.resendApiKey && data.resendApiKey.trim() !== '') {
        apiKey = data.resendApiKey.trim();
      }
      if (data.fromEmail && data.fromEmail.trim() !== '') {
        from = data.fromEmail.trim();
      }
    }
  } catch {
    // Ignore read errors gracefully
  }

  const isConfigured = Boolean(apiKey && apiKey.startsWith('re_') && apiKey.length > 10);

  return { apiKey, from, appUrl, isConfigured };
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  previewText?: string;
}): Promise<boolean> {
  const { apiKey, from, isConfigured } = getEmailConfig();

  // If no Resend API key or package missing, output to console directly
  if (!isConfigured || !apiKey || !ResendClass) {
    console.log('\n==================================================');
    console.log('📧 [EMAIL DEV SIMULATION — No Resend API Key]');
    console.log('To:', opts.to);
    console.log('From:', from);
    console.log('Subject:', opts.subject);
    if (opts.previewText) console.log('Details:', opts.previewText);
    console.log('==================================================\n');
    return true;
  }

  try {
    const client = new ResendClass(apiKey);
    const fromAddress = from.includes('<') ? from : `RankFlow <${from}>`;

    const { data, error } = await client.emails.send({
      from: fromAddress,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });

    if (error) {
      console.warn('\n⚠️ [Resend API Notice]:', error.message || error);
      // If Resend returns an error in dev/sandbox (e.g. 401 invalid key, 403 sandbox restriction),
      // print fallback to console so development links are never lost
      console.log('--------------------------------------------------');
      console.log('📧 [EMAIL FALLBACK DISPLAY]');
      console.log('To:', opts.to);
      console.log('Subject:', opts.subject);
      if (opts.previewText) console.log('Details:', opts.previewText);
      console.log('--------------------------------------------------\n');
      return true;
    }

    console.log(`✅ [Resend Success] Email delivered to ${opts.to} (ID: ${data?.id || 'sent'})`);
    return true;
  } catch (err: any) {
    console.warn('⚠️ [Email Send Exception]:', err?.message || err);
    console.log('--------------------------------------------------');
    console.log('📧 [EMAIL FALLBACK DISPLAY]');
    console.log('To:', opts.to);
    console.log('Subject:', opts.subject);
    if (opts.previewText) console.log('Details:', opts.previewText);
    console.log('--------------------------------------------------\n');
    return true;
  }
}

// ── Professional Email System & Design ──────────────────────────────────────

function baseTemplate(options: {
  title: string;
  subtitle?: string;
  badge?: string;
  agencyName?: string;
  contentHtml: string;
  actionButton?: { text: string; url: string };
  metaBox?: { label: string; value: string }[];
  footerNote?: string;
  rawUrl?: string;
}): string {
  const brand = options.agencyName || 'RankFlow';
  const currentYear = new Date().getFullYear();

  const metaHtml = options.metaBox && options.metaBox.length > 0
    ? `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          ${options.metaBox.map(item => `
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 500; width: 35%;">${item.label}:</td>
              <td style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 600;">${item.value}</td>
            </tr>
          `).join('')}
        </table>
      </div>`
    : '';

  const buttonHtml = options.actionButton
    ? `<div style="margin: 28px 0; text-align: left;">
        <a href="${options.actionButton.url}" target="_blank" style="background: #2563eb; background-image: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff !important; display: inline-block; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; letter-spacing: 0.2px; box-shadow: 0 2px 4px rgba(37,99,235,0.25); text-align: center;">
          ${options.actionButton.text}
        </a>
      </div>`
    : '';

  const rawUrlHtml = options.rawUrl
    ? `<div style="margin-top: 24px; padding-top: 18px; border-top: 1px dashed #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
        <span style="font-weight: 600; color: #475569;">Direct Link:</span><br/>
        <a href="${options.rawUrl}" style="color: #2563eb; word-break: break-all; text-decoration: underline;">${options.rawUrl}</a>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${options.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155; line-height: 1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; border-bottom: 3px solid #2563eb;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; display: inline-flex; align-items: center; gap: 8px;">
                      <span style="display: inline-block; width: 10px; height: 10px; background-color: #3b82f6; border-radius: 50%;"></span>
                      ${brand}
                    </div>
                  </td>
                  ${options.badge ? `
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(255,255,255,0.12); color: #93c5fd; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${options.badge}
                    </span>
                  </td>` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 36px 32px 32px 32px;">
              <h1 style="margin: 0 0 8px 0; font-size: 21px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                ${options.title}
              </h1>
              ${options.subtitle ? `
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                  ${options.subtitle}
                </p>` : '<div style="height: 12px;"></div>'}

              <div style="font-size: 14px; color: #334155; line-height: 1.65;">
                ${options.contentHtml}
              </div>

              ${metaHtml}
              ${buttonHtml}
              ${rawUrlHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 22px 32px; border-top: 1px solid #e2e8f0; text-align: left;">
              ${options.footerNote ? `
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                  ${options.footerNote}
                </p>` : ''}
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                © ${currentYear} ${brand}. Secure Transactional Communication.<br/>
                This is an automated operational notification. Please do not reply directly to this address.
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

// ── Public API ─────────────────────────────────────────────────────────────

/** Password reset email */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  userName?: string
) {
  const html = baseTemplate({
    title: 'Reset Your Account Password',
    subtitle: 'A secure password reset request was received for your RankFlow account.',
    badge: 'Security',
    contentHtml: `
      <p style="margin-top: 0;">Hello${userName ? ` <strong>${userName}</strong>` : ''},</p>
      <p>We received a request to reset your password. You can set a new secure password by clicking the button below. For your security, this link will expire in <strong>15 minutes</strong>.</p>
      <p style="color: #64748b; font-size: 13px;">If you did not initiate this request, no action is required. Your current password remains secure and unchanged.</p>
    `,
    actionButton: {
      text: 'Reset Account Password →',
      url: resetUrl,
    },
    rawUrl: resetUrl,
    footerNote: 'This security link is single-use and will automatically invalidate after completion or expiration.',
  });

  return sendEmail({
    to,
    subject: 'RankFlow — Password Reset Request',
    html,
    previewText: `Reset URL: ${resetUrl}`,
  });
}

/** Welcome email after agency signup */
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  agencyName: string,
  dashboardUrl: string
) {
  const html = baseTemplate({
    title: `Welcome to RankFlow, ${userName}`,
    subtitle: `Your agency workspace for ${agencyName} has been provisioned and is ready for use.`,
    badge: 'Onboarding',
    agencyName,
    contentHtml: `
      <p style="margin-top: 0;">We are delighted to welcome you to RankFlow. Your dedicated SEO reporting and agency analytics workspace is active.</p>
      <p>Here are your recommended next steps to get started:</p>
      <ul style="padding-left: 20px; color: #334155; line-height: 1.8;">
        <li><strong>Add your first client:</strong> Set up target domains and keywords for automated tracking.</li>
        <li><strong>Connect integrations:</strong> Link your SE Ranking and Search Console data sources.</li>
        <li><strong>Generate a branded report:</strong> Create and distribute white-labeled performance audits in minutes.</li>
      </ul>
    `,
    metaBox: [
      { label: 'Agency Workspace', value: agencyName },
      { label: 'Primary Contact', value: userName },
      { label: 'Account Tier', value: 'Active Professional' }
    ],
    actionButton: {
      text: 'Launch Agency Dashboard →',
      url: dashboardUrl,
    },
    rawUrl: dashboardUrl,
    footerNote: 'Need assistance setting up your workspace? Check out our documentation or contact our dedicated support team.',
  });

  return sendEmail({
    to,
    subject: `Welcome to RankFlow — Your ${agencyName} Workspace is Active`,
    html,
    previewText: `Dashboard URL: ${dashboardUrl}`,
  });
}

/** Team Member Invitation Email */
export async function sendTeamInviteEmail(
  to: string,
  inviteUrl: string,
  agencyName: string,
  inviterName: string,
  role: string
) {
  const html = baseTemplate({
    title: `Invitation to Join ${agencyName}`,
    subtitle: `${inviterName} has invited you to collaborate on the RankFlow platform.`,
    badge: 'Team Access',
    agencyName,
    contentHtml: `
      <p style="margin-top: 0;">Hello,</p>
      <p><strong>${inviterName}</strong> has granted you workspace access to <strong>${agencyName}</strong> on RankFlow with the role of <strong>${role}</strong>.</p>
      <p>Click below to complete your registration, set your credentials, and access the agency portal.</p>
    `,
    metaBox: [
      { label: 'Invited Organization', value: agencyName },
      { label: 'Assigned Role', value: role },
      { label: 'Invited By', value: inviterName }
    ],
    actionButton: {
      text: 'Accept Invitation & Join Team →',
      url: inviteUrl,
    },
    rawUrl: inviteUrl,
    footerNote: 'This invitation token will remain active for 7 days. If you were not expecting this invitation, you can disregard this email.',
  });

  return sendEmail({
    to,
    subject: `Invitation to collaborate with ${agencyName} on RankFlow`,
    html,
    previewText: `Invite URL: ${inviteUrl}`,
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
  const { appUrl } = getEmailConfig();
  const portalLink = `${appUrl}/reports/render/${reportId}`;

  const html = baseTemplate({
    title: 'Your Performance Report is Ready',
    subtitle: `The latest SEO audit and analytics report prepared by ${agencyName} is now available.`,
    badge: 'Report Ready',
    agencyName,
    contentHtml: `
      <p style="margin-top: 0;">Hello <strong>${clientName}</strong>,</p>
      <p>Your performance report <strong>${reportTitle}</strong> has been generated and published to your client portal.</p>
      <p>This report includes verified metrics across organic keyword rankings, technical site health diagnostics, backlink profiles, and competitive benchmark analysis.</p>
    `,
    metaBox: [
      { label: 'Report Document', value: reportTitle },
      { label: 'Prepared For', value: clientName },
      { label: 'Auditing Agency', value: agencyName }
    ],
    actionButton: {
      text: 'View Performance Report →',
      url: portalLink,
    },
    rawUrl: portalLink,
    footerNote: `Prepared and verified by ${agencyName} via RankFlow SEO Automation.`,
  });

  return sendEmail({
    to,
    subject: `${reportTitle} — Performance Report Ready for Review`,
    html,
    previewText: `Report URL: ${portalLink}`,
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
  const { appUrl } = getEmailConfig();

  const html = baseTemplate({
    title: `Inquiry Received from ${clientName}`,
    subtitle: 'A new communication has been submitted via the Client Portal.',
    badge: 'Client Message',
    agencyName,
    contentHtml: `
      <p style="margin-top: 0;">Your client <strong>${clientName}</strong> submitted a new message regarding their campaign:</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 18px 0;">
        <div style="font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase; margin-bottom: 6px;">
          ${subject || 'General Campaign Inquiry'}
        </div>
        <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${messageBody}</p>
      </div>
      <p style="font-size: 13px; color: #64748b;">You can review the full thread history and reply directly inside your agency dashboard.</p>
    `,
    actionButton: {
      text: 'Open Agency Dashboard →',
      url: appUrl,
    },
    footerNote: `Delivered to agency administration for ${agencyName}.`,
  });

  return sendEmail({
    to: agencyEmail,
    subject: `[Client Message] ${clientName}: ${subject || 'New Inquiry'}`,
    html,
    previewText: `Message from ${clientName}: ${messageBody.slice(0, 100)}`,
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
  const html = baseTemplate({
    title: `New Update from ${agencyName}`,
    subtitle: 'Your agency has responded to your inquiry in the Client Portal.',
    badge: 'Agency Reply',
    agencyName,
    contentHtml: `
      <p style="margin-top: 0;">Hello <strong>${clientName}</strong>,</p>
      <p><strong>${agencyName}</strong> has provided an update to your discussion:</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 18px 0;">
        <div style="font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase; margin-bottom: 6px;">
          Agency Statement
        </div>
        <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${messageBody}</p>
      </div>
    `,
    actionButton: {
      text: 'View Conversation & Reply →',
      url: portalUrl,
    },
    rawUrl: portalUrl,
    footerNote: `You received this update because you are an authorized client representative of ${agencyName}.`,
  });

  return sendEmail({
    to: clientEmail,
    subject: `Response from ${agencyName} — SEO Portal Update`,
    html,
    previewText: `Reply: ${messageBody.slice(0, 100)}`,
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
  const html = baseTemplate({
    title: `Support Ticket: ${subject}`,
    subtitle: 'An inbound platform support inquiry has been submitted.',
    badge: 'Support Desk',
    contentHtml: `
      <p style="margin-top: 0;">A new user ticket requires platform review:</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 18px 0;">
        <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>
    `,
    metaBox: [
      { label: 'Submitter', value: `${userName} (${userEmail})` },
      { label: 'Agency', value: agencyName },
      { label: 'Category', value: issueType }
    ],
    footerNote: `Reply directly to ${userEmail} to respond to this ticket.`,
  });

  return sendEmail({
    to: adminEmail,
    subject: `[Support Desk] [${issueType}] ${subject} — ${agencyName}`,
    html,
    replyTo: userEmail,
    previewText: `Support ticket from ${userName}: ${subject}`,
  });
}

