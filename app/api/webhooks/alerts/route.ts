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

    const agencyAny = agency as any;
    if (agencyAny.slackWebhookUrl) {
      results.slack = await sendSlackAlert(agencyAny.slackWebhookUrl, payload);
    }

    if (agencyAny.teamsWebhookUrl) {
      results.teams = await sendTeamsAlert(agencyAny.teamsWebhookUrl, payload);
    }

    // Notification log entry
    await prisma.notification.create({
      data: {
        agencyId: agency.id,
        type: 'alert',
        title: `Alert Dispatched: ${type || 'Test Audit Alert'}`,
        body: `Alert dispatched for ${payload.clientName}`,
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Alert processing complete',
      payload,
      results
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Alert processing failed' }, { status: 500 });
  }
}

/**
 * PUT /api/webhooks/alerts
 * Saves Slack / Teams webhook URLs to the agency record.
 */
export async function PUT(req: Request) {
  try {
    const { agencyId, slackWebhookUrl, teamsWebhookUrl } = await req.json();

    if (!agencyId) {
      return NextResponse.json({ error: 'agencyId is required' }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (slackWebhookUrl !== undefined) updateData.slackWebhookUrl = slackWebhookUrl;
    if (teamsWebhookUrl !== undefined) updateData.teamsWebhookUrl = teamsWebhookUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No webhook URL provided' }, { status: 400 });
    }

    await prisma.agency.update({
      where: { id: agencyId },
      data: updateData as any,
    });

    await prisma.notification.create({
      data: {
        agencyId,
        type: 'alert',
        title: 'Webhook Configuration Updated',
        body: `Webhook URL updated: ${Object.keys(updateData).join(', ')}`,
      }
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save webhook URL';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

