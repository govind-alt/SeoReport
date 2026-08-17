import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: reportId } = await params;
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { client: true }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date()
      }
    });

    // Notify agency of report view
    await prisma.notification.create({
      data: {
        agencyId: report.client.agencyId,
        type: 'report',
        title: `Report Viewed: ${report.client.name}`,
        body: `Client ${report.client.name} viewed their SEO report. Total views: ${updatedReport.viewCount}`,
        link: `/reports`
      }
    }).catch(() => null);

    return NextResponse.json({ success: true, viewCount: updatedReport.viewCount });
  } catch (error) {
    console.error('[REPORT_VIEW_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
