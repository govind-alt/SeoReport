import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * GET /api/agency/2fa/generate
 * Generates a new TOTP secret and returns a QR code data URL.
 * The secret is NOT saved to the DB yet — only saved after user verifies it.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 });
    }

    // Generate a new TOTP secret
    const secret = speakeasy.generateSecret({
      name: `RankFlow (${user.email})`,
      issuer: 'RankFlow',
      length: 20,
    });

    // Generate a QR code from the otpauth URL
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpauthUrl: secret.otpauth_url,
    });
  } catch (error) {
    console.error('2FA Generate Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
