/**
 * 🔔 Slack & Microsoft Teams Audit Alert Webhook Dispatcher
 * Sends structured webhook notifications when site health audits drop below thresholds or reports complete.
 */

export interface AuditAlertPayload {
  agencyName: string;
  clientName: string;
  clientDomain: string;
  healthScore: number;
  criticalIssues: number;
  warnings: number;
  reportUrl?: string;
  timestamp?: string;
}

export async function sendSlackAlert(webhookUrl: string, payload: AuditAlertPayload): Promise<{ success: boolean; message: string }> {
  try {
    if (!webhookUrl) {
      return { success: false, message: 'No Slack webhook URL configured' };
    }

    const slackPayload = {
      text: `🚨 *SEO Health Alert: ${payload.clientName}*`,
      attachments: [
        {
          color: payload.healthScore < 80 ? '#FF1E42' : '#10B981',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Agency:* ${payload.agencyName}\n*Domain:* <https://${payload.clientDomain}|${payload.clientDomain}>\n*Health Score:* *${payload.healthScore}/100*`
              }
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Critical Issues:* ${payload.criticalIssues}` },
                { type: 'mrkdwn', text: `*Warnings:* ${payload.warnings}` }
              ]
            },
            payload.reportUrl ? {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '📄 View SEO Report' },
                  url: payload.reportUrl,
                  style: 'primary'
                }
              ]
            } : null
          ].filter(Boolean)
        }
      ]
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload)
    });

    if (!res.ok) {
      return { success: false, message: `Slack API error: ${res.statusText}` };
    }

    return { success: true, message: 'Slack alert dispatched successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to dispatch Slack alert' };
  }
}

export async function sendTeamsAlert(webhookUrl: string, payload: AuditAlertPayload): Promise<{ success: boolean; message: string }> {
  try {
    if (!webhookUrl) {
      return { success: false, message: 'No Microsoft Teams webhook URL configured' };
    }

    const teamsPayload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: payload.healthScore < 80 ? 'FF1E42' : '10B981',
      summary: `SEO Audit Alert for ${payload.clientName}`,
      sections: [
        {
          activityTitle: `🚨 SEO Health Alert: ${payload.clientName}`,
          activitySubtitle: `Agency: ${payload.agencyName} | ${payload.clientDomain}`,
          facts: [
            { name: 'Health Score', value: `${payload.healthScore}/100` },
            { name: 'Critical Issues', value: `${payload.criticalIssues}` },
            { name: 'Warnings', value: `${payload.warnings}` }
          ],
          markdown: true
        }
      ],
      potentialAction: payload.reportUrl ? [
        {
          '@type': 'OpenUri',
          name: '📄 View Full Report',
          targets: [{ os: 'default', uri: payload.reportUrl }]
        }
      ] : []
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamsPayload)
    });

    if (!res.ok) {
      return { success: false, message: `Teams API error: ${res.statusText}` };
    }

    return { success: true, message: 'Microsoft Teams alert dispatched successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to dispatch Teams alert' };
  }
}
