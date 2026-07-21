import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: report.id,
    title: report.title,
    clientId: report.clientId,
    clientName: report.client.name,
    status: report.status,
    pdfUrl: report.pdfUrl,
    date: report.date,
    createdAt: report.createdAt,
  });
}
