/**
 * This is a mock email service.
 * In a real production environment, you would use a service like Resend, SendGrid, or AWS SES.
 * For example, with Resend:
 * 
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 * await resend.emails.send({ from, to, subject, html });
 */

export async function sendReportReadyEmail(
  to: string, 
  clientName: string, 
  reportTitle: string, 
  reportId: string,
  agencyName: string
) {
  // We simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const portalLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/localhost/c/login`;
  
  const emailContent = `
==================================================
[SIMULATED EMAIL DISPATCH]
To: ${to}
From: reports@${agencyName.toLowerCase().replace(/\s+/g, '')}.com
Subject: ${reportTitle} is ready!

Hello ${clientName},

Your latest SEO performance report (${reportTitle}) has been generated and is now ready for your review.

Please log in to your secure client portal to view your traffic, keyword rankings, and technical health score.

Access your portal here: ${portalLink}

Best regards,
The ${agencyName} Team
==================================================
  `;

  console.log(emailContent);
  
  return true;
}

export async function sendClientMessageNotificationEmail(
  agencyEmail: string,
  clientName: string,
  subject: string,
  messageBody: string,
  agencyName: string
) {
  // We simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const emailContent = `
==================================================
[SIMULATED EMAIL DISPATCH TO SUPPORT]
To: ${agencyEmail}
From: portal-alerts@rankflow.app
Subject: New Query Raised by Client [${clientName}] - ${subject || 'No Subject'}

Hello ${agencyName} Support Team,

Your client "${clientName}" has raised a new inquiry via their secure client portal:

--------------------------------------------------
Subject: ${subject || 'General Inquiry'}
Message:
${messageBody}
--------------------------------------------------

You can view this message and reply to it in your Client Inbox here:
http://localhost:3000/localhost/inbox

Best regards,
RankFlow Platform Team
==================================================
  `;

  console.log(emailContent);
  return true;
}

export async function sendSupportTicketEmail(
  adminEmail: string,
  userEmail: string,
  userName: string,
  agencyName: string,
  issueType: string,
  subject: string,
  message: string
) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const emailContent = `
==================================================
[SIMULATED SUPPORT TICKET DISPATCH]
To: ${adminEmail}
Reply-To: ${userEmail}
From: helpdesk@rankflow.app
Subject: [${issueType}] Support Ticket from ${agencyName} - ${subject}

Hello Support Team,

A new support ticket has been submitted by an agency user:

User: ${userName} (${userEmail})
Agency: ${agencyName}
Issue Type: ${issueType}
Subject: ${subject}

Message Details:
--------------------------------------------------
${message}
--------------------------------------------------

Please respond directly to their email.
==================================================
  `;

  console.log(emailContent);
  return true;
}

