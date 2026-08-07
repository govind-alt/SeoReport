import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAgencyReplyEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Must be an agency admin/superadmin to fetch all messages
    if (session.user.role === 'client') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the user's agency
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.agencyId) {
      return NextResponse.json({ error: 'No agency found for user' }, { status: 404 });
    }

    // Fetch messages for this agency
    const messages = await prisma.message.findMany({
      where: { agencyId: user.agencyId },
      include: {
        client: {
          select: { id: true, name: true, domain: true, logo: true, contactEmail: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'client') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { agency: true }
    });

    if (!user || !user.agencyId) {
      return NextResponse.json({ error: 'No agency found for user' }, { status: 404 });
    }

    const { clientId, body, subject } = await req.json();

    if (!clientId || !body) {
      return NextResponse.json({ error: 'Client ID and message body are required' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        body,
        subject: subject || 'Reply from Agency',
        clientId,
        agencyId: user.agencyId,
        isFromAgency: true,
        senderName: user.agency?.name || user.name || 'Agency Support'
      }
    });

    // Send real email notification to the client (fire-and-forget)
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (client?.contactEmail) {
      const portalUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/client/dashboard#messages`;
      sendAgencyReplyEmail(
        client.contactEmail,
        client.contactName || client.name,
        body,
        user.agency?.name || 'Your SEO Agency',
        portalUrl
      ).catch(err => console.error('[Email reply to client] Failed:', err));
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message reply:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

