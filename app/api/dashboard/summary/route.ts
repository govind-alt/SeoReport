import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** GET /api/dashboard/summary — aggregate KPIs for the agency */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agencyId = session.user.agencyId as string;

    const [
      totalClients,
      totalReports,
      reportsThisMonth,
      pendingReports,
      failedReports,
    ] = await Promise.all([
      prisma.client.count({ where: { agencyId } }),
      prisma.report.count({
        where: { client: { agencyId } },
      }),
      prisma.report.count({
        where: {
          client: { agencyId },
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.report.count({
        where: { client: { agencyId }, status: 'generating' },
      }),
      prisma.report.count({
        where: { client: { agencyId }, status: 'failed' },
      }),
    ]);

    // Recent activity
    const recentReports = await prisma.report.findMany({
      where: { client: { agencyId } },
      include: {
        client: { select: { name: true, domain: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      totalClients,
      activeClients: totalClients,
      totalReports,
      reportsThisMonth,
      pendingReports,
      failedReports,
      recentReports,
    });
  } catch (error: unknown) {
    console.error('[DASHBOARD_SUMMARY_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
