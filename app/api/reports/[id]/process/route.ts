import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { SERankingClient } from '@/lib/seranking/client';
import { dispatchWebhooks } from '@/lib/webhook-dispatcher';

/**
 * POST /api/reports/[id]/process
 * Triggers the actual report generation:
 *   1. Fetches SE Ranking data (or uses demo snapshots if no API key)
 *   2. Saves/updates snapshot records in DB
 *   3. Marks the report as 'done'
 *
 * Designed to be called fire-and-forget right after POST /api/reports.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch the report and related data
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            agency: { select: { id: true, serankingApiKey: true } },
            serankingProject: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Already done/failed — skip
    if (report.status === 'done') {
      return NextResponse.json({ status: 'already_done' });
    }

    const client = report.client;
    const agency = client.agency;
    const today = new Date();

    let snapshotSaved = false;

    // ── Attempt real SE Ranking fetch if API key + project linked ──────────
    if (agency.serankingApiKey && client.serankingProjectId && client.serankingProject) {
      try {
        const apiKey = decrypt(agency.serankingApiKey);
        const seClient = new SERankingClient(apiKey);
        const projectId = client.serankingProjectId;
        const seProjectId = client.serankingProject.id;

        // Parallel fetch
        const [rankingsResult, auditResult, backlinkResult] = await Promise.allSettled([
          seClient.getRankings(projectId),
          seClient.getAudit(projectId),
          seClient.getBacklinksSummary(client.domain),
        ]);

        // Rankings snapshot
        if (rankingsResult.status === 'fulfilled') {
          const rankings = rankingsResult.value;
          let top3 = 0, top10 = 0, top30 = 0, top100 = 0;
          rankings.positions.forEach(p => {
            if (p.position > 0 && p.position <= 3) top3++;
            if (p.position > 0 && p.position <= 10) top10++;
            if (p.position > 0 && p.position <= 30) top30++;
            if (p.position > 0 && p.position <= 100) top100++;
          });

          await prisma.keywordSnapshot.upsert({
            where: { serankingProjectId_date: { serankingProjectId: seProjectId, date: today } },
            update: { top3Count: top3, top10Count: top10, top30Count: top30, top100Count: top100, totalKeywords: rankings.positions.length },
            create: { serankingProjectId: seProjectId, date: today, top3Count: top3, top10Count: top10, top30Count: top30, top100Count: top100, totalKeywords: rankings.positions.length },
          });
          snapshotSaved = true;
        }

        // Audit snapshot
        if (auditResult.status === 'fulfilled') {
          const audit = auditResult.value;
          await prisma.auditSnapshot.upsert({
            where: { serankingProjectId_date: { serankingProjectId: seProjectId, date: today } },
            update: {
              healthScore: audit.health_score ?? 0,
              pagesCrawled: audit.pages_crawled ?? 0,
              criticalIssues: audit.issues?.critical ?? 0,
              warningIssues: audit.issues?.warnings ?? 0,
              noticeIssues: audit.issues?.notices ?? 0,
            },
            create: {
              serankingProjectId: seProjectId,
              date: today,
              healthScore: audit.health_score ?? 0,
              pagesCrawled: audit.pages_crawled ?? 0,
              criticalIssues: audit.issues?.critical ?? 0,
              warningIssues: audit.issues?.warnings ?? 0,
              noticeIssues: audit.issues?.notices ?? 0,
            },
          });
          snapshotSaved = true;
        }

        // Backlink snapshot
        if (backlinkResult.status === 'fulfilled') {
          const bl = backlinkResult.value;
          await prisma.backlinkSnapshot.upsert({
            where: { serankingProjectId_date: { serankingProjectId: seProjectId, date: today } },
            update: {
              domainTrust: (bl as any).domain_trust ?? (bl as any).domain_authority ?? null,
              totalBacklinks: bl.total_backlinks ?? 0,
              newBacklinks: bl.new_backlinks ?? 0,
              lostBacklinks: bl.lost_backlinks ?? 0,
              referringDomains: bl.referring_domains ?? 0,
            },
            create: {
              serankingProjectId: seProjectId,
              date: today,
              domainTrust: (bl as any).domain_trust ?? (bl as any).domain_authority ?? null,
              totalBacklinks: bl.total_backlinks ?? 0,
              newBacklinks: bl.new_backlinks ?? 0,
              lostBacklinks: bl.lost_backlinks ?? 0,
              referringDomains: bl.referring_domains ?? 0,
            },
          });
          snapshotSaved = true;
        }
      } catch (apiError) {
        console.error('[PROCESS] SE Ranking API error, falling back to demo data:', apiError);
      }
    }

    // ── Demo/fallback snapshot if no real data saved ──────────────────────
    if (!snapshotSaved && client.serankingProject) {
      const seProjectId = client.serankingProject.id;

      // Only create demo snapshots if none exist for this project
      const existingKw = await prisma.keywordSnapshot.findFirst({
        where: { serankingProjectId: seProjectId },
      });

      if (!existingKw) {
        await prisma.keywordSnapshot.create({
          data: {
            serankingProjectId: seProjectId,
            date: today,
            top3Count: 12,
            top10Count: 43,
            top30Count: 128,
            top100Count: 267,
            totalKeywords: 267,
            avgPosition: 18.4,
          },
        });

        await prisma.auditSnapshot.create({
          data: {
            serankingProjectId: seProjectId,
            date: today,
            healthScore: 78,
            pagesCrawled: 843,
            criticalIssues: 3,
            warningIssues: 14,
            noticeIssues: 23,
          },
        });

        await prisma.backlinkSnapshot.create({
          data: {
            serankingProjectId: seProjectId,
            date: today,
            domainTrust: 42,
            totalBacklinks: 2840,
            newBacklinks: 128,
            lostBacklinks: 12,
            referringDomains: 184,
          },
        });
      }
    }

    // ── Mark report as done ───────────────────────────────────────────────
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: 'done',
        generatedAt: today,
      },
      include: {
        client: { select: { id: true, name: true, domain: true, contactEmail: true, agency: { select: { name: true } }, reportSchedule: true } },
      },
    });

    if (updatedReport.client.reportSchedule?.autoSend && updatedReport.client.contactEmail) {
      const { sendReportReadyEmail } = await import('@/lib/email');
      const periodString = new Date(report.periodStart).toLocaleString('default', { month: 'long', year: 'numeric' });
      await sendReportReadyEmail(
        updatedReport.client.contactEmail,
        updatedReport.client.name,
        `${periodString} SEO Report`,
        id,
        updatedReport.client.agency.name
      ).catch(err => {
        console.error('[PROCESS] Failed to send report ready email:', err);
      });
    }

    console.log(`[PROCESS] Report ${id} marked as done.`);

    // Fire webhooks in background (do not await — non-blocking)
    const agencyId = updatedReport.client.agency?.name ? (
      await prisma.agency.findFirst({ where: { clients: { some: { id: updatedReport.client.id } } }, select: { id: true } })
    )?.id : null;
    if (agencyId) {
      dispatchWebhooks(agencyId, 'report.generated', {
        reportId: id,
        clientId: updatedReport.client.id,
        clientName: updatedReport.client.name,
        domain: updatedReport.client.domain,
      }).catch(console.error);
    }

    return NextResponse.json({ status: 'done', report: updatedReport });

  } catch (error: unknown) {
    console.error('[REPORT_PROCESS]', error);

    // Mark report as failed on uncaught error
    try {
      const failedReport = await prisma.report.update({
        where: { id },
        data: { status: 'failed' },
        include: { client: { select: { id: true, name: true, domain: true, agencyId: true } } },
      });
      // Fire webhook for failure
      dispatchWebhooks(failedReport.client.agencyId, 'report.failed', {
        reportId: id,
        clientId: failedReport.client.id,
        clientName: failedReport.client.name,
        domain: failedReport.client.domain,
        reason: String(error),
      }).catch(console.error);
    } catch { /* ignore */ }

    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
