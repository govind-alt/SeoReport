import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const CreateReportSchema = z.object({
  clientId: z.string().optional(),
  clientIds: z.array(z.string()).optional(),
  periodStart: z.string(),
  periodEnd: z.string(),
  sections: z.record(z.string(), z.boolean()).optional(),
  notes: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
  format: z.string().optional(),
  delivery: z.record(z.string(), z.any()).optional(),
  branding: z.record(z.string(), z.any()).optional(),
});

/** GET /api/reports — list reports for the agency */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    const reports = await prisma.report.findMany({
      where: {
        client: { agencyId: session.user.agencyId as string },
        ...(clientId ? { clientId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        client: {
          select: { id: true, name: true, domain: true, contactEmail: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(reports);
  } catch (error: unknown) {
    console.error('[REPORTS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

/** POST /api/reports — create a new single or batch report */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const {
      clientId,
      clientIds,
      periodStart,
      periodEnd,
      sections,
      notes,
      recommendations,
      delivery,
      format,
      branding,
    } = parsed.data;

    // Resolve list of client IDs to generate for
    const targetClientIds = clientIds && clientIds.length > 0
      ? clientIds
      : clientId
      ? [clientId]
      : [];

    if (targetClientIds.length === 0) {
      return NextResponse.json({ error: 'At least one client must be selected' }, { status: 400 });
    }

    // Verify all clients belong to this agency
    const validClients = await prisma.client.findMany({
      where: {
        id: { in: targetClientIds },
        agencyId: session.user.agencyId as string,
      },
      select: { id: true, name: true, domain: true, contactEmail: true },
    });

    if (validClients.length === 0) {
      return NextResponse.json({ error: 'No valid clients found' }, { status: 404 });
    }

    const createdReports = [];

    for (const client of validClients) {
      const shareSlug = crypto.randomBytes(12).toString('base64url');

      const aiMetadata = {
        notes: notes || undefined,
        recommendations: recommendations || undefined,
        delivery: delivery || undefined,
        format: format || 'web',
        branding: branding || undefined,
      };

      const report = await prisma.report.create({
        data: {
          clientId: client.id,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          status: 'generating',
          shareSlug,
          sectionsJson: sections ? JSON.stringify(sections) : null,
          aiRecsJson: JSON.stringify(aiMetadata),
        },
        include: {
          client: { select: { id: true, name: true, domain: true, contactEmail: true } },
        },
      });

      createdReports.push(report);

      // Fire-and-forget: trigger background report processing
      const processUrl = new URL(`/api/reports/${report.id}/process`, request.url);
      fetch(processUrl.toString(), { method: 'POST' }).catch(err => {
        console.error(`[REPORTS_POST] Failed to trigger process for ${report.id}:`, err);
      });
    }

    // If single report created, return single object for backward compatibility
    if (createdReports.length === 1 && !clientIds) {
      return NextResponse.json(createdReports[0], { status: 201 });
    }

    return NextResponse.json({ count: createdReports.length, reports: createdReports }, { status: 201 });
  } catch (error: unknown) {
    console.error('[REPORTS_POST]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
