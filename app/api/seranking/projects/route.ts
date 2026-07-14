import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { SERankingClient } from '@/lib/seranking/client';

/**
 * GET /api/seranking/projects
 * Returns the agency's SERanking project list.
 * Falls back to mock data if no API key configured (demo mode).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { id: session.user.agencyId as string },
      select: { serankingApiKey: true },
    });

    if (!agency?.serankingApiKey) {
      // Demo mode: return mock projects
      return NextResponse.json([
        { id: 1001, name: 'Acme Corp', url: 'https://acmecorp.com' },
        { id: 1002, name: 'TechStart.io', url: 'https://techstart.io' },
        { id: 1003, name: 'GreenLeaf Organics', url: 'https://greenleaf.com' },
        { id: 1004, name: 'BlueSky Marketing', url: 'https://bluesky.co.uk' },
        { id: 1005, name: 'RetailPro Ltd', url: 'https://retailpro.co.uk' },
      ]);
    }

    const apiKey = decrypt(agency.serankingApiKey);
    const client = new SERankingClient(apiKey);
    const sites = await client.getSites();

    return NextResponse.json(sites);
  } catch (error: unknown) {
    console.error('[SERANKING_PROJECTS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
