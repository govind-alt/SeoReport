import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const { contactName, contactEmail, notes, industry } = json;

    const email = session.user.email;
    const invitation = await prisma.invitation.findFirst({
      where: { email, acceptedAt: { not: null } },
      include: { client: true }
    });

    let client = invitation?.client;
    if (!client) {
      client = await prisma.client.findFirst({
        where: { contactEmail: email }
      });
    }

    if (!client) {
      return NextResponse.json({ error: 'Client record not found' }, { status: 404 });
    }

    const updatedClient = await prisma.client.update({
      where: { id: client.id },
      data: {
        contactName: contactName !== undefined ? contactName : client.contactName,
        contactEmail: contactEmail !== undefined ? contactEmail : client.contactEmail,
        notes: notes !== undefined ? notes : client.notes,
        industry: industry !== undefined ? industry : client.industry
      }
    });

    // Notify agency of client profile update
    await prisma.notification.create({
      data: {
        agencyId: client.agencyId,
        type: 'alert',
        title: `Client Profile Updated: ${client.name}`,
        body: `${client.name} updated their contact info or notes in client portal.`,
        link: `/clients`
      }
    }).catch(() => null);

    return NextResponse.json({ success: true, client: updatedClient });
  } catch (error) {
    console.error('[CLIENT_PORTAL_UPDATE_DATA]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
