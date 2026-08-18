import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalAgencies,
      totalClients,
      totalUsers,
      totalReports,
      recentAgencies
    ] = await Promise.all([
      prisma.agency.count(),
      prisma.client.count(),
      prisma.user.count(),
      prisma.report.count(),
      prisma.agency.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { clients: true, users: true }
          }
        }
      })
    ]);

    // Calculate approximate MRR
    const starterCount = await prisma.agency.count({ where: { plan: 'starter' } });
    const proCount = await prisma.agency.count({ where: { plan: 'pro' } });
    const agencyPlanCount = await prisma.agency.count({ where: { plan: 'agency' } });
    const enterpriseCount = await prisma.agency.count({ where: { plan: 'enterprise' } });

    const totalMrr = (starterCount * 99) + (proCount * 299) + (agencyPlanCount * 499) + (enterpriseCount * 999);

    return NextResponse.json({
      totalAgencies,
      totalClients,
      totalUsers,
      totalReports,
      totalMessages: 0,
      totalMrr,
      recentAgencies
    });
  } catch (error) {
    console.error('[ADMIN_STATS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
