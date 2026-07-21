import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitation = await prisma.invitation.findFirst({
      where: { email: session.user.email, acceptedAt: { not: null } },
      include: { client: true }
    });

    const client = invitation?.client;
    const resolvedClient = client ?? await prisma.client.findFirst({
      where: { contactEmail: session.user.email }
    });

    if (!resolvedClient) {
      return NextResponse.json({ error: 'Client record not found' }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { clientId: resolvedClient.id },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('[GET /api/client-portal/messages] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const body: string = json.body;
    const subject: string | undefined = json.subject;

    if (!body || typeof body !== 'string') {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    // Find the client linked to this user's email via the Invitation table
    const invitation = await prisma.invitation.findFirst({
      where: {
        email: session.user.email,
        acceptedAt: { not: null },
      },
      include: { client: true }
    });

    const client = invitation?.client;

    // Fallback: also try looking up by contactEmail if no invitation found
    const resolvedClient = client ?? await prisma.client.findFirst({
      where: { contactEmail: session.user.email }
    });

    if (!resolvedClient) {
      return NextResponse.json({ error: 'Client record not found' }, { status: 404 });
    }

    // Create the message in the database
    const message = await prisma.message.create({
      data: {
        body,
        subject,
        clientId: resolvedClient.id,
        agencyId: resolvedClient.agencyId,
        senderName: resolvedClient.name,
        isFromAgency: false
      }
    });

    // Send email notification to agency/support team email
    const { sendClientMessageNotificationEmail } = require('@/lib/email');
    const agency = await prisma.agency.findUnique({
      where: { id: resolvedClient.agencyId },
      include: { users: { where: { role: 'admin' }, take: 1 } }
    });
    const targetEmail = agency?.billingEmail || agency?.users[0]?.email || 'support@rankflow.app';
    await sendClientMessageNotificationEmail(
      targetEmail,
      resolvedClient.name,
      subject || 'New Client Message',
      body,
      agency?.name || 'Agency'
    );

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('[POST /api/client-portal/messages] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
