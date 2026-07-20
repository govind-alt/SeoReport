import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** GET /api/notifications — fetch notifications for current agency */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agencyId = session.user.agencyId as string;

    // Auto-seed notifications if none exist yet for this agency
    const count = await prisma.notification.count({ where: { agencyId } });
    if (count === 0) {
      await seedNotifications(agencyId);
    }

    const notifications = await prisma.notification.findMany({
      where: { agencyId, dismissed: false },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

/** POST /api/notifications — mark all unread as read */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agencyId = session.user.agencyId as string;

    await prisma.notification.updateMany({
      where: { agencyId, read: false, dismissed: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[NOTIFICATIONS_POST]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

/** PUT /api/notifications — create a new notification */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agencyId = session.user.agencyId as string;
    const body = await req.json();
    const { type, title, body: notifBody, link } = body;

    if (!type || !title || !notifBody) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: { agencyId, type, title, body: notifBody, link: link ?? null },
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('[NOTIFICATIONS_PUT]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}


// ─── Seed realistic notifications from real DB data ─────────────────────────

async function seedNotifications(agencyId: string) {
  const now = new Date();
  const seeds: {
    agencyId: string;
    type: string;
    title: string;
    body: string;
    link: string | null;
    read: boolean;
    createdAt: Date;
  }[] = [];

  // Pull real reports for this agency
  const recentReports = await prisma.report.findMany({
    where: { client: { agencyId } },
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  for (const r of recentReports) {
    seeds.push({
      agencyId,
      type: 'report',
      title: 'Report Generated',
      body: `${r.client.name} report generated successfully`,
      link: `/reports/render/${r.id}`,
      read: false,
      createdAt: r.createdAt,
    });
  }

  // Pull audit warnings
  const auditIssues = await prisma.auditSnapshot.findMany({
    where: { project: { client: { agencyId } }, criticalIssues: { gt: 0 } },
    include: { project: { include: { client: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

  for (const a of auditIssues) {
    seeds.push({
      agencyId,
      type: 'alert',
      title: 'Critical Audit Issues',
      body: `${a.project.client.name} — ${a.criticalIssues} critical audit issue${a.criticalIssues !== 1 ? 's' : ''} found`,
      link: null,
      read: true,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    });
  }

  // SE Ranking sync notification
  seeds.push({
    agencyId,
    type: 'sync',
    title: 'SE Ranking Sync Complete',
    body: 'SE Ranking sync completed — keyword data updated for all clients',
    link: null,
    read: true,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  });

  // Keyword ranking improvement (mock)
  seeds.push({
    agencyId,
    type: 'ranking',
    title: 'Keyword Ranking Improved',
    body: 'Top keywords count increased — check your latest rankings report',
    link: null,
    read: false,
    createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
  });

  if (seeds.length > 0) {
    await prisma.notification.createMany({ data: seeds });
  }
}
