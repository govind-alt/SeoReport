import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { SERankingClient } from '@/lib/seranking/client';

/** GET /api/seranking/competitors?siteId=xxx&domain=xxx */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteIdStr = searchParams.get('siteId');
  const domain    = searchParams.get('domain');

  if (!siteIdStr && !domain) {
    return NextResponse.json({ error: 'siteId or domain required' }, { status: 400 });
  }

  try {
    // Find agency API key — try to get it from the project or from domain
    let agency = null;

    if (siteIdStr) {
      const project = await prisma.sERankingProject.findFirst({
        where: { serankingId: parseInt(siteIdStr) },
        include: { client: { include: { agency: true } } },
      });
      agency = project?.client?.agency;
    } else if (domain) {
      agency = await prisma.agency.findFirst({
        where: { OR: [{ slug: domain }, { subdomain: domain }] },
      });
    }

    if (!agency?.serankingApiKey) {
      // Return mock data for demo purposes
      return NextResponse.json({
        competitors: getMockCompetitors(),
        source: 'mock',
      });
    }

    const apiKey = decrypt(agency.serankingApiKey);
    const client = new SERankingClient(apiKey);

    const siteId = parseInt(siteIdStr ?? '0');
    if (!siteId) {
      return NextResponse.json({ competitors: getMockCompetitors(), source: 'mock' });
    }

    const competitors = await client.getCompetitors(siteId);
    return NextResponse.json({ competitors, source: 'live' });

  } catch (err) {
    console.error('[COMPETITORS_GET]', err);
    // Fallback to mock on API error
    return NextResponse.json({ competitors: getMockCompetitors(), source: 'mock' });
  }
}

function getMockCompetitors() {
  return [
    {
      id: 1,
      domain: 'semrush.com',
      visibility: 94.2,
      traffic: 4820000,
      keywords: 12400,
      avg_position: 8.4,
      trust_score: 94,
      new_keywords: 340,
      lost_keywords: 120,
    },
    {
      id: 2,
      domain: 'ahrefs.com',
      visibility: 87.6,
      traffic: 2150000,
      keywords: 8700,
      avg_position: 11.2,
      trust_score: 89,
      new_keywords: 210,
      lost_keywords: 85,
    },
    {
      id: 3,
      domain: 'moz.com',
      visibility: 76.3,
      traffic: 1380000,
      keywords: 6200,
      avg_position: 14.7,
      trust_score: 82,
      new_keywords: 156,
      lost_keywords: 67,
    },
    {
      id: 4,
      domain: 'searchengineland.com',
      visibility: 68.1,
      traffic: 980000,
      keywords: 4800,
      avg_position: 17.1,
      trust_score: 78,
      new_keywords: 98,
      lost_keywords: 44,
    },
    {
      id: 5,
      domain: 'serpstat.com',
      visibility: 52.4,
      traffic: 620000,
      keywords: 3100,
      avg_position: 21.3,
      trust_score: 71,
      new_keywords: 74,
      lost_keywords: 31,
    },
  ];
}
