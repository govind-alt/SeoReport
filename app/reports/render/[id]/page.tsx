import './render.css';
import PrintButton from '../PrintButton';

export default async function ReportRenderPage({ params }: { params: Promise<{ id: string }> }) {
  // In a real app, we'd fetch the report data using params.id
  const { id } = await params;
  
  // We'll mock the data based on the ID for the demo
  const clientName = id.includes('techstart') ? 'TechStart.io' : 'Acme Corp';
  const period = id.includes('may') ? 'May 2026' : 'June 2026';
  const healthScore = id.includes('techstart') ? '89' : (id.includes('may') ? '68' : '76');
  const sessions = id.includes('techstart') ? '12,340' : (id.includes('may') ? '7,240' : '8,420');
  const keywords = id.includes('techstart') ? '87' : (id.includes('may') ? '43' : '47');

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
          <div className="cover-agency">Digital Horizons Agency · Confidential</div>
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
          <div className="cover-date">Generated: June 23, 2026 · Prepared by Digital Horizons Agency</div>
        </div>

        {/* Executive Summary */}
        <div className="section">
          <div className="section-label">01 Executive Summary</div>
          <div className="exec-highlight">
            ↑ Strong month: Top 10 keywords grew by 4 · Organic traffic up +16.3% · Site health improved 8 points to {healthScore}%
          </div>
          <div className="exec-intro">
            {period} was a strong performance month for <strong>{clientName}</strong>. The site achieved significant gains across all key SEO metrics. Organic sessions reached <strong>{sessions}</strong> (+16.3% MoM), the number of keywords ranking in the Top 10 grew to <strong>{keywords}</strong> (+4 new entries), and the site health score improved by 8 points to reach <strong>{healthScore}/100</strong>. Three previously identified critical issues were resolved this month, contributing directly to the health score improvement.
            <br/><br/>
            The primary driver of traffic growth was the strong performance of the &quot;seo agency london&quot; and &quot;local seo london&quot; keyword clusters, which together account for an estimated 38% of total organic sessions. Backlink acquisition remained healthy with 80 new referring domains added.
          </div>
        </div>

        {/* Key Metrics */}
        <div className="section">
          <div className="section-label">02 Key Performance Metrics</div>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-value" style={{ color: '#10B981' }}>{sessions}</div>
              <div className="kpi-label">Organic Sessions</div>
              <div className="kpi-change up">↑ +16.3% vs previous</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{keywords}</div>
              <div className="kpi-label">Top 10 Keywords</div>
              <div className="kpi-change up">↑ +4 new entries</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value" style={{ color: '#10B981' }}>{healthScore}%</div>
              <div className="kpi-label">Site Health Score</div>
              <div className="kpi-change up">↑ +8 pts</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">9,840</div>
              <div className="kpi-label">Total Clicks (GSC)</div>
              <div className="kpi-change up">↑ +18.3% vs previous</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">142K</div>
              <div className="kpi-label">Impressions</div>
              <div className="kpi-change up">↑ +10.9% vs previous</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">6.93%</div>
              <div className="kpi-label">Avg. CTR</div>
              <div className="kpi-change up">↑ +0.43% vs previous</div>
            </div>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Traffic — 6 Month Trend</div>
          <div className="chart-placeholder">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', width: '100%', height: '100%' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div className="chart-bar" style={{ background: '#E2E8F0', height: '62%', width: '100%' }}></div></div>
                <div style={{ fontSize: '9px', color: '#94A3B8' }}>Jan<br/><strong style={{ color: '#1E293B' }}>5.8K</strong></div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div className="chart-bar" style={{ background: '#C7D2FE', height: '69%', width: '100%' }}></div></div>
                <div style={{ fontSize: '9px', color: '#94A3B8' }}>Feb<br/><strong style={{ color: '#1E293B' }}>6.4K</strong></div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div className="chart-bar" style={{ background: '#A5B4FC', height: '76%', width: '100%' }}></div></div>
                <div style={{ fontSize: '9px', color: '#94A3B8' }}>Mar<br/><strong style={{ color: '#1E293B' }}>7.1K</strong></div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div className="chart-bar" style={{ background: '#818CF8', height: '84%', width: '100%' }}></div></div>
                <div style={{ fontSize: '9px', color: '#94A3B8' }}>Apr<br/><strong style={{ color: '#1E293B' }}>7.8K</strong></div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div className="chart-bar" style={{ background: '#6366F1', height: '86%', width: '100%' }}></div></div>
                <div style={{ fontSize: '9px', color: '#94A3B8' }}>May<br/><strong style={{ color: '#1E293B' }}>7.8K</strong></div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}><div className="chart-bar" style={{ background: 'linear-gradient(180deg,#6366F1,#8B5CF6)', height: '100%', width: '100%', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }}></div></div>
                <div style={{ fontSize: '9px', color: '#4F46E5', fontWeight: 700 }}>Jun<br/><strong>8.4K</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Keyword Rankings */}
        <div className="section">
          <div className="section-label">03 Keyword Rankings</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
            <div className="kpi-card"><div className="kpi-value">12</div><div className="kpi-label">Top 3</div><div className="kpi-change up">↑+2</div></div>
            <div className="kpi-card"><div className="kpi-value">{keywords}</div><div className="kpi-label">Top 10</div><div className="kpi-change up">↑+4</div></div>
            <div className="kpi-card"><div className="kpi-value">89</div><div className="kpi-label">Top 30</div><div className="kpi-change up">↑+7</div></div>
            <div className="kpi-card"><div className="kpi-value">18.4</div><div className="kpi-label">Avg Position</div><div className="kpi-change up">↑ Improved</div></div>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Keyword</th><th>Position</th><th>Change</th><th>Monthly Volume</th><th>Difficulty</th><th>URL</th></tr>
            </thead>
            <tbody>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>1</td><td><strong>seo agency london</strong></td><td><span className="pos-badge pos-1-3">4</span></td><td className="chg-up">▲+3</td><td>1,600</td><td>68</td><td style={{ fontSize: '10px', color: '#94A3B8' }}>/seo-services</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>2</td><td><strong>local seo london</strong></td><td><span className="pos-badge pos-1-3">2</span></td><td className="chg-up">▲+8</td><td>880</td><td>54</td><td style={{ fontSize: '10px', color: '#94A3B8' }}>/local-seo</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>3</td><td>digital marketing uk</td><td><span className="pos-badge pos-4-10">7</span></td><td className="chg-dn">▼-1</td><td>2,400</td><td>72</td><td style={{ fontSize: '10px', color: '#94A3B8' }}>/digital-mktg</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>4</td><td>seo company london</td><td><span className="pos-badge pos-4-10">9</span></td><td className="chg-up">▲+5</td><td>1,200</td><td>71</td><td style={{ fontSize: '10px', color: '#94A3B8' }}>/seo-services</td></tr>
              <tr><td style={{ color: '#94A3B8', fontSize: '11px' }}>5</td><td>seo audit tool uk <em style={{ color: '#10B981', fontSize: '10px' }}>(NEW)</em></td><td><span className="pos-badge pos-11">28</span></td><td className="chg-up">NEW</td><td>390</td><td>58</td><td style={{ fontSize: '10px', color: '#94A3B8' }}>/audit</td></tr>
            </tbody>
          </table>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>Showing top 5 tracked keywords · Data from SERanking</div>
        </div>

        {/* Backlinks */}
        <div className="section">
          <div className="section-label">04 Backlink Profile</div>
          <div className="kpi-grid">
            <div className="kpi-card"><div className="kpi-value">42</div><div className="kpi-label">Domain Trust</div><div className="kpi-change up">↑+2 pts</div></div>
            <div className="kpi-card"><div className="kpi-value">1,847</div><div className="kpi-label">Total Backlinks</div><div className="kpi-change up">↑+47 new</div></div>
            <div className="kpi-card"><div className="kpi-value">312</div><div className="kpi-label">Referring Domains</div><div className="kpi-change up">↑+18 new</div></div>
          </div>
          <div style={{ marginTop: '4px' }}>
            <div className="metric-row"><div className="metric-label">Dofollow Links (67%)</div><div className="metric-bar"><div className="metric-fill" style={{ width: '67%' }}></div></div><div className="metric-val">1,243</div></div>
            <div className="metric-row"><div className="metric-label">Nofollow Links (33%)</div><div className="metric-bar"><div className="metric-fill" style={{ width: '33%', background: 'linear-gradient(90deg,#94A3B8,#CBD5E1)' }}></div></div><div className="metric-val">604</div></div>
            <div className="metric-row"><div className="metric-label">Trust Score 70+ domains</div><div className="metric-bar"><div className="metric-fill" style={{ width: '42%', background: 'linear-gradient(90deg,#10B981,#059669)' }}></div></div><div className="metric-val">47</div></div>
          </div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <div>
            <div className="footer-agency">Digital Horizons Agency</div>
            <div className="footer-note">Prepared exclusively for {clientName} · {period} · Confidential</div>
          </div>
          <div className="footer-page">Powered by RankFlow · rankflow.app</div>
        </div>

      </div>{/* /report */}
    </>
  );
}
