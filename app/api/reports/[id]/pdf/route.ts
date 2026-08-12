import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compileReportPdf } from '@/lib/report-compiler';
import { after } from 'next/server';

/**
 * GET /api/reports/[id]/pdf
 * 
 * Multi-purpose endpoint:
 * 1. Checks current PDF generation status (generating/generated/failed).
 * 2. If report is not compiled, spawns an asynchronous Puppeteer compiler task using Next.js after.
 * 3. Returns the PDF url when generation is complete.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing report ID' }, { status: 400 });
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // If PDF is fully compiled and ready, return success status and URL
    if (report.status === 'generated' && report.pdfUrl) {
      return NextResponse.json({ status: 'generated', pdfUrl: report.pdfUrl });
    }

    // If compilation failed
    if (report.status === 'failed') {
      return NextResponse.json({ status: 'failed', error: 'PDF generation failed' });
    }

    // If compilation is already running in background
    if (report.status === 'generating') {
      return NextResponse.json({ status: 'generating' });
    }

    // Otherwise, initiate compilation asynchronously in the background
    // Mark status in DB as generating before spawning promise
    await prisma.report.update({
      where: { id },
      data: { status: 'generating' },
    });

    // Spawn non-blocking background compiler task
    after(() => compileReportPdf(id));

    return NextResponse.json({ status: 'generating' });
  } catch (error: any) {
    console.error('Error fetching/triggering report PDF compilation:', error);
    return NextResponse.json({ error: 'Failed to process report PDF compilation' }, { status: 500 });
  }
}
