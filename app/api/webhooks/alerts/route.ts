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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Alert dispatch error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/webhooks/alerts
 * Saves Slack / Teams webhook URLs to the agency record.
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { agencyId, slackWebhookUrl, teamsWebhookUrl } = body;

    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId is required' }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (slackWebhookUrl !== undefined) updateData.slackWebhookUrl = slackWebhookUrl.trim();
    if (teamsWebhookUrl !== undefined) updateData.teamsWebhookUrl = teamsWebhookUrl.trim();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No webhook URL provided' }, { status: 400 });
    }

    await prisma.agency.update({
      where: { id: agencyId },
      data: updateData as any,
    });

    await prisma.auditLog.create({
      data: {
        agencyId,
        action: `Webhook URL updated: ${Object.keys(updateData).join(', ')}`,
        userName: 'Agency Settings',
        userInitials: 'AS',
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save webhook URL';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

