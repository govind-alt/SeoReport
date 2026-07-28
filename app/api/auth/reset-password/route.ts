import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/** POST /api/auth/reset-password — apply new password using token */
export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify token
    const record = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: normalizedEmail, token } },
    });

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }

    if (record.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: normalizedEmail, token } },
      });
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: normalizedEmail, token } },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    console.error('[RESET_PASSWORD_POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
