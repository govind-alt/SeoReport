import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { google } from 'googleapis';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/agency/google/callback`
    );

    // We only need Google Search Console readonly access
    const scopes = [
      'https://www.googleapis.com/auth/webmasters.readonly'
    ];

    const url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      // If you only need one scope you can pass it as a string
      scope: scopes,
      prompt: 'consent', // Force consent screen to ensure we get a refresh token
      state: session.user.agencyId // Pass agency ID so we can verify it in callback
    });

    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('Google Auth Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
