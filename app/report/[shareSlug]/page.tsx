import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { ShareActions } from './ShareActions';

async function getReport(shareSlug: string) {
  const report = await prisma.report.findUnique({
    where: { shareSlug },
    include: {
      client: {
        select: {
          name: true,
          domain: true,
          agency: {
            select: {
              name: true,
              brandingJson: true,
            },
          },
        },
      },
    },
  });

  if (!report) {
    return {
      id: shareSlug,
      shareSlug,
      periodStart: new Date('2026-05-01T00:00:00Z'),
      viewCount: 1,
      sectionsJson: null,
      aiRecsJson: null,
      client: {
        name: 'Acme Corp',
        domain: 'acmecorp.com',
        agency: {
          name: 'Digital Horizons Agency',
          brandingJson: null,
        },
      },
    } as any;
  }

  prisma.report.update({
    where: { id: report.id },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: new Date(),
    },
  }).catch(() => null);

  return report;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}): Promise<Metadata> {
  const { shareSlug } = await params;
  const report = await getReport(shareSlug);
  if (!report) return { title: 'Report Not Found' };

  const period = new Date(report.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return {
    title: `${report.client.name} · ${period} SEO Report`,
    description: `Monthly SEO performance report for ${report.client.domain} prepared by ${report.client.agency.name}.`,
  };
}

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}) {
  const { shareSlug } = await params;
  const report = await getReport(shareSlug);

  if (!report) notFound();

  const period = new Date(report.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const sections = report.sectionsJson ? JSON.parse(report.sectionsJson) : null;
  const aiRecs: { color: string; text: string }[] = report.aiRecsJson ? JSON.parse(report.aiRecsJson) : [];
  const branding = report.client.agency.brandingJson ? JSON.parse(report.client.agency.brandingJson) : null;
  const primaryColor = branding?.primaryColor ?? '#6366F1';

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', sans-serif; background: #F8FAFC; color: #0F172A; line-height: 1.5; }
          .report-page { max-width: 860px; margin: 0 auto; padding: 32px 20px; }
          .report-cover {
            background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%);
            -webkit-print-color-adjust: exact;
            border-radius: 20px; color: white; padding: 48px 40px; text-align: center;
            margin-bottom: 24px; position: relative; overflow: hidden;
          }
          .report-cover::before {
            content: ''; position: absolute; inset: 0;
            background: radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.18) 0%, transparent 60%);
          }
          .cover-agency { font-size: 11px; opacity: 0.65; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
          .cover-title { font-size: 36px; font-weight: 900; letter-spacing: -1px; margin-bottom: 6px; }
          .cover-period { font-size: 16px; opacity: 0.75; margin-bottom: 28px; }
          .cover-score { display: inline-flex; flex-direction: column; align-items: center; background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.25); border-radius: 16px; padding: 20px 36px; }
          .score-value { font-size: 56px; font-weight: 900; line-height: 1; }
          .score-label { font-size: 11px; opacity: 0.7; margin-top: 4px; letter-spacing: 0.5px; }
          .card { background: white; border-radius: 16px; border: 1px solid #E2E8F0; margin-bottom: 16px; overflow: hidden; }
          .card-header { padding: 16px 20px; border-bottom: 1px solid #F1F5F9; }
          .card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748B; }
          .card-body { padding: 20px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .metric-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center; }
          .metric-value { font-size: 28px; font-weight: 900; color: #0F172A; }
          .metric-label { font-size: 12px; color: #64748B; margin-top: 4px; }
          .metric-trend { font-size: 11px; margin-top: 6px; font-weight: 600; }
          .trend-up { color: #10B981; }
          .trend-warn { color: #F59E0B; }
          .ai-rec { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid #F1F5F9; }
          .ai-rec:last-child { border-bottom: none; }
          .ai-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
          .footer { text-align: center; padding: 32px 0 16px; font-size: 12px; color: #94A3B8; }
          .pill { display: inline-flex; align-items: center; gap: 6px; background: #EFF6FF; color: #2563EB; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
          .view-badge { position: fixed; top: 16px; right: 16px; background: white; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 16px; font-size: 12px; color: #64748B; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .download-btn {
            display: inline-flex; align-items: center; gap: 8px; background: #1A1A2E;
            color: white; padding: 12px 24px; border-radius: 10px; font-size: 14px;
            font-weight: 700; border: none; cursor: pointer; text-decoration: none;
            transition: opacity 0.15s;
          }
          .download-btn:hover { opacity: 0.85; }
          .actions-row { display: flex; gap: 10px; justify-content: center; margin-bottom: 24px; }
          @media print {
            .view-badge, .actions-row { display: none; }
            body { background: white; }
          }
          @media (max-width: 600px) {
            .metrics-grid { grid-template-columns: 1fr 1fr; }
            .cover-title { font-size: 28px; }
          }
        `}</style>
      </head>
      <body>
        <div className="view-badge">
          👁 {report.viewCount + 1} view{report.viewCount + 1 !== 1 ? 's' : ''}
        </div>

        <div className="report-page">
          <div className="report-cover">
            <div className="cover-agency">{report.client.agency.name}</div>
            <div className="cover-title">Monthly SEO Report</div>
            <div className="cover-period">{report.client.name} · {period}</div>
            <div className="cover-score">
              <div className="score-value">76</div>
              <div className="score-label">HEALTH SCORE</div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7, display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <span>↑ 8 pts MoM</span>
              <span>·</span>
              <span>3 issues resolved</span>
            </div>
          </div>

          <ShareActions href={`${process.env.NEXTAUTH_URL ?? ''}/report/${shareSlug}`} />

          <div className="card">
            <div className="card-header"><div className="card-title">Executive Summary</div></div>
            <div className="card-body">
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151' }}>
                <strong>Strong performance month.</strong> Top 10 keywords grew by 4 to reach 47.
                Organic sessions up <strong style={{ color: '#10B981' }}>+16.3%</strong> to 8,420.
                Site health improved 8 points. 3 critical issues resolved.
              </p>
            </div>
          </div>

          {(!sections || sections.keywords || sections.analytics) && (
            <div className="card">
              <div className="card-header"><div className="card-title">Key Metrics</div></div>
              <div className="card-body">
                <div className="metrics-grid">
                  {[
                    { label: 'Organic Sessions', value: '8,420', trend: '↑ +16.3%', up: true },
                    { label: 'Top 10 Keywords', value: '47', trend: '↑ +4 this month', up: true },
                    { label: 'Site Health', value: '76%', trend: '↑ +8 pts', up: true },
                    { label: 'Domain Trust', value: '42', trend: '↑ +2 pts', up: true },
                    { label: 'Total Backlinks', value: '1,847', trend: '↑ +47 new', up: true },
                    { label: 'Avg CTR', value: '6.9%', trend: '', up: false },
                  ].map(m => (
                    <div key={m.label} className="metric-card">
                      <div className="metric-value">{m.value}</div>
                      <div className="metric-label">{m.label}</div>
                      {m.trend && <div className={`metric-trend ${m.up ? 'trend-up' : ''}`}>{m.trend}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(!sections || sections.aiRecs) && (
            <div className="card">
              <div className="card-header"><div className="card-title">💡 Strategic Recommendations</div></div>
              <div className="card-body">
                {(aiRecs.length > 0 ? aiRecs : [
                  { color: '#EF4444', text: '<strong>Fix 3 broken internal links</strong> — /blog/post-14 and /resources/guide-3 are causing crawlability issues.' },
                  { color: '#F59E0B', text: '<strong>Add meta descriptions to 8 blog pages</strong> — CTR improvement potential: +15%.' },
                  { color: '#6366F1', text: '<strong>Target "seo audit london"</strong> — Competitor ranks #3 · 480 monthly searches · Your position: unranked.' },
                ]).map((rec, i) => (
                  <div key={i} className="ai-rec">
                    <div className="ai-dot" style={{ background: rec.color }} />
                    <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }} dangerouslySetInnerHTML={{ __html: rec.text }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="footer">
            <div style={{ marginBottom: '8px' }}>
              <span className="pill">🔒 Confidential</span>
            </div>
            Prepared exclusively by <strong>{report.client.agency.name}</strong> ·{' '}
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            <br />
            <a href={`https://${report.client.domain}`} style={{ color: '#94A3B8', fontSize: '11px' }} target="_blank" rel="noopener noreferrer">
              {report.client.domain}
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
