import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { SERankingClient } from '@/lib/seranking/client';

/**
 * GET /api/seranking/backlinks?domain=acmecorp.com&type=summary|new|lost&limit=50
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const type = searchParams.get('type') ?? 'summary';
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    if (!domain) {
      return NextResponse.json({ error: 'domain is required' }, { status: 400 });
    }

    const agency = await prisma.agency.findUnique({
      where: { id: session.user.agencyId as string },
      select: { serankingApiKey: true },
    });

    if (!agency?.serankingApiKey) {
      // Return mock data when no API key is configured (demo mode)
      const mockData = {
        summary: {
          domain_trust: 42,
          total_backlinks: 1284,
          referring_domains: 287,
          dofollow_links: 1102,
          nofollow_links: 182,
        },
        new: [
          { id: 1, domain_from: 'forbes.com', url_from: 'https://forbes.com/tech', url_to: `https://${domain}`, anchor_text: 'SEO agency', is_dofollow: true, domain_trust: 94 },
          { id: 2, domain_from: 'searchengineland.com', url_from: 'https://searchengineland.com/tools', url_to: `https://${domain}`, anchor_text: 'SEO tools', is_dofollow: true, domain_trust: 88 },
        ],
        lost: [
          { id: 3, domain_from: 'oldsite.com', url_from: 'https://oldsite.com/resources', url_to: `https://${domain}`, anchor_text: domain, is_dofollow: false, domain_trust: 28 },
        ],
      };
      return NextResponse.json(type === 'new' ? mockData.new : type === 'lost' ? mockData.lost : mockData.summary);
    }

    const apiKey = decrypt(agency.serankingApiKey);
    const client = new SERankingClient(apiKey);

    let data;
    if (type === 'new') {
      data = await client.getNewBacklinks(domain, limit);
    } else if (type === 'lost') {
      data = await client.getLostBacklinks(domain, limit);
    } else {
      data = await client.getBacklinksSummary(domain);
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('[SERANKING_BACKLINKS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
