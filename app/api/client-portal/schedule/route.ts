import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** PATCH /api/client-portal/schedule — update report delivery preferences */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dayOfMonth, autoSend, ccEmails, deliveryFormat } = await request.json();

    // Resolve client from invitation
    const invitation = await prisma.invitation.findFirst({
      where: { email: session.user.email, acceptedAt: { not: null } },
      include: { client: { include: { reportSchedule: true } } },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const client = invitation.client;

    if (client.reportSchedule) {
      await prisma.reportSchedule.update({
        where: { clientId: client.id },
        data: {
          ...(dayOfMonth !== undefined ? { dayOfMonth: Number(dayOfMonth) } : {}),
          ...(autoSend !== undefined ? { autoSend: Boolean(autoSend) } : {}),
        },
      });
    }
    // If no schedule exists yet, it will be created by the agency admin

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CLIENT_SCHEDULE_PATCH]', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
