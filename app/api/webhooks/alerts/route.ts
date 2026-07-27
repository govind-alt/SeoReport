import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSlackAlert, sendTeamsAlert } from '@/lib/alerts';

/**
 * 🔔 POST /api/webhooks/alerts
 * Dispatches test or automated health score alerts to configured Slack & Teams webhooks.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agencyId, clientName, healthScore, criticalIssues, warnings, type } = body;

    const agency = agencyId ? await prisma.agency.findUnique({
      where: { id: agencyId }
    }) : await prisma.agency.findFirst();

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    const payload = {
      agencyName: agency.name,
      clientName: clientName || 'Acme E-Commerce Store',
      clientDomain: 'acmestore.com',
      healthScore: healthScore !== undefined ? Number(healthScore) : 74,
      criticalIssues: criticalIssues !== undefined ? Number(criticalIssues) : 5,
      warnings: warnings !== undefined ? Number(warnings) : 12,
      reportUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/demo-report`,
      timestamp: new Date().toISOString()
    };

    const results = {
      slack: { success: false, message: 'Not configured' },
      teams: { success: false, message: 'Not configured' }
    };

    if (agency.slackWebhookUrl) {
      results.slack = await sendSlackAlert(agency.slackWebhookUrl, payload);
    }

    if (agency.teamsWebhookUrl) {
      results.teams = await sendTeamsAlert(agency.teamsWebhookUrl, payload);
    }

    // Audit log entry
    await prisma.auditLog.create({
      data: {
        agencyId: agency.id,
        action: `Alert Dispatched: ${type || 'Test Audit Alert'} for ${payload.clientName}`,
        userName: 'System Alert Engine',
        userInitials: 'SA'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Alert processing complete',
      payload,
      results
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Alert dispatch error' }, { status: 500 });
  }
}
