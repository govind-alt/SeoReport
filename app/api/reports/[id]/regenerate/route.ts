import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { after } from 'next/server';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: { client: { include: { agency: true } } }
  });

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // Reset to pending and re-queue
  await prisma.report.update({
    where: { id },
    data: { status: 'pending', pdfUrl: null }
  });

  after(async () => {
    const { compileReportPdf } = await import('@/lib/report-compiler');
    await compileReportPdf(id);
  });

  return NextResponse.json({ success: true, message: 'Report queued for regeneration' });
}
