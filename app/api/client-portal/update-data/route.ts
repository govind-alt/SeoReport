import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve client and their seranking project
    const invitation = await prisma.invitation.findFirst({
      where: { email: session.user.email, acceptedAt: { not: null } },
      include: {
        client: {
          include: {
            serankingProject: {
              include: {
                keywordSnapshots: { orderBy: { date: 'desc' }, take: 1 },
                analyticsSnapshots: { orderBy: { date: 'desc' }, take: 1 },
                backlinkSnapshots: { orderBy: { date: 'desc' }, take: 1 },
                auditSnapshots: { orderBy: { date: 'desc' }, take: 1 },
              }
            }
          }
        }
      },
    });

    if (!invitation || !invitation.client) {
      return NextResponse.json({ error: 'Client record not found' }, { status: 404 });
    }

    const client = invitation.client;
    let project = client.serankingProject;

    // Create a mock SERankingProject if it doesn't exist
    if (!project) {
      const serankingId = Math.floor(1000000 + Math.random() * 9000000);
      project = await prisma.sERankingProject.create({
        data: {
          serankingId,
          name: client.name,
          url: client.domain,
          clientId: client.id
        },
        include: {
          keywordSnapshots: true,
          analyticsSnapshots: true,
          backlinkSnapshots: true,
          auditSnapshots: true,
        }
      });
    }

    const body = await request.json();
    const { metrics, newKeyword, deleteKeyword, generateReport } = body;
    const now = new Date();

    // ── 1. UPDATE METRICS ──
    if (metrics) {
      const latestKw = project.keywordSnapshots[0];
      const latestAn = project.analyticsSnapshots[0];
      const latestBl = project.backlinkSnapshots[0];
      const latestAu = project.auditSnapshots[0];

      // Update or create Keyword Snapshot
      if (latestKw) {
        await prisma.keywordSnapshot.update({
          where: { id: latestKw.id },
          data: {
            top3Count: metrics.top3Count !== undefined ? Number(metrics.top3Count) : latestKw.top3Count,
            top10Count: metrics.top10Count !== undefined ? Number(metrics.top10Count) : latestKw.top10Count,
            top30Count: metrics.top30Count !== undefined ? Number(metrics.top30Count) : latestKw.top30Count,
            totalKeywords: metrics.totalKeywords !== undefined ? Number(metrics.totalKeywords) : latestKw.totalKeywords,
            avgPosition: metrics.avgPosition !== undefined ? Number(metrics.avgPosition) : latestKw.avgPosition,
          }
        });
      } else {
        await prisma.keywordSnapshot.create({
          data: {
            date: now,
            serankingProjectId: project.id,
            top3Count: Number(metrics.top3Count || 0),
            top10Count: Number(metrics.top10Count || 0),
            top30Count: Number(metrics.top30Count || 0),
            totalKeywords: Number(metrics.totalKeywords || 0),
            avgPosition: Number(metrics.avgPosition || 15.0),
            positionsJson: '[]',
          }
        });
      }

      // Update or create Analytics Snapshot
      if (latestAn) {
        const clicks = metrics.clicks !== undefined ? Number(metrics.clicks) : latestAn.clicks;
        const impressions = metrics.impressions !== undefined ? Number(metrics.impressions) : latestAn.impressions;
        await prisma.analyticsSnapshot.update({
          where: { id: latestAn.id },
          data: {
            organicSessions: metrics.organicSessions !== undefined ? Number(metrics.organicSessions) : latestAn.organicSessions,
            clicks,
            impressions,
            ctr: impressions > 0 ? parseFloat((clicks / impressions).toFixed(4)) : 0,
          }
        });
      } else {
        const clicks = Number(metrics.clicks || 0);
        const impressions = Number(metrics.impressions || 0);
        await prisma.analyticsSnapshot.create({
          data: {
            date: now,
            serankingProjectId: project.id,
            organicSessions: Number(metrics.organicSessions || 0),
            clicks,
            impressions,
            ctr: impressions > 0 ? parseFloat((clicks / impressions).toFixed(4)) : 0,
            topQueriesJson: '[]',
            topPagesJson: '[]',
          }
        });
      }

      // Update or create Backlink Snapshot
      if (latestBl) {
        await prisma.backlinkSnapshot.update({
          where: { id: latestBl.id },
          data: {
            domainTrust: metrics.domainTrust !== undefined ? Number(metrics.domainTrust) : latestBl.domainTrust,
            totalBacklinks: metrics.totalBacklinks !== undefined ? Number(metrics.totalBacklinks) : latestBl.totalBacklinks,
          }
        });
      } else {
        await prisma.backlinkSnapshot.create({
          data: {
            date: now,
            serankingProjectId: project.id,
            domainTrust: Number(metrics.domainTrust || 0),
            totalBacklinks: Number(metrics.totalBacklinks || 0),
          }
        });
      }

      // Update or create Audit Snapshot
      if (latestAu) {
        await prisma.auditSnapshot.update({
          where: { id: latestAu.id },
          data: {
            healthScore: metrics.healthScore !== undefined ? Number(metrics.healthScore) : latestAu.healthScore,
            criticalIssues: metrics.criticalIssues !== undefined ? Number(metrics.criticalIssues) : latestAu.criticalIssues,
          }
        });
      } else {
        await prisma.auditSnapshot.create({
          data: {
            date: now,
            serankingProjectId: project.id,
            healthScore: Number(metrics.healthScore || 100),
            criticalIssues: Number(metrics.criticalIssues || 0),
            issuesJson: '[]'
          }
        });
      }
    }

    // ── 2. ADD KEYWORD ──
    if (newKeyword) {
      const latestKw = project.keywordSnapshots[0];
      let kws: any[] = [];

      if (latestKw) {
        try {
          kws = JSON.parse(latestKw.positionsJson || '[]');
        } catch {}
      }

      // Append new keyword
      kws.push({
        keyword: newKeyword.keyword,
        pos: Number(newKeyword.pos || 10),
        change: 0,
        vol: Number(newKeyword.vol || 100),
        url: newKeyword.url || '/'
      });

      if (latestKw) {
        await prisma.keywordSnapshot.update({
          where: { id: latestKw.id },
          data: {
            positionsJson: JSON.stringify(kws),
            totalKeywords: kws.length,
          }
        });
      } else {
        await prisma.keywordSnapshot.create({
          data: {
            date: now,
            serankingProjectId: project.id,
            totalKeywords: kws.length,
            positionsJson: JSON.stringify(kws),
          }
        });
      }
    }

    // ── 3. DELETE KEYWORD ──
    if (deleteKeyword) {
      const latestKw = project.keywordSnapshots[0];
      if (latestKw) {
        try {
          let kws = JSON.parse(latestKw.positionsJson || '[]');
          kws = kws.filter((k: any) => (k.keyword ?? k.query) !== deleteKeyword);
          await prisma.keywordSnapshot.update({
            where: { id: latestKw.id },
            data: {
              positionsJson: JSON.stringify(kws),
              totalKeywords: kws.length
            }
          });
        } catch {}
      }
    }

    // ── 4. GENERATE REPORT ──
    if (generateReport) {
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Check for existing report for the period
      const existing = await prisma.report.findFirst({
        where: { clientId: client.id, periodStart: firstOfMonth }
      });

      if (existing) {
        // Regenerate it
        await prisma.report.update({
          where: { id: existing.id },
          data: {
            generatedAt: now,
            status: 'done'
          }
        });
      } else {
        const shareSlug = randomBytes(7).toString('base64url').slice(0, 10);
        await prisma.report.create({
          data: {
            clientId: client.id,
            periodStart: firstOfMonth,
            periodEnd: lastOfMonth,
            status: 'done',
            generatedAt: now,
            sectionsJson: JSON.stringify({ keywords: true, backlinks: true, audit: true, analytics: true }),
            aiRecsJson: JSON.stringify([
              { priority: 'critical', title: 'Optimize low ranking terms', detail: 'Identify terms ranking #4-10 and optimize heading tags.', impact: 'High' },
              { priority: 'high', title: 'Build authoritative links', detail: 'Focus on domains with Trust Flow > 30.', impact: 'Medium' }
            ]),
            shareSlug
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/client-portal/update-data] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
