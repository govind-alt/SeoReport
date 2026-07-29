import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationId = params.id;
    if (!notificationId) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('[ADMIN_NOTIFICATION_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
