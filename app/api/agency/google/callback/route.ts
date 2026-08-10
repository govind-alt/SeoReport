import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { google } from 'googleapis';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    // Ensure the agency ID matches the state parameter to prevent CSRF
    if (state !== session.user.agencyId) {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?error=GoogleAuthFailed`);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/agency/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      // Save refresh token to DB
      await prisma.agency.update({
        where: { id: session.user.agencyId },
        data: { googleRefreshToken: tokens.refresh_token }
      });
    } else {
      // If we didn't get a refresh token, it means the user already granted access previously
      // and Google only returned an access token. In a real world scenario we would either
      // force prompt='consent' (which we do in auth/route.ts) or check if we already have one.
      // But since we use prompt: consent, we should usually get it.
      console.warn('Google OAuth: No refresh token returned. Using existing token if present.');
    }

    // Redirect back to settings page with success param
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?tab=integrations&gsc=success`);
  } catch (error: any) {
    console.error('Google Auth Callback Error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings?tab=integrations&gsc=error`);
  }
}
