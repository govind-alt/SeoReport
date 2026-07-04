import { NextResponse } from 'next/server';
import { SERankingClient } from '@/lib/seranking/client';

/**
 * GET /api/seranking/rankings?siteId=123
 * Fetches the rankings for a specific SERanking project.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteIdParam = searchParams.get('siteId');

    if (!siteIdParam) {
      return new NextResponse('siteId is required', { status: 400 });
    }

    const siteId = parseInt(siteIdParam, 10);
    if (isNaN(siteId)) {
        return new NextResponse('Invalid siteId', { status: 400 });
    }

    // Auth & Key retrieval would go here...
    
    const apiKey = process.env.SERANKING_API_KEY_TEST;
    if (!apiKey) {
        // Return mock data
        return NextResponse.json({
            date: new Date().toISOString().split('T')[0],
            positions: [
                { keyword_id: 1, position: 3, change: 1, url: 'https://example.com/page-1' },
                { keyword_id: 2, position: 12, change: -2, url: 'https://example.com/page-2' }
            ]
        });
    }

    const client = new SERankingClient(apiKey);
    const rankings = await client.getRankings(siteId);

    return NextResponse.json(rankings);
  } catch (error: unknown) {
    console.error('[SERANKING_RANKINGS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
