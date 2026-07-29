import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { name: true, domain: true }
        },
        agency: {
          select: { name: true }
        }
      }
    });

    const formattedMessages = messages.map((m) => ({
      id: m.id,
      subject: m.subject || 'General Inquiry',
      body: m.body,
      isRead: m.isRead,
      isFromAgency: m.isFromAgency,
      senderName: m.senderName || (m.isFromAgency ? m.agency?.name : m.client?.name) || 'User',
      clientId: m.clientId,
      clientName: m.client?.name || 'Client',
      clientDomain: m.client?.domain || '',
      agencyId: m.agencyId,
      agencyName: m.agency?.name || 'Agency',
      createdAt: m.createdAt,
      formattedTime: new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('[ADMIN_MESSAGES_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
