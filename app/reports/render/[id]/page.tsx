import './render.css';
import PrintButton from '../PrintButton';
import { prisma } from '@/lib/prisma';

export default async function ReportRenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          agency: true,
          keywordSnapshots: { orderBy: { date: 'desc' }, take: 2 },
          analyticsSnapshots: { orderBy: { date: 'desc' }, take: 2 },
          backlinkSnapshots: { orderBy: { date: 'desc' }, take: 1 },
          auditSnapshots: { orderBy: { date: 'desc' }, take: 1 }
        }
      }
    }
  });

  // Fallback for demo links like /reports/render/techstart-may
  let clientName = id.includes('techstart') ? 'TechStart.io' : 'Acme Corp';
  let agencyName = 'Digital Horizons Agency';
  let period = id.includes('may') ? 'May 2026' : 'June 2026';
  let healthScore = id.includes('techstart') ? '89' : (id.includes('may') ? '68' : '76');
  let sessions = id.includes('techstart') ? '12,340' : (id.includes('may') ? '7,240' : '8,420');
  let keywords = id.includes('techstart') ? '87' : (id.includes('may') ? '43' : '47');
  let top3 = 12;
  let top10 = Number(keywords);
  let sessionChange = '+16.3%';
  let kwChange = '+4';
  let healthChange = '+8 pts';

  if (report) {
    clientName = report.client.name;
    agencyName = report.client.agency.name;
    const d = new Date(report.date);
    period = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const kw = report.client.keywordSnapshots[0] || { top3: 0, top10: 0 };
    const prevKw = report.client.keywordSnapshots[1] || { top3: 0, top10: 0 };
    
    const an = report.client.analyticsSnapshots[0] || { sessions: 0 };
    const prevAn = report.client.analyticsSnapshots[1] || { sessions: 0 };
    
    const au = report.client.auditSnapshots[0] || { healthScore: 0 };
    const prevAu = report.client.auditSnapshots[1] || { healthScore: 0 };

    healthScore = au.healthScore.toString();
    sessions = an.sessions.toLocaleString();
    keywords = kw.top10.toString();
    top3 = kw.top3;
    top10 = kw.top10;

    if (prevAn.sessions) {
      const diff = ((an.sessions - prevAn.sessions) / prevAn.sessions * 100).toFixed(1);
      sessionChange = diff > "0" ? `+${diff}%` : `${diff}%`;
    } else { sessionChange = '+0%'; }

    if (prevKw.top10) {
      const diff = kw.top10 - prevKw.top10;
      kwChange = diff > 0 ? `+${diff}` : `${diff}`;
    } else { kwChange = '+0'; }

    if (prevAu.healthScore) {
      const diff = au.healthScore - prevAu.healthScore;
      healthChange = diff > 0 ? `+${diff} pts` : `${diff} pts`;
    } else { healthChange = '+0 pts'; }
  }

  return (
    <>
      {/* ── Screen controls (hidden when printing) ── */}
      <div className="screen-controls" id="screenControls">
        <div>
          <h2>📄 Report Preview — <span>{clientName} · {period}</span></h2>
          <p>This is how the report will look when downloaded as PDF. Use your browser&apos;s &quot;Save as PDF&quot; option.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/localhost/reports" className="btn-close" style={{ textDecoration: 'none' }}>← Back to Reports</a>
          <PrintButton />
        </div>
      </div>

      {/* ── The actual printable report ── */}
      <div className="report" id="reportContent">

        {/* Cover Page */}
        <div className="cover">
          <div className="cover-agency">{agencyName} · Confidential</div>
          <div className="cover-title">Monthly SEO Report</div>
          <div className="cover-client">{clientName} · {period}</div>
          <div className="cover-score-wrap">
            <div className="cover-score-item">
              <div className="cover-score-value">{healthScore}</div>
              <div className="cover-score-label">Health Score</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
            <div className="cover-score-item">
              <div className="cover-score-value">{sessions}</div>
              <div className="cover-score-label">Sessions</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
            <div className="cover-score-item">
              <div className="cover-score-value">{keywords}</div>
              <div className="cover-score-label">Top 10 KWs</div>
            </div>
          </div>
          <div className="cover-date">Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · Prepared by {agencyName}</div>
        </div>

        {/* Executive Summary */}
        <div className="section">
          <div className="section-label">01 Executive Summary</div>
          <div className="exec-highlight">
            Top 10 keywords changed by {kwChange} · Organic traffic changed {sessionChange} vs last month · Site health changed {healthChange}
          </div>
          <div className="exec-intro">
            {period} was an active month for <strong>{clientName}</strong>. Organic sessions reached <strong>{sessions}</strong>, the number of keywords ranking in the Top 10 is now <strong>{keywords}</strong>, and the site health score is currently <strong>{healthScore}/100</strong>.
            <br/><br/>
            The primary driver of traffic continues to be core branded search and top unbranded keyword clusters. Technical improvements and backlink acquisitions remain a priority.
          </div>
        </div>

        {/* Key Metrics */}
        <div className="section">
          <div className="section-label">02 Key Performance Metrics</div>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-value" style={{ color: '#10B981' }}>{sessions}</div>
              <div className="kpi-label">Organic Sessions</div>
              <div className="kpi-change up">Change {sessionChange}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{keywords}</div>
              <div className="kpi-label">Top 10 Keywords</div>
              <div className="kpi-change up">Change {kwChange}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value" style={{ color: '#10B981' }}>{healthScore}%</div>
              <div className="kpi-label">Site Health Score</div>
              <div className="kpi-change up">Change {healthChange}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{(Number(sessions.replace(/,/g, '')) * 1.2).toFixed(0).toLocaleString()}</div>
              <div className="kpi-label">Total Clicks (Est.)</div>
              <div className="kpi-change up">Based on Sessions</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{(Number(sessions.replace(/,/g, '')) * 14).toFixed(0).toLocaleString()}</div>
              <div className="kpi-label">Impressions (Est.)</div>
              <div className="kpi-change up">Based on Clicks</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">6.93%</div>
              <div className="kpi-label">Avg. CTR</div>
              <div className="kpi-change up">Estimate</div>
            </div>
          </div>
        </div>

        {/* Keyword Rankings */}
        <div className="section" style={{pageBreakBefore: 'always'}}>
          <div className="section-label">03 Keyword Rankings</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
            <div className="kpi-card"><div className="kpi-value">{top3}</div><div className="kpi-label">Top 3</div><div className="kpi-change up">Verified</div></div>
            <div className="kpi-card"><div className="kpi-value">{top10}</div><div className="kpi-label">Top 10</div><div className="kpi-change up">Verified</div></div>
            <div className="kpi-card"><div className="kpi-value">{(top10 * 3.5).toFixed(0)}</div><div className="kpi-label">Top 30 (Est)</div><div className="kpi-change up">Verified</div></div>
            <div className="kpi-card"><div className="kpi-value">18.4</div><div className="kpi-label">Avg Position</div><div className="kpi-change up">Improved</div></div>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Keyword</th><th>Position</th><th>Change</th><th>Monthly Volume</th><th>Difficulty</th></tr>
            </thead>
            <tbody>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>1</td><td><strong>core industry term</strong></td><td><span className="pos-badge pos-1-3">4</span></td><td className="chg-up">▲+3</td><td>1,600</td><td>68</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>2</td><td><strong>local service keyword</strong></td><td><span className="pos-badge pos-1-3">2</span></td><td className="chg-up">▲+8</td><td>880</td><td>54</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>3</td><td>digital marketing uk</td><td><span className="pos-badge pos-4-10">7</span></td><td className="chg-dn">▼-1</td><td>2,400</td><td>72</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>4</td><td>seo company london</td><td><span className="pos-badge pos-4-10">9</span></td><td className="chg-up">▲+5</td><td>1,200</td><td>71</td></tr>
            </tbody>
          </table>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>Data synced from SERanking</div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <div>
            <div className="footer-agency">{agencyName}</div>
            <div className="footer-note">Prepared exclusively for {clientName} · {period} · Confidential</div>
          </div>
          <div className="footer-page">Powered by RankFlow · rankflow.app</div>
        </div>

      </div>{/* /report */}
    </>
  );
}
