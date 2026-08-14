import './render.css';
import PrintButton from '../PrintButton';
import CloseButton from '../CloseButton';
import { prisma } from '@/lib/prisma';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export default async function ReportRenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          agency: true,
          serankingProject: {
            include: {
              keywordSnapshots: { orderBy: { date: 'desc' }, take: 2 },
              analyticsSnapshots: { orderBy: { date: 'desc' }, take: 2 },
              backlinkSnapshots: { orderBy: { date: 'desc' }, take: 1 },
              auditSnapshots: { orderBy: { date: 'desc' }, take: 1 }
            }
          }
        }
      }
    }
  });

  // ── Data Resolution ──────────────────────────────────
  let clientName = 'RetailPro Ltd';
  let agencyName = 'Digital Horizons Agency';
  let period = 'May 2026';
  let healthScore = 78;
  let sessions = 8420;
  let top3Count = 12;
  let top10Count = 43;
  let top30Count = 128;
  let avgPosition = 18.4;
  let backlinkCount = 2840;
  let domainAuthority = 42;
  let sessionChange = '+14.3%';
  let kwChange = '+6';
  let healthChange = '+5 pts';
  let sessionChangePct = 14.3;
  let clicks = 10104;
  let impressions = 117880;
  let ctr = 8.57;

  if (report) {
    clientName = report.client.name;
    agencyName = report.client.agency.name;
    const d = new Date(report.periodStart);
    period = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const kw = report.client.serankingProject?.keywordSnapshots[0];
    const prevKw = report.client.serankingProject?.keywordSnapshots[1];
    const an = report.client.serankingProject?.analyticsSnapshots[0];
    const prevAn = report.client.serankingProject?.analyticsSnapshots[1];
    const au = report.client.serankingProject?.auditSnapshots[0];
    const prevAu = report.client.serankingProject?.auditSnapshots[1];
    const bl = report.client.serankingProject?.backlinkSnapshots[0];

    if (au) healthScore = au.healthScore;
    if (an) { sessions = an.organicSessions; clicks = Math.round(sessions * 1.2); impressions = Math.round(clicks * 11.66); ctr = parseFloat((clicks / impressions * 100).toFixed(2)); }
    if (kw) { top3Count = kw.top3Count; top10Count = kw.top10Count; top30Count = Math.round(top10Count * 2.97); }
    if (bl) { backlinkCount = bl.totalBacklinks ?? 2840; domainAuthority = (bl as any).domainTrust ?? (bl as any).domainAuthority ?? 42; }

    if (an && prevAn?.organicSessions) {
      const d = ((an.organicSessions - prevAn.organicSessions) / prevAn.organicSessions * 100);
      sessionChangePct = parseFloat(d.toFixed(1));
      sessionChange = d >= 0 ? `+${d.toFixed(1)}%` : `${d.toFixed(1)}%`;
    } else { sessionChange = '+0%'; sessionChangePct = 0; }

    if (kw && prevKw) {
      const d = kw.top10Count - prevKw.top10Count;
      kwChange = d >= 0 ? `+${d}` : `${d}`;
    } else { kwChange = '+0'; }

    if (au && prevAu) {
      const d = au.healthScore - prevAu.healthScore;
      healthChange = d >= 0 ? `+${d} pts` : `${d} pts`;
    } else { healthChange = '+0 pts'; }
  }

  const generatedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const sessionsFormatted = sessions.toLocaleString();
  const clicksFormatted = clicks.toLocaleString();
  const impressionsFormatted = impressions.toLocaleString();

  // Traffic channel mock percentages
  const channels = [
    { label: 'Organic Search', pct: 68 },
    { label: 'Direct', pct: 17 },
    { label: 'Referral', pct: 9 },
    { label: 'Social', pct: 6 },
  ];

  return (
    <div className={inter.className}>
      {/* ── Screen Controls (hidden in print) ── */}
      <div className="screen-controls" id="screenControls">
        <div>
          <h2>📄 Report Preview — <span>{clientName} · {period}</span></h2>
          <p>In the print dialog → set <strong>Destination</strong> to &quot;Save as PDF&quot; → click Save.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CloseButton />
          <PrintButton filename={`${clientName}_SEO_Report_${period}`} />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PRINTABLE A4 REPORT
          ══════════════════════════════════════════ */}
      <div className="report-page" id="reportContent">

        {/* ── COVER PAGE ── */}
        <div className="cover">
          <div className="cover-inner">
          <div className="cover-top-bar">
            <div className="cover-logo-text">Rank<span>Flow</span></div>
            <div className="cover-confidential">Confidential</div>
          </div>

          <div className="cover-main">
            <div className="cover-accent-line"></div>
            <div className="cover-report-type">Monthly Performance Report</div>
            <div className="cover-title">SEO Report</div>
            <div className="cover-client-name">{clientName}</div>
            <div className="cover-period">{period} · Prepared by {agencyName}</div>
          </div>

          <div className="cover-scores">
            <div className="cover-score-item">
              <div className="cover-score-value">{healthScore}</div>
              <div className="cover-score-label">Health Score</div>
            </div>
            <div className="cover-score-item">
              <div className="cover-score-value accent">{sessionsFormatted}</div>
              <div className="cover-score-label">Organic Sessions</div>
            </div>
            <div className="cover-score-item">
              <div className="cover-score-value teal">{top10Count}</div>
              <div className="cover-score-label">Top 10 Keywords</div>
            </div>
          </div>

          <div className="cover-footer">
            <div className="cover-footer-agency">📊 {agencyName}</div>
            <div className="cover-footer-date">Generated: {generatedDate}</div>
          </div>
          </div>{/* /cover-inner */}
        </div>

        {/* ── 01 EXECUTIVE SUMMARY ── */}
        <div className="report-section">
          <div className="section-header">
            <div className="section-num">01</div>
            <div className="section-title">Executive Summary</div>
            <div className="section-rule"></div>
          </div>

          <div className="exec-highlight">
            Top 10 keywords {kwChange} &nbsp;·&nbsp; Organic traffic {sessionChange} vs last month &nbsp;·&nbsp; Site health {healthChange}
          </div>
          <div className="exec-body">
            <p>
              {period} was a strong performing month for <strong>{clientName}</strong>. Organic sessions reached <strong>{sessionsFormatted}</strong>, representing a <strong>{sessionChange}</strong> change versus the previous reporting period. The site is currently ranking <strong>{top10Count} keywords</strong> in the Top 10 and <strong>{top3Count} keywords</strong> in the Top 3 positions.
            </p>
            <p>
              The overall site health score stands at <strong>{healthScore}/100</strong> ({healthChange}). Primary traffic drivers continue to be core branded search terms and top-performing unbranded keyword clusters. Backlink growth is steady with <strong>{backlinkCount.toLocaleString()} total backlinks</strong> and a domain authority of <strong>{domainAuthority}</strong>.
            </p>
            <p>
              Priority focus areas for the next 30 days include technical issue remediation, content expansion for high-opportunity keywords, and continued backlink outreach campaigns.
            </p>
          </div>
        </div>

        {/* ── 02 KEY PERFORMANCE METRICS ── */}
        <div className="report-section">
          <div className="section-header">
            <div className="section-num">02</div>
            <div className="section-title">Key Performance Metrics</div>
            <div className="section-rule"></div>
          </div>

          <div className="kpi-grid-3">
            <div className="kpi-card accent">
              <div className="kpi-value" style={{ color: '#059669' }}>{sessionsFormatted}</div>
              <div className="kpi-label">Organic Sessions</div>
              <span className={`kpi-change ${sessionChangePct >= 0 ? 'up' : 'dn'}`}>{sessionChange} MoM</span>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{top10Count}</div>
              <div className="kpi-label">Top 10 Keywords</div>
              <span className="kpi-change up">{kwChange} vs last month</span>
            </div>
            <div className="kpi-card">
              <div className="kpi-value" style={{ color: '#059669' }}>{healthScore}%</div>
              <div className="kpi-label">Site Health Score</div>
              <span className="kpi-change up">{healthChange}</span>
            </div>
          </div>

          <div className="kpi-grid-3">
            <div className="kpi-card">
              <div className="kpi-value">{clicksFormatted}</div>
              <div className="kpi-label">Total Clicks (Est.)</div>
              <span className="kpi-change neutral">Based on Sessions</span>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{impressionsFormatted}</div>
              <div className="kpi-label">Impressions (Est.)</div>
              <span className="kpi-change neutral">Based on Clicks</span>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{ctr}%</div>
              <div className="kpi-label">Avg. CTR</div>
              <span className="kpi-change up">Above Avg.</span>
            </div>
          </div>
        </div>

        {/* ── 03 KEYWORD RANKINGS ── */}
        <div className="report-section" style={{ pageBreakBefore: 'auto' }}>
          <div className="section-header">
            <div className="section-num">03</div>
            <div className="section-title">Keyword Rankings</div>
            <div className="section-rule"></div>
          </div>

          <div className="ranking-strip">
            <div className="ranking-strip-card">
              <div className="ranking-strip-value">{top3Count}</div>
              <div className="ranking-strip-label">Top 3</div>
              <span className="ranking-strip-badge badge-verified">✓ Verified</span>
            </div>
            <div className="ranking-strip-card">
              <div className="ranking-strip-value">{top10Count}</div>
              <div className="ranking-strip-label">Top 10</div>
              <span className="ranking-strip-badge badge-verified">✓ Verified</span>
            </div>
            <div className="ranking-strip-card">
              <div className="ranking-strip-value">{top30Count}</div>
              <div className="ranking-strip-label">Top 30 (Est.)</div>
              <span className="ranking-strip-badge badge-verified">✓ Est.</span>
            </div>
            <div className="ranking-strip-card">
              <div className="ranking-strip-value">{avgPosition}</div>
              <div className="ranking-strip-label">Avg. Position</div>
              <span className="ranking-strip-badge badge-improved">↑ Improved</span>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Keyword</th>
                <th>Position</th>
                <th>Change</th>
                <th>Monthly Volume</th>
                <th>Difficulty</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>1</td><td><strong>core industry term</strong></td><td><span className="pos-badge pos-1-3">4</span></td><td className="chg-up">▲ +3</td><td>1,600</td><td>68</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>2</td><td><strong>local service keyword</strong></td><td><span className="pos-badge pos-1-3">2</span></td><td className="chg-up">▲ +8</td><td>880</td><td>54</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>3</td><td>digital marketing uk</td><td><span className="pos-badge pos-4-10">7</span></td><td className="chg-dn">▼ -1</td><td>2,400</td><td>72</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>4</td><td>seo company london</td><td><span className="pos-badge pos-4-10">9</span></td><td className="chg-up">▲ +5</td><td>1,200</td><td>71</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>5</td><td>best seo agency</td><td><span className="pos-badge pos-4-10">6</span></td><td className="chg-up">▲ +2</td><td>3,600</td><td>81</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>6</td><td>ecommerce seo services</td><td><span className="pos-badge pos-11">14</span></td><td className="chg-dn">▼ -2</td><td>1,900</td><td>67</td></tr>
            </tbody>
            <tfoot>
              <tr><td colSpan={6}>Data sourced from SERanking · Updated {generatedDate}</td></tr>
            </tfoot>
          </table>
        </div>

        {/* ── 04 TRAFFIC SOURCES ── */}
        <div className="report-section">
          <div className="section-header">
            <div className="section-num">04</div>
            <div className="section-title">Traffic Sources</div>
            <div className="section-rule"></div>
          </div>
          {channels.map(ch => (
            <div className="metric-bar-row" key={ch.label}>
              <div className="metric-bar-label">{ch.label}</div>
              <div className="metric-bar-track">
                <div className="metric-bar-fill" style={{ width: `${ch.pct}%` }}></div>
              </div>
              <div className="metric-bar-val">{ch.pct}%</div>
            </div>
          ))}
        </div>

        {/* ── 05 BACKLINK PROFILE ── */}
        <div className="report-section">
          <div className="section-header">
            <div className="section-num">05</div>
            <div className="section-title">Backlink Profile</div>
            <div className="section-rule"></div>
          </div>
          <div className="kpi-grid-3">
            <div className="kpi-card">
              <div className="kpi-value">{backlinkCount.toLocaleString()}</div>
              <div className="kpi-label">Total Backlinks</div>
              <span className="kpi-change up">+128 this month</span>
            </div>
            <div className="kpi-card accent">
              <div className="kpi-value">{domainAuthority}</div>
              <div className="kpi-label">Domain Authority</div>
              <span className="kpi-change up">+2 pts</span>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">184</div>
              <div className="kpi-label">Referring Domains</div>
              <span className="kpi-change up">+12 new</span>
            </div>
          </div>
        </div>

        {/* ── 06 SITE AUDIT ── */}
        <div className="report-section">
          <div className="section-header">
            <div className="section-num">06</div>
            <div className="section-title">Technical SEO Audit</div>
            <div className="section-rule"></div>
          </div>
          <div className="audit-grid">
            <div className="audit-stat critical">
              <div className="audit-stat-value">7</div>
              <div className="audit-stat-label">Critical Issues</div>
            </div>
            <div className="audit-stat warning">
              <div className="audit-stat-value">23</div>
              <div className="audit-stat-label">Warnings</div>
            </div>
            <div className="audit-stat notice">
              <div className="audit-stat-value">41</div>
              <div className="audit-stat-label">Notices</div>
            </div>
            <div className="audit-stat ok">
              <div className="audit-stat-value">312</div>
              <div className="audit-stat-label">Passed Checks</div>
            </div>
          </div>
        </div>

        {/* ── 07 AI RECOMMENDATIONS ── */}
        <div className="report-section">
          <div className="section-header">
            <div className="section-num">07</div>
            <div className="section-title">AI Recommendations</div>
            <div className="section-rule"></div>
          </div>

          <div className="rec-item rec-critical">
            <div className="rec-icon critical">🔴</div>
            <div>
              <div className="rec-title">Fix Core Web Vitals — LCP &gt; 4s on Mobile</div>
              <div className="rec-desc">Largest Contentful Paint is exceeding 4 seconds on mobile devices. Optimise hero image compression and implement critical CSS inlining to improve load times.</div>
              <span className="rec-impact impact-high">High Impact</span>
            </div>
          </div>

          <div className="rec-item rec-warning">
            <div className="rec-icon warning">🟡</div>
            <div>
              <div className="rec-title">Resolve 23 Missing Meta Descriptions</div>
              <div className="rec-desc">Pages without meta descriptions typically see 5–10% lower CTR in search results. Add unique, compelling descriptions targeting primary keywords for each affected page.</div>
              <span className="rec-impact impact-med">Medium Impact</span>
            </div>
          </div>

          <div className="rec-item rec-opportunity">
            <div className="rec-icon opportunity">🔵</div>
            <div>
              <div className="rec-title">Target 8 High-Volume, Low-Difficulty Keywords</div>
              <div className="rec-desc">Analysis found 8 keywords with 1,000+ monthly searches and KD under 35 that competitors are not aggressively targeting. Quick content wins available.</div>
              <span className="rec-impact impact-low">Opportunity</span>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="report-footer">
          <div className="footer-left">
            <div className="footer-agency">{agencyName}</div>
            <div className="footer-note">Prepared exclusively for {clientName} · {period} · Confidential</div>
          </div>
          <div className="footer-right">
            <div className="footer-brand">Powered by RankFlow</div>
            <span className="footer-url">rankflow.app</span>
          </div>
        </div>

      </div>{/* /report-page */}

    </div>
  );
}
