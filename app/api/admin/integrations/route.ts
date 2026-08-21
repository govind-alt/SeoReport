import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function ping(url: string, name: string): Promise<{ status: string; latency: number }> {
  const t = Date.now();
  try {
    const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
    const latency = Date.now() - t;
    return { status: r.ok || r.status < 500 ? 'Operational' : 'Degraded', latency };
  } catch {
    return { status: 'Unreachable', latency: Date.now() - t };
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Ping real endpoints in parallel
    const [seRanking, resend, stripe, db] = await Promise.all([
      ping('https://api4.seranking.com/', 'SE Ranking'),
      ping('https://api.resend.com/', 'Resend'),
      ping('https://api.stripe.com/', 'Stripe'),
      (async () => {
        const t = Date.now();
        try { await prisma.$queryRaw`SELECT 1`; return { status: 'Operational', latency: Date.now() - t }; }
        catch { return { status: 'Degraded', latency: Date.now() - t }; }
      })(),
    ]);

    const gateways = [
      { name: 'SE Ranking API Gateway', key: 'ser_live_****', limit: '1,000 req/min', ...seRanking, tested: 'Just now' },
      { name: 'Resend Email Gateway',   key: 're_****',       limit: '500 emails/day', ...resend,   tested: 'Just now' },
      { name: 'Stripe Billing',         key: 'sk_****',       limit: 'Live Webhooks', ...stripe,    tested: 'Just now' },
      { name: 'Supabase Database',      key: 'postgres://****', limit: 'Unlimited',   ...db,        tested: 'Live' },
    ];

    // Real activity events from DB
    const [recentAgencies, recentClients, recentReports] = await Promise.all([
      prisma.agency.findMany({ take: 4, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, createdAt: true } }),
      prisma.client.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { agency: { select: { name: true } } } }),
      prisma.report.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { client: { select: { name: true, agency: { select: { name: true } } } } } }),
    ]);

    const webhookLog: any[] = [];
    recentAgencies.forEach(a => webhookLog.push({
      id: `evt_agency_${a.id.substring(0, 8)}`, source: 'Platform Core', type: 'agency.created', status: 'Success', code: 200, time: new Date(a.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }));
    recentClients.forEach(c => webhookLog.push({
      id: `evt_client_${c.id.substring(0, 8)}`, source: 'Platform Core', type: 'client.onboarded', status: 'Success', code: 200, time: new Date(c.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }));
    recentReports.forEach(r => webhookLog.push({
      id: `evt_report_${r.id.substring(0, 8)}`, source: 'Report Engine', type: 'report.generated', status: 'Success', code: 200, time: new Date(r.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }));

    webhookLog.sort((a, b) => b.time.localeCompare(a.time));

    return NextResponse.json({ gateways, webhookLog: webhookLog.slice(0, 8) });
  } catch (error) {
    console.error('[ADMIN_INTEGRATIONS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
