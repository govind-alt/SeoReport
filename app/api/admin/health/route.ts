import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const start = Date.now();
    // DB ping
    let dbStatus = 'operational';
    let dbLatency = 0;
    try {
      const t = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - t;
    } catch {
      dbStatus = 'degraded';
    }

    const apiLatency = Date.now() - start;

    // Count active sessions (NextAuth stores sessions in DB)
    let activeSessions = 0;
    try {
      activeSessions = await (prisma as any).session.count();
    } catch { activeSessions = 0; }

    const totalAgencies = await prisma.agency.count();
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      dbStatus,
      dbLatency,
      apiLatency,
      activeSessions,
      totalAgencies,
      totalUsers,
      uptime: process.uptime ? Math.floor(process.uptime()) : 0,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[ADMIN_HEALTH_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
