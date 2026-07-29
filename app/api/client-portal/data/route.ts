import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** GET /api/client-portal/data
 *  Returns all data needed by the client portal dashboard.
 *  Resolves the client from the logged-in user's email via the Invitation table.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;

    // ── Resolve client from accepted invitation ────────────────────────────
    const invitation = await prisma.invitation.findFirst({
      where: {
        email,
        acceptedAt: { not: null },
      },
      include: {
        client: {
          include: {
            serankingProject: {
              include: {
                keywordSnapshots: { orderBy: { date: 'desc' }, take: 7 },
                analyticsSnapshots: { orderBy: { date: 'desc' }, take: 7 },
                auditSnapshots: { orderBy: { date: 'desc' }, take: 1 },
                backlinkSnapshots: { orderBy: { date: 'desc' }, take: 1 },
              },
            },
            reports: { orderBy: { periodStart: 'desc' }, take: 20 },
            reportSchedule: true,
          },
        },
      },
    });

    let client = invitation?.client;

    if (!client) {
      const fallbackClient = await prisma.client.findFirst({
        where: { contactEmail: email },
        include: {
          serankingProject: {
            include: {
              keywordSnapshots: { orderBy: { date: 'desc' }, take: 7 },
              analyticsSnapshots: { orderBy: { date: 'desc' }, take: 7 },
              auditSnapshots: { orderBy: { date: 'desc' }, take: 1 },
              backlinkSnapshots: { orderBy: { date: 'desc' }, take: 1 },
            },
          },
          reports: { orderBy: { periodStart: 'desc' }, take: 20 },
          reportSchedule: true,
        },
      });
      if (fallbackClient) {
        client = fallbackClient;
      }
    }

    const project = client?.serankingProject;
    
    // ── Check if we need to return demo data ──────────────────────────────
    const isDemo = !project || project.keywordSnapshots.length < 2 || project.analyticsSnapshots.length < 2;

    if (isDemo) {
      return NextResponse.json({
        client: client ? {
          id: client.id, name: client.name, domain: client.domain, industry: client.industry, contactEmail: client.contactEmail, contactName: client.contactName,
        } : {
          id: 'demo', name: 'Demo Client', domain: 'acme.com', industry: 'SaaS', contactEmail: email, contactName: 'Demo User',
        },
        kpis: { organicSessions: 8420, organicSessionsDelta: 16.3, top10Keywords: 47, top10Delta: 6, domainTrust: 52, healthScore: 76, totalKeywords: 320, totalBacklinks: 2450, clicks: 6700, impressions: 124000 },
        keywordHistory: [
          { month: 'Nov', top3: 14, top10: 32 },
          { month: 'Dec', top3: 18, top10: 38 },
          { month: 'Jan', top3: 22, top10: 43 },
          { month: 'Feb', top3: 28, top10: 47 },
          { month: 'Mar', top3: 33, top10: 51 },
          { month: 'Apr', top3: 31, top10: 48 },
          { month: 'May', top3: 47, top10: 64 },
        ],
        analyticsHistory: [
          { month: 'Nov', sessions: 4100, clicks: 3200 },
          { month: 'Dec', sessions: 4800, clicks: 3700 },
          { month: 'Jan', sessions: 5200, clicks: 4100 },
          { month: 'Feb', sessions: 6100, clicks: 4900 },
          { month: 'Mar', sessions: 7400, clicks: 5800 },
          { month: 'Apr', sessions: 6900, clicks: 5400 },
          { month: 'May', sessions: 8420, clicks: 6700 },
        ],
        posDistribution: [
          { name: 'Top 3', value: 47, color: '#10B981' },
          { name: 'Pos 4–10', value: 17, color: '#4F8EF7' },
          { name: 'Pos 11–30', value: 96, color: '#F59E0B' },
          { name: 'Pos 31+', value: 160, color: '#E4E9F2' },
        ],
        keywords: [
          { keyword: 'local seo london',      pos: 2,  change: 8,  vol: 880,  url: '/local-seo',    trend: 'up' },
          { keyword: 'seo agency london',     pos: 4,  change: 3,  vol: 1600, url: '/services/seo', trend: 'up' },
          { keyword: 'digital marketing uk',  pos: 7,  change: -1, vol: 2400, url: '/about',         trend: 'down' },
          { keyword: 'best seo company uk',   pos: 9,  change: 2,  vol: 1800, url: '/about-us',     trend: 'up' },
          { keyword: 'google ranking service',pos: 15, change: 0,  vol: 1200, url: '/services',     trend: 'flat' },
          { keyword: 'technical seo audit',   pos: 22, change: -3, vol: 640,  url: '/audit',        trend: 'down' },
          { keyword: 'ecommerce seo agency',  pos: 28, change: 8,  vol: 1600, url: '/ecommerce',    trend: 'up' },
          { keyword: 'content marketing seo', pos: 34, change: -1, vol: 2100, url: '/content',      trend: 'down' },
          { keyword: 'seo consultant london', pos: 11, change: 2,  vol: 960,  url: '/consultant',   trend: 'up' },
          { keyword: 'ppc agency london',     pos: 11, change: 3,  vol: 720,  url: '/ppc',          trend: 'up' },
        ],
        topQueries: [
          { query: 'best seo agency london', impressions: 4500, clicks: 320, ctr: 0.071 },
          { query: 'digital marketing company', impressions: 3200, clicks: 180, ctr: 0.056 },
          { query: 'ecommerce seo consultant', impressions: 1800, clicks: 145, ctr: 0.080 },
          { query: 'seo pricing guide 2026', impressions: 1200, clicks: 95, ctr: 0.079 },
          { query: 'outsource seo', impressions: 850, clicks: 42, ctr: 0.049 },
        ],
        latestAudit: { healthScore: 76, pagesCrawled: 1542, criticalIssues: 2, warningIssues: 18 },
        reports: client ? client.reports.map((r: any) => ({
          id: r.id, period: new Date(r.periodStart).toLocaleString('default', { month: 'long', year: 'numeric' }),
          periodStart: r.periodStart, periodEnd: r.periodEnd, generatedDate: r.generatedAt ? new Date(r.generatedAt).toLocaleDateString() : 'Pending',
          status: r.status, shareSlug: r.shareSlug, pdfUrl: r.pdfUrl, viewCount: r.viewCount,
          aiRecs: r.aiRecsJson ? JSON.parse(r.aiRecsJson) : [], sections: r.sectionsJson ? JSON.parse(r.sectionsJson) : {}
        })) : [
          { id: 'r1', period: 'May 2026', periodStart: new Date(), periodEnd: new Date(), generatedDate: 'Jun 1, 2026', status: 'done', shareSlug: 'demo1', pdfUrl: null, viewCount: 2, aiRecs: [
            { priority: 'critical', title: 'Fix broken internal links', detail: '3 critical broken links on /blog/post-14 and /resources/guide-2. Fix this week to recover crawl budget.', impact: 'High' },
            { priority: 'high', title: 'Push "ppc agency london" (Pos.11)', detail: 'Add 2–3 internal links from blog posts to /ppc page to enter the top 10.', impact: 'Medium' },
            { priority: 'medium', title: 'Write 8 missing meta descriptions', detail: '8 blog pages lack meta descriptions, reducing CTR in search results.', impact: 'Medium' },
            { priority: 'low', title: 'Compress hero images on homepage', detail: 'Hero images are 2.4 MB uncompressed. Reducing to <200 KB can improve LCP by 1.2s.', impact: 'Low' }
          ], sections: {} },
          { id: 'r2', period: 'April 2026', periodStart: new Date(), periodEnd: new Date(), generatedDate: 'May 1, 2026', status: 'done', shareSlug: 'demo2', pdfUrl: null, viewCount: 4, aiRecs: [], sections: {} },
          { id: 'r3', period: 'March 2026', periodStart: new Date(), periodEnd: new Date(), generatedDate: 'Apr 1, 2026', status: 'done', shareSlug: 'demo3', pdfUrl: null, viewCount: 6, aiRecs: [], sections: {} },
          { id: 'r4', period: 'February 2026', periodStart: new Date(), periodEnd: new Date(), generatedDate: 'Mar 1, 2026', status: 'done', shareSlug: 'demo4', pdfUrl: null, viewCount: 1, aiRecs: [], sections: {} }
        ],
        reportSchedule: client?.reportSchedule ? { dayOfMonth: client.reportSchedule.dayOfMonth, autoSend: client.reportSchedule.autoSend, isActive: client.reportSchedule.isActive } : null,
        isDemoData: true
      });
    }

    // ── Build keyword history (oldest → newest for chart) ─────────────────
    const keywordHistory = project
      ? [...project.keywordSnapshots].reverse().map((s) => ({
          month: new Date(s.date).toLocaleString('default', { month: 'short' }),
          top3: s.top3Count,
          top10: s.top10Count,
          top30: s.top30Count,
          total: s.totalKeywords,
          avgPosition: s.avgPosition,
        }))
      : [];

    // ── Build analytics history (oldest → newest for chart) ───────────────
    const analyticsHistory = project
      ? [...project.analyticsSnapshots].reverse().map((s) => ({
          month: new Date(s.date).toLocaleString('default', { month: 'short' }),
          sessions: s.organicSessions,
          clicks: s.clicks,
          impressions: s.impressions,
          ctr: s.ctr,
          avgPosition: s.avgPosition,
        }))
      : [];

    // ── Latest snapshots ──────────────────────────────────────────────────
    const latestKeyword = project?.keywordSnapshots[0] ?? null;
    const latestAnalytics = project?.analyticsSnapshots[0] ?? null;
    const latestAudit = project?.auditSnapshots[0] ?? null;
    const latestBacklink = project?.backlinkSnapshots[0] ?? null;

    // ── Previous period snapshots (for deltas) ────────────────────────────
    const prevKeyword = project?.keywordSnapshots[1] ?? null;
    const prevAnalytics = project?.analyticsSnapshots[1] ?? null;

    // ── Real keyword positions from latest snapshot ────────────────────────
    let keywords: any[] = [];
    if (latestKeyword?.positionsJson) {
      try {
        keywords = JSON.parse(latestKeyword.positionsJson);
      } catch {}
    }

    // ── Position distribution for pie chart ───────────────────────────────
    const posDistribution = latestKeyword
      ? [
          { name: 'Top 3',    value: latestKeyword.top3Count,                                         color: '#10B981' },
          { name: 'Pos 4–10', value: Math.max(0, latestKeyword.top10Count - latestKeyword.top3Count),  color: '#4F8EF7' },
          { name: 'Pos 11–30', value: Math.max(0, latestKeyword.top30Count - latestKeyword.top10Count), color: '#F59E0B' },
          { name: 'Pos 31+',  value: Math.max(0, latestKeyword.totalKeywords - latestKeyword.top30Count), color: '#E4E9F2' },
        ]
      : [];

    // ── Top queries from analytics ─────────────────────────────────────────
    let topQueries: any[] = [];
    if (latestAnalytics?.topQueriesJson) {
      try {
        topQueries = JSON.parse(latestAnalytics.topQueriesJson);
      } catch {}
    }

    // ── Reports ───────────────────────────────────────────────────────────
    const reports = client!.reports.map((r) => {
      let aiRecs: any[] = [];
      let sections: any = {};
      if (r.aiRecsJson) { try { aiRecs = JSON.parse(r.aiRecsJson); } catch {} }
      if (r.sectionsJson) { try { sections = JSON.parse(r.sectionsJson); } catch {} }
      return {
        id: r.id,
        period: new Date(r.periodStart).toLocaleString('default', { month: 'long', year: 'numeric' }),
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        generatedDate: r.generatedAt
          ? new Date(r.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Pending',
        status: r.status,
        shareSlug: r.shareSlug,
        pdfUrl: r.pdfUrl,
        viewCount: r.viewCount,
        aiRecs,
        sections,
      };
    });

    return NextResponse.json({
      client: {
        id: client!.id,
        name: client!.name,
        domain: client!.domain,
        industry: client!.industry,
        contactEmail: client!.contactEmail,
        contactName: client!.contactName,
      },
      kpis: {
        organicSessions: latestAnalytics?.organicSessions ?? 0,
        organicSessionsDelta: prevAnalytics
          ? (((latestAnalytics?.organicSessions ?? 0) - prevAnalytics.organicSessions) / Math.max(1, prevAnalytics.organicSessions)) * 100
          : 0,
        top10Keywords: latestKeyword?.top10Count ?? 0,
        top10Delta: prevKeyword
          ? (latestKeyword?.top10Count ?? 0) - prevKeyword.top10Count
          : 0,
        domainTrust: latestBacklink?.domainTrust ?? 0,
        healthScore: latestAudit?.healthScore ?? 0,
        totalKeywords: latestKeyword?.totalKeywords ?? 0,
        totalBacklinks: latestBacklink?.totalBacklinks ?? 0,
        clicks: latestAnalytics?.clicks ?? 0,
        impressions: latestAnalytics?.impressions ?? 0,
      },
      keywordHistory,
      analyticsHistory,
      posDistribution,
      keywords,
      topQueries,
      latestAudit: latestAudit
        ? {
            healthScore: latestAudit.healthScore,
            pagesCrawled: latestAudit.pagesCrawled,
            criticalIssues: latestAudit.criticalIssues,
            warningIssues: latestAudit.warningIssues,
          }
        : null,
      reports,
      reportSchedule: client!.reportSchedule
        ? {
            dayOfMonth: client!.reportSchedule.dayOfMonth,
            autoSend: client!.reportSchedule.autoSend,
            isActive: client!.reportSchedule.isActive,
          }
        : null,
    });
  } catch (error) {
    console.error('[CLIENT_PORTAL_DATA]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
