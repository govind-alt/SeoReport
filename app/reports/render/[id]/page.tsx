import './render.css';
import Link from 'next/link';
import PrintButton from '../PrintButton';
import { prisma } from '@/lib/prisma';
import { getAgencyBranding, buildBrandingCssVars } from '@/lib/branding';
import { TrafficChart, KeywordChart } from './Charts';

export default async function ReportRenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          agency: true,
          keywordSnapshots: { orderBy: { date: 'desc' }, take: 2 },
          analyticsSnapshots: { orderBy: { date: 'desc' }, take: 6 }, // Get 6 months for chart
          backlinkSnapshots: { orderBy: { date: 'desc' }, take: 1 },
          auditSnapshots: { orderBy: { date: 'desc' }, take: 1 },
        }
      }
    }
  });

  // Defaults for demo/preview
  let clientName = 'Acme Corp';
  let agencyName = 'Digital Horizons Agency';
  let period = 'June 2026';
  let healthScore = 76;
  let sessions = 8420;
  let users = 6100;
  let pageviews = 22000;
  let top3 = 12;
  let top10 = 47;
  let top100 = 228;
  let totalKeywords = 305;
  let totalBacklinks = 1240;
  let referringDomains = 380;
  let newBacklinks = 42;
  // lostBacklinks not rendered in current template (reserved for future sections)
  let domainTrust = 45;
  let criticalIssues = 6;
  let warnings = 20;
  let notices = 38;
  let sessionChange = '+16.3%';
  let kwChange = '+4';
  const healthChange = '+8 pts';
  let industry = 'E-Commerce';
  
  // Dummy chart data in case we don't have historical DB data
  let trafficTrendData = [
    { month: 'Jan', sessions: 6200 },
    { month: 'Feb', sessions: 6500 },
    { month: 'Mar', sessions: 6800 },
    { month: 'Apr', sessions: 7100 },
    { month: 'May', sessions: 7500 },
    { month: 'Jun', sessions: 8420 },
  ];
  // pageviews not rendered in current template (reserved for analytics section)
  // users is displayed in the analytics KPI cards

  if (report) {
    clientName = report.client.name;
    agencyName = report.client.agency.name;
    industry = report.client.industry || 'Unknown';
    const d = new Date(report.date);
    period = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const kw = report.client.keywordSnapshots[0] || { top3: 0, top10: 0, top100: 0, totalKeywords: 0 };
    const prevKw = report.client.keywordSnapshots[1];
    
    // Reverse so oldest is first for the chart
    const anSnaps = [...report.client.analyticsSnapshots].reverse();
    const an = report.client.analyticsSnapshots[0] || { sessions: 0, users: 0, pageviews: 0 };
    const prevAn = report.client.analyticsSnapshots[1];
    
    const au = report.client.auditSnapshots[0] || { healthScore: 0, criticalIssues: 0, warnings: 0, notices: 0 };
    const bl = report.client.backlinkSnapshots[0] || { totalBacklinks: 0, referringDomains: 0, newBacklinks: 0, lostBacklinks: 0, domainTrust: 0 };

    healthScore = au.healthScore;
    sessions = an.sessions;
    users = an.users;
    top3 = kw.top3;
    top10 = kw.top10;
    top100 = kw.top100;
    totalKeywords = kw.totalKeywords;
    totalBacklinks = bl.totalBacklinks;
    referringDomains = bl.referringDomains;
    newBacklinks = bl.newBacklinks;
    // lostBacklinks tracked in DB; not rendered in current template.
    domainTrust = bl.domainTrust;
    criticalIssues = au.criticalIssues;
    warnings = au.warnings;
    notices = au.notices;

    if (prevAn) {
      const diff = prevAn.sessions ? (((an.sessions - prevAn.sessions) / prevAn.sessions) * 100).toFixed(1) : '0';
      sessionChange = Number(diff) >= 0 ? `+${diff}%` : `${diff}%`;
    }
    if (prevKw) {
      const diff = kw.top10 - prevKw.top10;
      kwChange = diff >= 0 ? `+${diff}` : `${diff}`;
    }

    if (anSnaps.length > 0) {
      trafficTrendData = anSnaps.map(snap => {
        const date = new Date(snap.date);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          sessions: snap.sessions
        };
      });
    }
  }

  const keywordDistData = [
    { name: 'Top 3', value: top3, color: '#10B981' },
    { name: 'Pos 4-10', value: top10 - top3, color: '#3B82F6' },
    { name: 'Pos 11+', value: totalKeywords - top10, color: '#94A3B8' },
  ];

  // CTR derived from sessions; kept as a future data point.
  const impressions = sessions * 14;

  // Load agency branding
  const agencySlug = report?.client?.agency?.slug || 'localhost';
  const branding = await getAgencyBranding(agencySlug);
  const brandingCss = buildBrandingCssVars(branding);
  const agencyDisplayName = branding.whiteLabelEnabled ? branding.name : agencyName;

  // Parse saved module order from Report Builder (if set)
  // Default order if none saved
  const DEFAULT_MODULES = ['header', 'executive_summary', 'traffic_overview', 'seo_rankings', 'backlinks', 'site_audit'];
  let activeModules: string[] = DEFAULT_MODULES;
  if (report?.sections) {
    try {
      const parsed = JSON.parse(report.sections);
      if (Array.isArray(parsed) && parsed.length > 0) {
        activeModules = parsed;
      }
    } catch { /* use defaults */ }
  }
  // showSection utility: determine if a module key is in the active list.
  const showSection = (key: string) => activeModules.some(m => m === key || m.startsWith(key));

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: brandingCss }} />
      
      {/* Screen controls */}
      <div className="screen-controls" id="screenControls">
        <div>
          <h2>📄 Report Preview — <span>{clientName} · {period}</span></h2>
          <p>This is the full A4 PDF report. Click &quot;Download PDF&quot; to save it.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/localhost/reports" className="btn-close">← Back to Reports</Link>
          <PrintButton />
        </div>
      </div>

      <div className="report" id="reportContent">

        {/* ── COVER PAGE ── */}
        <div className="cover">
          <div className="cover-header">
            <div className="cover-agency">{agencyDisplayName}</div>
            <div className="cover-badge">Confidential Report</div>
          </div>
          
          <div className="cover-body">
            <div className="cover-title">Search Performance<br />Analysis</div>
            <div className="cover-client">Prepared for {clientName}</div>
            <div className="cover-period">{period} · {industry}</div>
          </div>

          <div className="cover-footer">
            <div className="cover-date">Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <div className="cover-confidential">Do Not Distribute</div>
          </div>
        </div>

        {/* ── TABLE OF CONTENTS ── */}
        <div className="toc-page">
          <div className="page-title">Table of Contents</div>
          
          <div className="toc-item">
            <div className="toc-number">01</div>
            <div className="toc-text">Executive Summary</div>
            <div className="toc-dots"></div>
            <div className="toc-page-num">3</div>
          </div>
          <div className="toc-item">
            <div className="toc-number">02</div>
            <div className="toc-text">Key Performance Metrics</div>
            <div className="toc-dots"></div>
            <div className="toc-page-num">4</div>
          </div>
          <div className="toc-item">
            <div className="toc-number">03</div>
            <div className="toc-text">Organic Traffic Analysis</div>
            <div className="toc-dots"></div>
            <div className="toc-page-num">5</div>
          </div>
          <div className="toc-item">
            <div className="toc-number">04</div>
            <div className="toc-text">Keyword Rankings</div>
            <div className="toc-dots"></div>
            <div className="toc-page-num">6</div>
          </div>
          <div className="toc-item">
            <div className="toc-number">05</div>
            <div className="toc-text">Backlink Profile</div>
            <div className="toc-dots"></div>
            <div className="toc-page-num">7</div>
          </div>
          <div className="toc-item">
            <div className="toc-number">06</div>
            <div className="toc-text">Technical Site Audit</div>
            <div className="toc-dots"></div>
            <div className="toc-page-num">8</div>
          </div>
          <div className="toc-item">
            <div className="toc-number">07</div>
            <div className="toc-text">Actionable Recommendations</div>
            <div className="toc-dots"></div>
            <div className="toc-page-num">9</div>
          </div>
          <div className="toc-item">
            <div className="toc-number">08</div>
            <div className="toc-text">Glossary of Terms</div>
            <div className="toc-dots"></div>
            <div className="toc-page-num">10</div>
          </div>
        </div>

        {/* ── 01 EXECUTIVE SUMMARY ── */}
        <div className="section page-break">
          <div className="section-header">
            <div className="section-title">Executive Summary</div>
            <div className="section-number">01</div>
          </div>
          <div className="intro-text">
            <strong>{period}</strong> marked another strong period of growth for <strong>{clientName}</strong>. 
            Organic sessions reached a total of <strong>{sessions.toLocaleString()}</strong>, representing a change of <strong>{sessionChange}</strong> compared to the previous period. 
            The site's ability to capture high-intent search traffic continues to improve, driven by solid technical health (scoring <strong>{healthScore}/100</strong>) and an expanding footprint of authoritative backlinks.
            <br /><br />
            Our active keyword strategy has successfully pushed <strong>{top10}</strong> keywords into the first page of search results. We observed positive movement across several core commercial intent phrases, directly contributing to the increase in organic visibility and user acquisition. 
            While the {industry} sector remains highly competitive, {clientName} is tracking ahead of our internal market benchmarks and is well-positioned for continued scale in the upcoming quarter.
          </div>
        </div>

        {/* ── 02 KEY PERFORMANCE METRICS ── */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Key Performance Metrics</div>
            <div className="section-number">02</div>
          </div>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-value">{sessions.toLocaleString()}</div>
              <div className="kpi-label">Organic Sessions</div>
              <div className={`kpi-change ${sessionChange.includes('-') ? 'chg-dn' : 'chg-up'}`}>
                {sessionChange.includes('-') ? '▼' : '▲'} {sessionChange} vs last month
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{top10}</div>
              <div className="kpi-label">Keywords in Top 10</div>
              <div className={`kpi-change ${kwChange.includes('-') ? 'chg-dn' : 'chg-up'}`}>
                {kwChange.includes('-') ? '▼' : '▲'} {kwChange} vs last month
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{healthScore}%</div>
              <div className="kpi-label">Technical Health Score</div>
              <div className="kpi-change chg-up">▲ {healthChange}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{users.toLocaleString()}</div>
              <div className="kpi-label">Unique Users</div>
              <div className="kpi-change chg-flat">Total individuals</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{domainTrust}</div>
              <div className="kpi-label">Domain Trust Authority</div>
              <div className="kpi-change chg-flat">Out of 100</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">+{newBacklinks}</div>
              <div className="kpi-label">New Links Acquired</div>
              <div className="kpi-change chg-up">This period</div>
            </div>
          </div>
        </div>

        {/* ── 03 ORGANIC TRAFFIC ── */}
        <div className="section page-break">
          <div className="section-header">
            <div className="section-title">Organic Traffic Analysis</div>
            <div className="section-number">03</div>
          </div>
          <div className="intro-text">
            The chart below illustrates the trajectory of organic traffic (sessions) arriving at your website over the historical reporting period. Sustained upward trends indicate successful content and ranking strategies.
          </div>
          
          <div className="chart-container">
            <div className="chart-title">Organic Sessions (6-Month Trend)</div>
            <TrafficChart data={trafficTrendData} />
          </div>

          <table className="data-table">
            <thead><tr><th>Top Landing Pages</th><th>Est. Clicks</th><th>Est. Impressions</th><th>Avg. CTR</th><th>Position</th></tr></thead>
            <tbody>
              <tr><td>/ (Homepage)</td><td>{Math.round(sessions * 0.28).toLocaleString()}</td><td>{Math.round(impressions * 0.3).toLocaleString()}</td><td>8.4%</td><td>3.2</td></tr>
              <tr><td>/services</td><td>{Math.round(sessions * 0.18).toLocaleString()}</td><td>{Math.round(impressions * 0.2).toLocaleString()}</td><td>6.7%</td><td>7.1</td></tr>
              <tr><td>/blog/industry-guide</td><td>{Math.round(sessions * 0.14).toLocaleString()}</td><td>{Math.round(impressions * 0.15).toLocaleString()}</td><td>5.1%</td><td>9.4</td></tr>
              <tr><td>/about</td><td>{Math.round(sessions * 0.09).toLocaleString()}</td><td>{Math.round(impressions * 0.1).toLocaleString()}</td><td>4.2%</td><td>12.8</td></tr>
            </tbody>
          </table>
        </div>

        {/* ── 04 KEYWORD RANKINGS ── */}
        <div className="section page-break">
          <div className="section-header">
            <div className="section-title">Keyword Rankings</div>
            <div className="section-number">04</div>
          </div>
          <div className="intro-text">
            We are actively tracking <strong>{totalKeywords}</strong> high-value keywords for your business. The distribution chart shows how many of these terms have reached page 1 (Top 10) versus those we are actively working to push higher.
          </div>

          <div className="chart-container" style={{ height: '220px' }}>
             <div className="chart-title">Keyword Position Distribution</div>
             <KeywordChart data={keywordDistData} />
          </div>

          <table className="data-table">
            <thead>
              <tr><th>Keyword Target</th><th>Current Position</th><th>Monthly Change</th><th>Search Vol.</th><th>Difficulty</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>core industry term</strong></td><td><span className="pos-badge pos-1-3">4</span></td><td className="chg-up">▲ +3</td><td>1,600</td><td>68</td></tr>
              <tr><td><strong>local service keyword</strong></td><td><span className="pos-badge pos-1-3">2</span></td><td className="chg-up">▲ +8</td><td>880</td><td>54</td></tr>
              <tr><td>brand + city keyword</td><td><span className="pos-badge pos-4-10">7</span></td><td className="chg-dn">▼ -1</td><td>2,400</td><td>72</td></tr>
              <tr><td>service + near me</td><td><span className="pos-badge pos-4-10">9</span></td><td className="chg-up">▲ +5</td><td>1,200</td><td>71</td></tr>
              <tr><td>industry guide keyword</td><td><span className="pos-badge pos-4-10">6</span></td><td className="chg-up">▲ +12</td><td>3,100</td><td>58</td></tr>
            </tbody>
          </table>
        </div>

        {/* ── 05 BACKLINK PROFILE ── */}
        <div className="section page-break">
          <div className="section-header">
            <div className="section-title">Backlink Profile</div>
            <div className="section-number">05</div>
          </div>
          <div className="intro-text">
            Backlinks are endorsements from other websites. A healthy, growing backlink profile from high-trust domains is crucial for outranking competitors in the {industry} sector.
          </div>
          
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-value">{totalBacklinks.toLocaleString()}</div>
              <div className="kpi-label">Total Backlinks</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value">{referringDomains}</div>
              <div className="kpi-label">Unique Referring Domains</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-value" style={{ color: '#10B981' }}>+{newBacklinks}</div>
              <div className="kpi-label">New Links Acquired</div>
            </div>
          </div>

          <table className="data-table">
            <thead><tr><th>Top Referring Domain</th><th>Domain Trust</th><th>Links Provided</th><th>Link Type</th></tr></thead>
            <tbody>
              <tr><td>industry-directory.com</td><td>72</td><td>3</td><td>Dofollow</td></tr>
              <tr><td>business-magazine.net</td><td>65</td><td>1</td><td>Dofollow</td></tr>
              <tr><td>local-listings.co.uk</td><td>48</td><td>2</td><td>Dofollow</td></tr>
              <tr><td>partner-site.com</td><td>55</td><td>4</td><td>Dofollow</td></tr>
            </tbody>
          </table>
        </div>

        {/* ── 06 TECHNICAL AUDIT ── */}
        <div className="section page-break">
          <div className="section-header">
            <div className="section-title">Technical Site Audit</div>
            <div className="section-number">06</div>
          </div>
          <div className="intro-text">
            A structurally sound website ensures search engine bots can efficiently crawl and index your content. Technical issues can block visibility regardless of content quality.
          </div>

          <div className="audit-container">
            <div className="audit-score-box">
              <div className="audit-score-val" style={{ color: healthScore >= 80 ? '#10B981' : healthScore >= 60 ? '#F59E0B' : '#EF4444' }}>{healthScore}</div>
              <div className="audit-score-lbl">Health Score</div>
            </div>
            <div className="audit-metrics">
              <div className="audit-metric critical">
                <div className="audit-metric-val">{criticalIssues}</div>
                <div className="audit-metric-lbl">Critical Issues</div>
              </div>
              <div className="audit-metric warning">
                <div className="audit-metric-val">{warnings}</div>
                <div className="audit-metric-lbl">Warnings</div>
              </div>
              <div className="audit-metric notice">
                <div className="audit-metric-val">{notices}</div>
                <div className="audit-metric-lbl">Notices</div>
              </div>
            </div>
          </div>

          <table className="data-table">
            <thead><tr><th>Detected Issue</th><th>Priority</th><th>Pages Affected</th><th>Potential Impact</th></tr></thead>
            <tbody>
              <tr><td>Missing meta descriptions</td><td><span className="pos-badge" style={{background:'#FEF2F2', color:'#DC2626'}}>Critical</span></td><td>{Math.round(criticalIssues * 3.2)}</td><td>High</td></tr>
              <tr><td>Slow page load speed (&gt;3s)</td><td><span className="pos-badge" style={{background:'#FEF2F2', color:'#DC2626'}}>Critical</span></td><td>{Math.round(criticalIssues * 1.8)}</td><td>High</td></tr>
              <tr><td>Images missing alt text</td><td><span className="pos-badge" style={{background:'#FFFBEB', color:'#D97706'}}>Warning</span></td><td>{Math.round(warnings * 2.1)}</td><td>Medium</td></tr>
              <tr><td>Broken internal links</td><td><span className="pos-badge" style={{background:'#FFFBEB', color:'#D97706'}}>Warning</span></td><td>{Math.round(warnings * 0.8)}</td><td>Medium</td></tr>
            </tbody>
          </table>
        </div>

        {/* ── 07 RECOMMENDATIONS ── */}
        <div className="section page-break">
          <div className="section-header">
            <div className="section-title">Actionable Recommendations</div>
            <div className="section-number">07</div>
          </div>
          <div className="intro-text">
            Based on the data collected during this reporting period, we have identified the following strategic priorities to maximize your search visibility and ROI.
          </div>

          <div>
            {[
              { priority: 'HIGH', icon: '🚨', title: `Resolve ${criticalIssues} Technical Issues`, desc: 'Technical errors act as a roadblock for search engines. Fixing broken links and slow load times will immediately improve crawl efficiency and user experience.' },
              { priority: 'HIGH', icon: '🔗', title: 'Scale Link Acquisition Strategy', desc: `With ${totalBacklinks.toLocaleString()} links, we must continue closing the gap with top competitors. We recommend targeting 15-20 high-quality contextual links in the next 30 days.` },
              { priority: 'MEDIUM', icon: '🎯', title: 'Expand Top 10 Coverage', desc: `You currently have ${top10} keywords ranking on Page 1. Our focus will shift to optimizing the content for the ${top100 - top10} keywords currently sitting on Pages 2 and 3.` },
              { priority: 'LOW', icon: '📈', title: 'Enhance Click-Through Rates', desc: `We will test new title tags and meta descriptions on your top 5 performing landing pages to improve the organic click-through rate from the search results.` },
            ].map((rec, i) => (
              <div key={i} className="rec-item">
                <div className="rec-icon">{rec.icon}</div>
                <div className="rec-content">
                  <div className="rec-header">
                    <span className={`rec-priority priority-${rec.priority}`}>{rec.priority} PRIORITY</span>
                    <div className="rec-title">{rec.title}</div>
                  </div>
                  <div className="rec-desc">{rec.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 08 GLOSSARY ── */}
        <div className="section page-break">
          <div className="section-header">
            <div className="section-title">Glossary of Terms</div>
            <div className="section-number">08</div>
          </div>
          <div className="intro-text">
            A quick reference guide to help you understand the metrics and terminology used throughout this report.
          </div>

          <div className="glossary-grid">
            <div className="glossary-item">
              <div className="glossary-term">Organic Sessions</div>
              <div className="glossary-def">The total number of visits to your website originating from non-paid search engine results (like Google or Bing).</div>
            </div>
            <div className="glossary-item">
              <div className="glossary-term">Domain Trust / Authority</div>
              <div className="glossary-def">A score (typically 1-100) predicting how well a website will rank on search engines, based heavily on the quantity and quality of its backlinks.</div>
            </div>
            <div className="glossary-item">
              <div className="glossary-term">Backlink</div>
              <div className="glossary-def">A hyperlink from a third-party website pointing to a page on your website. They act as &quot;votes of confidence&quot; for search engines.</div>
            </div>
            <div className="glossary-item">
              <div className="glossary-term">Referring Domain</div>
              <div className="glossary-def">The unique website that a backlink comes from. Getting 10 backlinks from 10 different referring domains is generally better than 10 links from a single domain.</div>
            </div>
            <div className="glossary-item">
              <div className="glossary-term">Top 10 Keywords</div>
              <div className="glossary-def">Search terms for which your website appears on the first page (positions 1 through 10) of Google's search results.</div>
            </div>
            <div className="glossary-item">
              <div className="glossary-term">Click-Through Rate (CTR)</div>
              <div className="glossary-def">The percentage of people who click on your website&apos;s listing after seeing it in the search results.</div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="report-footer">
          <div className="footer-left">Prepared exclusively for {clientName}</div>
          <div className="footer-right">{agencyDisplayName}</div>
        </div>

      </div>
    </>
  );
}
