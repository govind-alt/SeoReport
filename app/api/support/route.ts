import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendSupportTicketEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { agency: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    const { issueType, subject, message } = await request.json();

    if (!issueType || !subject || !message) {
      return NextResponse.json({ error: 'All support fields are required' }, { status: 400 });
    }

    // Resolve support recipient from platform settings or default
    let supportRecipient = 'hrishitavinherkar1234@gmail.com';
    try {
      const fs = await import('fs');
      const path = await import('path');
      const settingsFile = path.join(process.cwd(), 'data', 'platform-settings.json');
      if (fs.existsSync(settingsFile)) {
        const parsed = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
        if (parsed.supportEmail) supportRecipient = parsed.supportEmail;
      }
    } catch {}

    // Call support ticket email dispatch
    await sendSupportTicketEmail(
      supportRecipient,
      user.email || 'unknown@user.com',
      user.name || 'Agency User',
      user.agency?.name || 'Unknown Agency',
      issueType,
      subject,
      message
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/support] Error creating support ticket:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
