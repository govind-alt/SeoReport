import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { SERankingClient } from '@/lib/seranking/client';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const countryIdParam = searchParams.get('countryId');
    
    if (!keyword) {
      return NextResponse.json({ error: 'keyword parameter is required' }, { status: 400 });
    }

    const countryId = countryIdParam ? parseInt(countryIdParam, 10) : 840; // Default US

    const agency = await prisma.agency.findUnique({
      where: { id: session.user.agencyId as string },
      select: { serankingApiKey: true },
    });

    if (!agency?.serankingApiKey) {
      // Demo mock data
      const q = keyword.toLowerCase();
      return NextResponse.json([
        { keyword: q, search_volume: 18400, difficulty: 68, cpc: 14.50, intent: 'Commercial' },
        { keyword: `best ${q}`, search_volume: 9200, difficulty: 54, cpc: 12.20, intent: 'Transactional' },
        { keyword: `${q} services`, search_volume: 5600, difficulty: 42, cpc: 9.80, intent: 'Commercial' },
        { keyword: `how to ${q}`, search_volume: 33100, difficulty: 76, cpc: 6.40, intent: 'Informational' },
      ]);
    }

    const apiKey = decrypt(agency.serankingApiKey);
    const client = new SERankingClient(apiKey);
    
    const data = await client.getKeywordResearch(keyword, countryId);

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('[SERANKING_KEYWORD_RESEARCH_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
