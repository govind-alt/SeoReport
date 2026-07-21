import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain') || 'localhost';

  try {
    const agency = await prisma.agency.findFirst({
      where: { OR: [{ slug: domain }, { subdomain: domain }] },
      include: { clients: { select: { id: true } } }
    });

    if (!agency) {
      return NextResponse.json({ clients: 0, reports: 0 });
    }

    const clientIds = agency.clients.map(c => c.id);
    const reportCount = await prisma.report.count({
      where: { clientId: { in: clientIds } }
    });

    return NextResponse.json({
      clients: agency.clients.length,
      reports: reportCount
    });
  } catch {
    return NextResponse.json({ clients: 0, reports: 0 });
  }
}
