import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

/** POST /api/auth/forgot-password — request a password reset link */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 });
    }

    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // IMPORTANT: Always return success even if email doesn't exist
    // This prevents user enumeration attacks
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, password: true },
    });

    // If user exists and has a password (not Google-only account)
    if (user?.password) {
      const token     = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store token in VerificationToken table (NextAuth's table)
      await prisma.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token,
          expires: expiresAt,
        },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

      await sendPasswordResetEmail(normalizedEmail, resetUrl, user.name ?? undefined).catch(err => {
        console.error('[FORGOT_PASSWORD] Email send failed:', err);
      });
    }

    // Always return success — never reveal if email exists
    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email, a reset link has been sent.',
    });
  } catch (err) {
    console.error('[FORGOT_PASSWORD_POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
