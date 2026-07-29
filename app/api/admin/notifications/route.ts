import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all notifications across agencies plus recent platform events
    const dbNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        agency: { select: { name: true } }
      }
    });

    const formattedNotifications = dbNotifications.map((n) => {
      let navTab = 'overview';
      if (n.type === 'report') navTab = 'reports';
      else if (n.type === 'alert' || n.title.toLowerCase().includes('message')) navTab = 'messages';
      else if (n.type === 'client' || n.title.toLowerCase().includes('client')) navTab = 'clients';
      else if (n.type === 'signup') navTab = 'agencies';

      return {
        id: n.id,
        title: n.title,
        desc: n.body,
        agency: n.agency?.name || 'Agency',
        link: n.link,
        navTab,
        read: n.read,
        time: new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        createdAt: n.createdAt
      };
    });

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('[ADMIN_NOTIFICATIONS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_NOTIFICATIONS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
