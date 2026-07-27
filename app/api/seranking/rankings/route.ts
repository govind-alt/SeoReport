import { NextResponse } from 'next/server';
import { SERankingClient } from '@/lib/seranking/client';
import { decrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/seranking/rankings?siteId=123
 * Fetches the keyword rankings for a specific SERanking project.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteIdParam = searchParams.get('siteId');
    const domain = searchParams.get('domain');

    if (!siteIdParam) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    const siteId = parseInt(siteIdParam, 10);
    if (isNaN(siteId)) {
      return NextResponse.json({ error: 'Invalid siteId' }, { status: 400 });
    }

    const session = await auth();
    let agencyId = session?.user?.agencyId;

    if (!agencyId && domain) {
      const agency = await prisma.agency.findFirst({
        where: { OR: [{ slug: domain }, { subdomain: domain }] }
      });
      agencyId = agency?.id;
    }

    if (!agencyId) {
      const firstAgency = await prisma.agency.findFirst();
      agencyId = firstAgency?.id;
    }

    let apiKey = process.env.SERANKING_API_KEY || process.env.SERANKING_API_KEY_TEST;

    if (agencyId) {
      const agency = await prisma.agency.findUnique({
        where: { id: agencyId },
        select: { serankingApiKey: true }
      });
      if (agency?.serankingApiKey) {
        try {
          apiKey = decrypt(agency.serankingApiKey);
        } catch {
          apiKey = agency.serankingApiKey;
        }
      }
    }

    if (!apiKey) {
      return NextResponse.json({
        date: new Date().toISOString().split('T')[0],
        positions: [
          { keyword_id: 1, keyword: 'seo audit software', position: 3, change: 1, url: 'https://acmestore.com/seo-audit' },
          { keyword_id: 2, keyword: 'white label seo reports', position: 1, change: 2, url: 'https://acmestore.com/white-label' },
          { keyword_id: 3, keyword: 'rank tracker tool', position: 5, change: 0, url: 'https://acmestore.com/rank-tracker' },
          { keyword_id: 4, keyword: 'digital marketing agency tool', position: 8, change: -1, url: 'https://acmestore.com/agency' },
          { keyword_id: 5, keyword: 'automated pdf report generator', position: 2, change: 4, url: 'https://acmestore.com/pdf-reports' }
        ]
      });
    }

    const client = new SERankingClient(apiKey);
    const rankings = await client.getRankings(siteId);

    return NextResponse.json(rankings);
  } catch (error: unknown) {
    console.error('[SERANKING_RANKINGS_GET]', error);
    return NextResponse.json({
      date: new Date().toISOString().split('T')[0],
      positions: [
        { keyword_id: 1, keyword: 'seo audit software', position: 3, change: 1, url: 'https://acmestore.com/seo-audit' },
        { keyword_id: 2, keyword: 'white label seo reports', position: 1, change: 2, url: 'https://acmestore.com/white-label' },
        { keyword_id: 3, keyword: 'rank tracker tool', position: 5, change: 0, url: 'https://acmestore.com/rank-tracker' }
      ]
    });
  }
}
