import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [notifications, recentAgencies, recentClients, recentReports, recentMessages] = await Promise.all([
      prisma.notification.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: { agency: { select: { name: true } } }
      }),
      prisma.agency.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true }
      }),
      prisma.client.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { agency: { select: { name: true } } }
      }),
      prisma.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true, agency: { select: { name: true } } } } }
      }),
      prisma.message.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true } }, agency: { select: { name: true } } }
      })
    ]);

    const activityFeed: Array<{ id: string; type: string; title: string; detail: string; agency: string; time: string; timestamp: Date }> = [];

    notifications.forEach((n) => {
      activityFeed.push({
        id: `notif-${n.id}`,
        type: n.type || 'alert',
        title: n.title,
        detail: n.body,
        agency: n.agency?.name || 'Agency',
        time: new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: n.createdAt
      });
    });

    recentAgencies.forEach((a) => {
      activityFeed.push({
        id: `agency-${a.id}`,
        type: 'signup',
        title: `New Agency Registered`,
        detail: `${a.name} joined RankFlow platform`,
        agency: a.name,
        time: new Date(a.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: a.createdAt
      });
    });

    recentClients.forEach((c) => {
      activityFeed.push({
        id: `client-${c.id}`,
        type: 'client',
        title: `New Client Onboarded`,
        detail: `${c.name} (${c.domain}) added by ${c.agency.name}`,
        agency: c.agency.name,
        time: new Date(c.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: c.createdAt
      });
    });

    recentReports.forEach((r) => {
      activityFeed.push({
        id: `report-${r.id}`,
        type: 'report',
        title: `SEO Report Generated`,
        detail: `Report for ${r.client.name} (${r.status}) by ${r.client.agency.name}`,
        agency: r.client.agency.name,
        time: new Date(r.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: r.createdAt
      });
    });

    recentMessages.forEach((m) => {
      activityFeed.push({
        id: `msg-${m.id}`,
        type: 'message',
        title: `Client Communication`,
        detail: `Message ${m.isFromAgency ? 'from agency ' + m.agency.name : 'from client ' + m.client.name}: "${m.body.slice(0, 50)}..."`,
        agency: m.agency.name,
        time: new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: m.createdAt
      });
    });

    activityFeed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(activityFeed.slice(0, 30));
  } catch (error) {
    console.error('[ADMIN_ACTIVITY_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
