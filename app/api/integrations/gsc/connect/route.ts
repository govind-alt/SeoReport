import { NextRequest, NextResponse } from 'next/server';

/**
 * Google OAuth Initiator — redirects to Google's consent screen
 * 
 * To activate: add to .env:
 *   GOOGLE_CLIENT_ID=your_client_id
 *   GOOGLE_CLIENT_SECRET=your_client_secret
 *   GOOGLE_GSC_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
 * 
 * In GCP Console:
 *   1. Create OAuth 2.0 Client ID (Web Application)
 *   2. Add Authorized Redirect URI: https://your-domain.com/api/auth/google/callback
 *   3. Enable "Google Search Console API" in your GCP project
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_GSC_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.json({ 
      error: 'Google OAuth is not configured. Add GOOGLE_CLIENT_ID to your .env file.',
      setup_required: true
    }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') || '';

  // Build the Google OAuth URL with GSC scopes
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: domain // pass domain through the OAuth flow
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
