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

    let client: Awaited<ReturnType<typeof prisma.client.findFirst>> = invitation?.client ?? null;
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

    return NextResponse.json({ success: true, client: updatedClient });
  } catch (error) {
    console.error('[CLIENT_PORTAL_UPDATE_DATA]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
