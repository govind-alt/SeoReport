import { NextRequest, NextResponse } from 'next/server';
import { decrypt, encrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('Google OAuth error:', error);
    return new NextResponse(`Google OAuth Error: ${error}`, { status: 400 });
  }

  if (!code || !stateParam) {
    return new NextResponse('Missing code or state', { status: 400 });
  }

  try {
    // Decrypt state to retrieve agencyId, clientId, and returnUrl
    const decryptedState = decrypt(decodeURIComponent(stateParam));
    const { agencyId, clientId, returnUrl } = JSON.parse(decryptedState);

    if (!agencyId) {
      return new NextResponse('Invalid state content', { status: 400 });
    }

    // Determine the redirect callback URI matching Google Console configuration
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') ? 'http:' : 'https:';
    const redirectUri = `${protocol}//${host}/api/auth/gsc/callback`;

    // Exchange auth code for Google Access/Refresh tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return new NextResponse(`Token Exchange Failed: ${errorText}`, { status: 400 });
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // Fetch Google User details to record email address
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let email = 'unknown@google.com';
    if (userinfoResponse.ok) {
      const userinfo = await userinfoResponse.json();
      email = userinfo.email || email;
    }

    // Encrypt the tokens before saving to database
    const encryptedAccess = encrypt(access_token);
    const encryptedRefresh = refresh_token ? encrypt(refresh_token) : '';
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Resolve tenant subdomain or localhost path slug
    const domainSlug = returnUrl.includes('localhost') 
      ? 'localhost' 
      : returnUrl.split('//')[1].split('.')[0];

    // Store GoogleCredential record
    if (clientId) {
      // Client-level override
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: { googleCredential: true },
      });

      if (!client) {
        return new NextResponse('Client not found', { status: 404 });
      }

      let credential;
      if (client.googleCredentialId) {
        credential = await prisma.googleCredential.update({
          where: { id: client.googleCredentialId },
          data: {
            email,
            accessToken: encryptedAccess,
            ...(refresh_token ? { refreshToken: encryptedRefresh } : {}),
            expiresAt,
          },
        });
      } else {
        credential = await prisma.googleCredential.create({
          data: {
            email,
            accessToken: encryptedAccess,
            refreshToken: encryptedRefresh,
            expiresAt,
            agencyId,
          },
        });

        await prisma.client.update({
          where: { id: clientId },
          data: {
            googleCredentialId: credential.id,
            gscConnected: true,
          },
        });
      }
    } else {
      // Agency-level Google account
      const existingCred = await prisma.googleCredential.findFirst({
        where: { agencyId, email },
      });

      if (existingCred) {
        await prisma.googleCredential.update({
          where: { id: existingCred.id },
          data: {
            accessToken: encryptedAccess,
            ...(refresh_token ? { refreshToken: encryptedRefresh } : {}),
            expiresAt,
          },
        });
      } else {
        await prisma.googleCredential.create({
          data: {
            email,
            accessToken: encryptedAccess,
            refreshToken: encryptedRefresh,
            expiresAt,
            agencyId,
          },
        });
      }
    }

    // Redirect user back to the correct tenant origin path
    const redirectUrl = clientId 
      ? `${returnUrl}/${domainSlug}/clients/${clientId}`
      : `${returnUrl}/${domainSlug}/settings`;

    return NextResponse.redirect(redirectUrl);
  } catch (e: any) {
    console.error('GSC Callback Error:', e);
    return new NextResponse(`Callback Error: ${e.message}`, { status: 500 });
  }
}
