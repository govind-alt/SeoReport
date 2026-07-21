import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { encrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.agencyId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const agencyId = session.user.agencyId;
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get('clientId') || '';

  // Get host to dynamically construct redirect callback URI
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http:' : 'https:';
  const currentBaseUrl = `${protocol}//${host}`;

  // Encrypt state containing target tenant identifiers and domain return path
  const stateObj = { agencyId, clientId, returnUrl: currentBaseUrl };
  const state = encodeURIComponent(encrypt(JSON.stringify(stateObj)));

  const redirectUri = `${currentBaseUrl}/api/auth/gsc/callback`;

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile%20https://www.googleapis.com/auth/webmasters.readonly` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${state}`;

  return NextResponse.redirect(googleAuthUrl);
}
