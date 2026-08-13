import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
let speakeasy: any = null;
try {
  const req = eval('require');
  speakeasy = req('speakeasy');
} catch {
  // Module fallback
}

/**
 * POST /api/agency/2fa/verify
 * Verifies a TOTP code and enables 2FA for the user if valid.
 * Body: { secret: string, token: string }
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { secret, token } = await req.json();

    if (!secret || !token) {
      return NextResponse.json({ error: 'secret and token are required' }, { status: 400 });
    }

    if (!speakeasy) {
      return NextResponse.json({ error: '2FA verification module unavailable' }, { status: 500 });
    }

    // Verify the token against the secret
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1, // Allow 1 step of clock drift
    });

    if (!verified) {
      return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
    }

    // Save the secret and enable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json({ success: true, message: '2FA has been enabled successfully.' });
  } catch (error) {
    console.error('2FA Verify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/agency/2fa/verify
 * Disables 2FA for the user after verifying their current TOTP code.
 * Body: { token: string }
 */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'token is required to disable 2FA' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
    }

    // Verify the token before disabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return NextResponse.json({ error: 'Invalid code. Please verify with your authenticator app.' }, { status: 400 });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    return NextResponse.json({ success: true, message: '2FA has been disabled.' });
  } catch (error) {
    console.error('2FA Disable Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
