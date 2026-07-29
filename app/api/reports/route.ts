import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const CreateReportSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  periodStart: z.string(),
  periodEnd: z.string(),
  sections: z.object({
    keywords: z.boolean().default(true),
    backlinks: z.boolean().default(true),
    audit: z.boolean().default(true),
    analytics: z.boolean().default(true),
    competitors: z.boolean().default(false),
    aiRecs: z.boolean().default(true),
  }).optional(),
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
          select: { id: true, name: true, domain: true },
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

/** POST /api/reports — create a new report */
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

    const { clientId, periodStart, periodEnd, sections } = parsed.data;

    // Verify client belongs to this agency
    const client = await prisma.client.findFirst({
      where: { id: clientId, agencyId: session.user.agencyId as string },
    });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const shareSlug = crypto.randomBytes(12).toString('base64url');

    const report = await prisma.report.create({
      data: {
        clientId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: 'generating',
        shareSlug,
        sectionsJson: sections ? JSON.stringify(sections) : null,
      },
      include: {
        client: { select: { id: true, name: true, domain: true } },
      },
    });

    // Fire-and-forget: trigger background report processing
    // We don't await this so the response is returned immediately
    const processUrl = new URL(`/api/reports/${report.id}/process`, request.url);
    fetch(processUrl.toString(), { method: 'POST' }).catch(err => {
      console.error('[REPORTS_POST] Failed to trigger process:', err);
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: unknown) {
    console.error('[REPORTS_POST]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
