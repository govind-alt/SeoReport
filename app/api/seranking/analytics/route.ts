import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** GET /api/seranking/analytics?clientId=xxx
 *  Returns current + prev month analytics snapshots and 6-month history
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
  }

  try {
    // Get the client's analytics snapshots
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        analyticsSnapshots: {
          orderBy: { date: 'desc' },
          take: 7, // current + prev + history
        },
      },
    });

    if (!client || client.analyticsSnapshots.length === 0) {
      return NextResponse.json({ current: null, prev: null, history: [] });
    }

    const snapshots = client.analyticsSnapshots;
    const current   = snapshots[0];
    const prev      = snapshots[1] ?? null;

    // Build history for chart (oldest first)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const history = [...snapshots].reverse().map(s => ({
      month: months[new Date(s.date).getMonth()],
      sessions: s.organicSessions,
      clicks: s.clicks,
      impressions: s.impressions,
    }));

    return NextResponse.json({
      current: {
        organicSessions: current.organicSessions,
        clicks:          current.clicks,
        impressions:     current.impressions,
        ctr:             current.ctr,
        avgPosition:     current.avgPosition,
        topQueries:      current.topQueriesJson ? JSON.parse(current.topQueriesJson) : [],
        topPages:        current.topPagesJson   ? JSON.parse(current.topPagesJson)   : [],
      },
      prev: prev ? {
        organicSessions: prev.organicSessions,
        clicks:          prev.clicks,
        impressions:     prev.impressions,
      } : null,
      history,
    });
  } catch (err) {
    console.error('[ANALYTICS_GET]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
