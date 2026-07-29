import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** GET /api/agency/team — list team members for the agency */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: { agencyId: session.user.agencyId as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error('[AGENCY_TEAM_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

const InviteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'member']).default('member'),
});

/** POST /api/agency/team — invite a new team member */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = InviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, role } = parsed.data;

    // Check if user with that email already exists in this agency
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 409 },
      );
    }

    // Create user with pending status (no password — they'll set on first login via invite link)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        agencyId: session.user.agencyId as string,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // TODO: Send invite email when Resend is configured (sendWelcomeEmail)

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error('[AGENCY_TEAM_POST]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

/** DELETE /api/agency/team — remove a team member */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Cannot remove yourself
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, agencyId: session.user.agencyId as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[AGENCY_TEAM_DELETE]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
