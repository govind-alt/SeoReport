import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

/**
 * Google OAuth Callback Handler
 * 
 * Receives the authorization code from Google, exchanges it for tokens,
 * encrypts them, and stores them in the GoogleCredential table.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // agency domain
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${appUrl}/${state}/integrations?error=google_auth_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/${state}/integrations?error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_GSC_REDIRECT_URI || `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/${state}/integrations?error=not_configured`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.statusText}`);
    }

    const tokens = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Get the user's Google email
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const userInfo = await userInfoRes.json();

    // Find the agency
    const domain = state || '';
    const agency = await prisma.agency.findFirst({
      where: { OR: [{ slug: domain }, { subdomain: domain }] }
    });

    if (!agency) {
      return NextResponse.redirect(`${appUrl}/login?error=agency_not_found`);
    }

    const expiresAt = new Date(Date.now() + (expires_in * 1000));

    // Find or create GoogleCredential record for this agency
    const existingCred = await prisma.googleCredential.findFirst({
      where: { agencyId: agency.id, email: userInfo.email }
    });

    if (existingCred) {
      await prisma.googleCredential.update({
        where: { id: existingCred.id },
        data: {
          accessToken: encrypt(access_token),
          refreshToken: refresh_token ? encrypt(refresh_token) : existingCred.refreshToken,
          expiresAt,
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.googleCredential.create({
        data: {
          email: userInfo.email,
          accessToken: encrypt(access_token),
          refreshToken: encrypt(refresh_token || ''),
          expiresAt,
          agencyId: agency.id
        }
      });
    }

    console.log(`[GSC OAUTH] Connected Google account ${userInfo.email} to agency ${agency.name}`);
    return NextResponse.redirect(`${appUrl}/${domain}/integrations?success=gsc_connected`);

  } catch (err: any) {
    console.error('[GSC OAUTH CALLBACK ERROR]', err);
    return NextResponse.redirect(`${appUrl}/${state}/integrations?error=token_exchange_failed`);
  }
}
