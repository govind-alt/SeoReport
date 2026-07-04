import { NextResponse } from 'next/server';
import { SERankingClient } from '@/lib/seranking/client';
// import { decrypt } from '@/lib/encryption';
// import { prisma } from '@/lib/prisma';
// import { auth } from '@/lib/auth';

/**
 * GET /api/seranking/projects
 * Fetches the list of SERanking projects for the authenticated agency.
 */
export async function GET(request: Request) {
  try {
    // 1. Authenticate user
    // const session = await auth();
    // if (!session?.user?.agencyId) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    // 2. Fetch Agency's encrypted API key from DB
    // const agency = await prisma.agency.findUnique({
    //   where: { id: session.user.agencyId },
    //   select: { serankingApiKey: true } // Note: requires schema update
    // });
    
    // if (!agency?.serankingApiKey) {
    //   return new NextResponse('SERanking API Key not configured', { status: 400 });
    // }

    // 3. Decrypt key and call client
    // const apiKey = decrypt(agency.serankingApiKey);
    
    // For now, using a test key from ENV or a mock
    const apiKey = process.env.SERANKING_API_KEY_TEST;
    if (!apiKey) {
        // Return mock data if no key is configured, so UI can be built
        return NextResponse.json([
            { id: 1, name: 'Mock Project A', url: 'https://example.com' },
            { id: 2, name: 'Mock Project B', url: 'https://test.com' }
        ]);
    }

    const client = new SERankingClient(apiKey);
    const sites = await client.getSites();

    return NextResponse.json(sites);
  } catch (error: any) {
    console.error('[SERANKING_PROJECTS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
