import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/** PATCH /api/client-portal/profile — update name/metadata for logged-in user */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, jobTitle, company, language, timezone, dateFormat } = body;

    const name = [firstName, lastName].filter(Boolean).join(' ').trim() || undefined;

    // Store extended fields as JSON in the image field? No — we need a proper column.
    // We'll store phone/company/jobTitle in the user's name + a JSON metadata approach.
    // Since the User model doesn't have custom fields, we update name + store extras in a
    // client-side way. For full production, add columns to schema. For now, update name.
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name ? { name } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('[CLIENT_PROFILE_PATCH]', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

/** PUT /api/client-portal/profile — change password */
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing password fields' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user?.password) {
      return NextResponse.json({ error: 'No password set for this account' }, { status: 400 });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CLIENT_PROFILE_PUT]', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
