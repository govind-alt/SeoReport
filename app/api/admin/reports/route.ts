import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            domain: true,
            agency: {
              select: { id: true, name: true, subdomain: true, slug: true }
            }
          }
        }
      }
    });

    const formattedReports = reports.map((r) => {
      let aiRecs: any[] = [];
      let sections: any = {};
      if (r.aiRecsJson) { try { aiRecs = JSON.parse(r.aiRecsJson); } catch {} }
      if (r.sectionsJson) { try { sections = JSON.parse(r.sectionsJson); } catch {} }

      return {
        id: r.id,
        clientId: r.clientId,
        clientName: r.client?.name || 'Unknown Client',
        clientDomain: r.client?.domain || 'N/A',
        agencyId: r.client?.agency?.id || 'N/A',
        agencyName: r.client?.agency?.name || 'Unknown Agency',
        agencySubdomain: r.client?.agency?.subdomain || r.client?.agency?.slug || '',
        period: new Date(r.periodStart).toLocaleString('default', { month: 'long', year: 'numeric' }),
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        status: r.status,
        shareSlug: r.shareSlug,
        pdfUrl: r.pdfUrl,
        viewCount: r.viewCount,
        lastViewedAt: r.lastViewedAt,
        generatedAt: r.generatedAt ? new Date(r.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending',
        createdAt: r.createdAt,
        aiRecs,
        sections
      };
    });

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error('[ADMIN_REPORTS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
