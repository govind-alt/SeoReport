import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { SERankingClient } from '@/lib/seranking/client';

/**
 * GET /api/seranking/audit?siteId=123&includeIssues=true
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteIdParam = searchParams.get('siteId');
    const includeIssues = searchParams.get('includeIssues') === 'true';

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
      // Demo data when no API key is configured
      const demoAudit = {
        status: {
          health_score: 76,
          pages_crawled: 843,
          indexable_pages: 798,
          issues: { critical: 3, warnings: 14, notices: 23 },
          last_audit_date: new Date().toISOString(),
        },
        issues: includeIssues ? [
          { type: 'broken_internal_links', severity: 'critical', count: 3, description: 'Pages with 404 errors found in internal links', affected_pages: ['/blog/post-14', '/resources/guide-3', '/old-services'] },
          { type: 'missing_meta_description', severity: 'warning', count: 14, description: 'Pages missing meta descriptions', affected_pages: ['14 pages'] },
          { type: 'slow_page_load', severity: 'warning', count: 4, description: 'Pages loading slower than 3 seconds', affected_pages: ['/shop', '/pricing', '/contact', '/about'] },
          { type: 'duplicate_title_tags', severity: 'notice', count: 7, description: 'Pages with duplicate title tags' },
          { type: 'missing_alt_attributes', severity: 'notice', count: 23, description: 'Images missing alt text' },
        ] : null,
      };
      return NextResponse.json(demoAudit);
    }

    const apiKey = decrypt(agency.serankingApiKey);
    const client = new SERankingClient(apiKey);

    const [status, issues] = await Promise.all([
      client.getAudit(siteId),
      includeIssues ? client.getAuditIssues(siteId) : Promise.resolve(null),
    ]);

    return NextResponse.json({ status, issues });
  } catch (error: unknown) {
    console.error('[SERANKING_AUDIT_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
