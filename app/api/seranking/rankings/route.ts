import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { SERankingClient } from '@/lib/seranking/client';

/**
 * GET /api/seranking/rankings?siteId=123&dateFrom=2026-06-01&dateTo=2026-06-30
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteIdParam = searchParams.get('siteId');
    const dateFrom = searchParams.get('dateFrom') ?? undefined;
    const dateTo = searchParams.get('dateTo') ?? undefined;

    if (!siteIdParam) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }
    const siteId = parseInt(siteIdParam, 10);
    if (isNaN(siteId)) {
      return NextResponse.json({ error: 'Invalid siteId' }, { status: 400 });
    }

    const agency = await prisma.agency.findUnique({
      where: { id: session.user.agencyId as string },
      select: { serankingApiKey: true },
    });

    if (!agency?.serankingApiKey) {
      // Demo data
      return NextResponse.json({
        date: new Date().toISOString().split('T')[0],
        positions: [
          { keyword_id: 1, keyword_name: 'seo agency london', position: 4, prev_position: 7, change: 3, url: '/seo-services', volume: 1600, difficulty: 68 },
          { keyword_id: 2, keyword_name: 'local seo london', position: 2, prev_position: 10, change: 8, url: '/local-seo', volume: 880, difficulty: 54 },
          { keyword_id: 3, keyword_name: 'digital marketing uk', position: 7, prev_position: 6, change: -1, url: '/digital-mktg', volume: 2400, difficulty: 72 },
          { keyword_id: 4, keyword_name: 'seo company london', position: 9, prev_position: 14, change: 5, url: '/seo-services', volume: 1200, difficulty: 71 },
          { keyword_id: 5, keyword_name: 'seo audit tool uk', position: 28, prev_position: 28, change: 0, url: '/audit', volume: 390, difficulty: 58 },
        ],
      });
    }

    const apiKey = decrypt(agency.serankingApiKey);
    const client = new SERankingClient(apiKey);
    const rankings = await client.getRankings(siteId, dateFrom, dateTo);

    return NextResponse.json(rankings);
  } catch (error: unknown) {
    console.error('[SERANKING_RANKINGS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
