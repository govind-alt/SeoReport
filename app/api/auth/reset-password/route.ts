import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/** GET /api/auth/reset-password?token=xxx — validate token on page load */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token is required' }, { status: 400 });
    }

    const record = await prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!record) {
      return NextResponse.json({ valid: false, error: 'Invalid reset link' }, { status: 404 });
    }

    if (record.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.deleteMany({
        where: { token },
      });
      return NextResponse.json({ valid: false, error: 'Reset link has expired' }, { status: 410 });
    }

    return NextResponse.json({ valid: true, email: record.identifier });
  } catch (err) {
    console.error('[RESET_PASSWORD_GET]', err);
    return NextResponse.json({ valid: false, error: 'Internal error' }, { status: 500 });
  }
}

/** POST /api/auth/reset-password — apply new password using token */
export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Look up token
    let record;
    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      record = await prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier: normalizedEmail, token } },
      });
    } else {
      record = await prisma.verificationToken.findFirst({
        where: { token },
      });
    }

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }

    if (record.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.deleteMany({
        where: { token },
      });
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 });
    }

    const targetEmail = record.identifier.toLowerCase();

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email: targetEmail },
      data: { password: hashedPassword },
    });

    // Delete used token
    await prisma.verificationToken.deleteMany({
      where: { token },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    console.error('[RESET_PASSWORD_POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
