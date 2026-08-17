import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { SERankingClient } from '@/lib/seranking/client';

/**
 * Daily data sync cron job.
 * Loops through all agencies with API keys, then all their clients,
 * and creates fresh snapshot records for each.
 * 
 * Scheduled via vercel.json to run daily at 2am UTC.
 * Protected with CRON_SECRET header.
 */
export async function GET(request: Request) {
  // Security: verify the cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results: { agencyId: string; agencyName: string; clientsProcessed: number; errors: string[] }[] = [];

  try {
    console.log('[DAILY-SYNC] Starting daily data sync...');

    // Get all agencies that have a SERanking API key configured
    const agencies = await prisma.agency.findMany({
      where: { serankingApiKey: { not: null } },
      include: {
        clients: {
          where: { serankingProjectId: { not: null } }
        }
      }
    });

    console.log(`[DAILY-SYNC] Found ${agencies.length} agencies to sync.`);

    for (const agency of agencies) {
      const agencyResult = { agencyId: agency.id, agencyName: agency.name, clientsProcessed: 0, errors: [] as string[] };

      try {
        const apiKey = decrypt(agency.serankingApiKey!);
        const seClient = new SERankingClient(apiKey);
        const today = new Date();

        for (const client of agency.clients) {
          if (!client.serankingProjectId) continue;

          try {
            const projectId = client.serankingProjectId;

            // Fetch and store keyword rankings
            try {
              const rankings = await seClient.getRankings(projectId);
              let top3 = 0, top10 = 0, top100 = 0;
              rankings.positions.forEach((p: any) => {
                if (p.position > 0 && p.position <= 3) top3++;
                if (p.position > 0 && p.position <= 10) top10++;
                if (p.position > 0 && p.position <= 100) top100++;
              });
              const proj = await prisma.sERankingProject.findUnique({ where: { clientId: client.id } });
              if (proj) {
                await prisma.keywordSnapshot.create({
                  data: { serankingProjectId: proj.id, date: today, totalKeywords: rankings.positions.length, top3Count: top3, top10Count: top10, top100Count: top100 }
                });
              }
            } catch (e: any) {
              agencyResult.errors.push(`${client.name}: Rankings - ${e.message}`);
            }

            // Fetch and store site audit
            try {
              const audit = await seClient.getAudit(projectId);
              const proj = await prisma.sERankingProject.findUnique({ where: { clientId: client.id } });
              if (proj) {
                await prisma.auditSnapshot.create({
                  data: {
                    serankingProjectId: proj.id, date: today,
                    healthScore: audit.health_score || 0,
                    criticalIssues: audit.issues?.critical || 0,
                    warningIssues: audit.issues?.warnings || 0,
                    noticeIssues: audit.issues?.notices || 0,
                  }
                });
              }
            } catch (e: any) {
              agencyResult.errors.push(`${client.name}: Audit - ${e.message}`);
            }

            // Fetch and store backlink data
            try {
              const backlinksData: any = await seClient.getNewBacklinks(projectId.toString());
              const proj = await prisma.sERankingProject.findUnique({ where: { clientId: client.id } });
              if (proj) {
                await prisma.backlinkSnapshot.create({
                  data: {
                    serankingProjectId: proj.id, date: today,
                    totalBacklinks: backlinksData?.backlinks || backlinksData?.length || 0,
                    referringDomains: backlinksData?.referring_domains || 0,
                    newBacklinks: backlinksData?.new_backlinks_30d || 0,
                    lostBacklinks: backlinksData?.lost_backlinks_30d || 0,
                    domainTrust: backlinksData?.domain_trust || 0,
                  }
                });
              }
            } catch (e: any) {
              agencyResult.errors.push(`${client.name}: Backlinks - ${e.message}`);
            }

            agencyResult.clientsProcessed++;
          } catch (clientErr: any) {
            agencyResult.errors.push(`${client.name}: ${clientErr.message}`);
          }
        }
      } catch (agencyErr: any) {
        agencyResult.errors.push(`Agency-level error: ${agencyErr.message}`);
      }

      results.push(agencyResult);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[DAILY-SYNC] Complete. Processed ${agencies.length} agencies in ${elapsed}s.`);

    return NextResponse.json({
      success: true,
      elapsed: `${elapsed}s`,
      agenciesProcessed: agencies.length,
      results
    });

  } catch (error: any) {
    console.error('[DAILY-SYNC ERROR]', error);
    return NextResponse.json({ error: 'Daily sync failed', details: error.message }, { status: 500 });
  }
}
