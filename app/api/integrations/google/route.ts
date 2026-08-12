import { NextResponse } from 'next/server';
import { fetchGscSearchAnalytics, fetchGa4Analytics, getGoogleOAuthConsentUrl } from '@/lib/google';
import { prisma } from '@/lib/prisma';

/**
 * 🔗 GET / POST /api/integrations/google
 * Manages Google Search Console & GA4 OAuth authentication and metric queries.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || 'acmestore.com';
    const action = searchParams.get('action');

    if (action === 'connect') {
      const consentUrl = getGoogleOAuthConsentUrl('agency_default');
      return NextResponse.redirect(consentUrl);
    }

    const [gsc, ga4] = await Promise.all([
      fetchGscSearchAnalytics(domain),
      fetchGa4Analytics(domain)
    ]);

    return NextResponse.json({
      connected: true,
      domain,
      gsc,
      ga4,
      lastSync: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Google API error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agencyId, googleEmail } = body;

    const agency = agencyId ? await prisma.agency.findUnique({ where: { id: agencyId } }) : await prisma.agency.findFirst();
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    // Save or update Google Credentials
    const cred = await prisma.googleCredential.create({
      data: {
        agencyId: agency.id,
        email: googleEmail || 'marketing@agency.com',
        accessToken: 'enc_google_access_token_demo',
        refreshToken: 'enc_google_refresh_token_demo',
        expiresAt: new Date(Date.now() + 3600 * 1000)
      }
    });

    await prisma.auditLog.create({
      data: {
        agencyId: agency.id,
        action: `Google OAuth Connected: ${cred.email} (Search Console & GA4)`,
        userName: 'Google API Integration',
        userInitials: 'GO'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Google Search Console & GA4 connected successfully',
      credentialId: cred.id
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save Google credentials' }, { status: 500 });
  }
}
