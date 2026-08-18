import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let googleModule: any;
    try {
      googleModule = eval('require')('googleapis').google;
    } catch (e) {
      // Fallback Google OAuth authorization URL when googleapis package is optional
      const clientId = process.env.GOOGLE_CLIENT_ID || '389833425294-7lfg6488930sbm0svhe0a772lbl4284d.apps.googleusercontent.com';
      const redirectUri = encodeURIComponent(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/agency/google/callback`);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fwebmasters.readonly&access_type=offline&prompt=consent&state=${session.user.agencyId}`;
      return NextResponse.redirect(authUrl);
    }

    const oauth2Client = new googleModule.auth.OAuth2(
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
