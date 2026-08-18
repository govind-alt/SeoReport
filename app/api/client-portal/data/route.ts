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
            keywordSnapshots: { orderBy: { date: 'desc' }, take: 7 },
            analyticsSnapshots: { orderBy: { date: 'desc' }, take: 7 },
            auditSnapshots: { orderBy: { date: 'desc' }, take: 1 },
            backlinkSnapshots: { orderBy: { date: 'desc' }, take: 1 },
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
          keywordSnapshots: { orderBy: { date: 'desc' }, take: 7 },
          analyticsSnapshots: { orderBy: { date: 'desc' }, take: 7 },
          auditSnapshots: { orderBy: { date: 'desc' }, take: 1 },
          backlinkSnapshots: { orderBy: { date: 'desc' }, take: 1 },
          reports: { orderBy: { periodStart: 'desc' }, take: 20 },
          reportSchedule: true,
        },
      });
      if (fallbackClient) {
        client = fallbackClient;
      }
    }

    const project = client;
    
    // ── Check if we need to return demo data ──────────────────────────────
    const isDemo = !project || project.keywordSnapshots.length < 2 || project.analyticsSnapshots.length < 2;

    if (isDemo) {
      return NextResponse.json({
        client: client ? {
          id: client.id, name: client.name, domain: client.domain, industry: client.industry, contactEmail: client.contactEmail, contactName: client.contactName,
        } : null,
        kpis: { organicSessions: 0, organicSessionsDelta: 0, top10Keywords: 0, top10Delta: 0, domainTrust: 0, healthScore: 0, totalKeywords: 0, totalBacklinks: 0, clicks: 0, impressions: 0 },
        keywordHistory: [],
        analyticsHistory: [],
        posDistribution: [],
        keywords: [],
        topQueries: [],
        latestAudit: null,
        reports: [],
        reportSchedule: client?.reportSchedule ? { dayOfMonth: client.reportSchedule.dayOfMonth, autoSend: client.reportSchedule.autoSend, isActive: client.reportSchedule.isActive } : null,
        isEmptyState: true
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
    const reports = client!.reports.map((r: any) => {
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
