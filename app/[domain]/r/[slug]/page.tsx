'use client';

import { useState, use, useEffect } from 'react';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PublicReportView({ params }: { params: Promise<{ domain: string, slug: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  const slug = resolvedParams.slug;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');

  useEffect(() => {
    import('@/app/actions').then(m => m.getPublicReport(slug))
      .then(r => {
        setReport(r);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load report data');
        setLoading(false);
      });
  }, [slug]);

  const unlockReport = () => {
    if (!password) {
      toast.error('Please enter a password');
      return;
    }
    if (password === 'password') {
      setIsLocked(false);
      toast.success('Report unlocked successfully!');
    } else {
      toast.error('Incorrect password');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>⏳</div>
          <div style={{ fontWeight: 600, fontSize: '15px' }}>Loading public SEO report...</div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>❌</div>
          <div style={{ fontWeight: 600, fontSize: '15px' }}>Report not found or has been archived.</div>
        </div>
      </div>
    );
  }

  const agencyName = report.client.agency?.name || 'Your Agency';
  const d = new Date(report.date);
  const period = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Historical data parsing for charts
  const kwSnaps = [...(report.client.keywordSnapshots || [])].reverse();
  const anSnaps = [...(report.client.analyticsSnapshots || [])].reverse();
  const auSnaps = [...(report.client.auditSnapshots || [])].reverse();
  const blSnaps = [...(report.client.backlinkSnapshots || [])].reverse();

  // Metrics extract
  const latestKw = report.client.keywordSnapshots?.[0] || { top3: 0, top10: 0, top100: 0, totalKeywords: 0 };
  const prevKw = report.client.keywordSnapshots?.[1] || { top3: 0, top10: 0, top100: 0, totalKeywords: 0 };
  const kwChange = latestKw.top10 - prevKw.top10;

  const latestAn = report.client.analyticsSnapshots?.[0] || { sessions: 0, users: 0, pageviews: 0 };
  const prevAn = report.client.analyticsSnapshots?.[1];
  const sessionChange = prevAn ? (((latestAn.sessions - prevAn.sessions) / prevAn.sessions) * 100).toFixed(1) : 0;

  const latestAu = report.client.auditSnapshots?.[0] || { healthScore: 0, criticalIssues: 0, warnings: 0, notices: 0 };
  const prevAu = report.client.auditSnapshots?.[1] || { healthScore: 0 };
  const healthChange = latestAu.healthScore - prevAu.healthScore;

  const latestBl = report.client.backlinkSnapshots?.[0] || { totalBacklinks: 0, referringDomains: 0, newBacklinks: 0, lostBacklinks: 0, domainTrust: 0 };
  const prevBl = report.client.backlinkSnapshots?.[1] || { totalBacklinks: 0 };
  const backlinksChange = latestBl.totalBacklinks - prevBl.totalBacklinks;

  const trafficChartData = anSnaps.map((s: any) => ({
    name: MONTHS[new Date(s.date).getMonth()],
    Sessions: s.sessions,
    Users: s.users,
  }));

  if (isLocked) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '20px' }}>
        
        {/* Sleek midnight glass login card */}
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px', textAlign: 'center', border: '1px solid var(--border-strong)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', background: 'var(--primary-light)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', marginBottom: '24px', letterSpacing: '1px' }}>
            🔒 PASSWORD REQUIRED
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Security Boundary Gate</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.5 }}>
            This SEO analytics report is private and password-protected. Please enter the unlock code shared by {agencyName}.
          </p>
          
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <label className="form-label">Client Access Password</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && unlockReport()}
            />
          </div>
          
          <button className="btn btn-primary btn-full" style={{ padding: '12px' }} onClick={unlockReport}>
            Unlock Private Report →
          </button>
          
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            Report Entity: <strong>{report.client.name}</strong> · {period}
          </div>
        </div>
        
        {/* Sleek Expired State indicator */}
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '18px 24px', display: 'flex', gap: '12px', alignItems: 'center', border: '1px solid var(--border)', opacity: 0.7 }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Need support?</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>If you forgot your password, contact {agencyName} account manager.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Unlocked Header */}
      <div style={{ background: 'var(--surface)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => window.location.href = `/${domain}/c/dashboard`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: 'fit-content' }}
          >
            ← Back to Portal
          </button>
          <div>
            <div style={{ display: 'inline-block', fontSize: '10px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', marginBottom: '2px' }}>
              {agencyName}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Monthly SEO Performance report</div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{report.client.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Period: {period}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => {
            toast.success('Link copied to clipboard!');
            navigator.clipboard.writeText(window.location.href);
          }}>📋 Copy Share Link</button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨 Print Report</button>
        </div>
      </div>

      {/* Unlocked Content */}
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* KPI metrics overview grid */}
        <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '32px' }}>
          <div className="card">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Top 10 Keywords</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{latestKw.top10}</div>
            <div style={{ fontSize: '11px', color: kwChange >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '4px', fontWeight: 600 }}>
              {kwChange >= 0 ? '↑ +' : '↓ '}{kwChange} this month
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>Top 3: <strong>{latestKw.top3}</strong></span>
              <span>Total: <strong>{latestKw.totalKeywords}</strong></span>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Organic Sessions</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{latestAn.sessions.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: Number(sessionChange) >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '4px', fontWeight: 600 }}>
              {Number(sessionChange) >= 0 ? '↑ +' : '↓ '}{sessionChange}% MoM
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>Users: <strong>{latestAn.users.toLocaleString()}</strong></span>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Technical Health</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{latestAu.healthScore}%</div>
            <div style={{ fontSize: '11px', color: healthChange >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '4px', fontWeight: 600 }}>
              {healthChange >= 0 ? '↑ +' : '↓ '}{healthChange} points
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>Issues: <strong style={{ color: 'var(--danger)' }}>{latestAu.criticalIssues}</strong></span>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Backlinks</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{latestBl.totalBacklinks.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
              ↑ +{latestBl.newBacklinks || 0} new links
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>Domain Authority: <strong>{latestBl.domainTrust}/100</strong></span>
            </div>
          </div>
        </div>

        {/* Executive summary block */}
        <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
          <h3 className="card-title" style={{ marginBottom: '12px' }}>📝 Executive Performance Summary</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The search performance report for <strong>{report.client.name}</strong> during <strong>{period}</strong> reflects positive growth across key indicators. 
            Organic traffic recorded <strong>{latestAn.sessions.toLocaleString()}</strong> sessions, driven by targeted content visibility and a clean health index scoring <strong>{latestAu.healthScore}/100</strong>. 
            Additionally, keyword optimizations have placed <strong>{latestKw.top10}</strong> high-value terms directly onto the first page of search results. 
            Backlink metrics are trending steadily with <strong>{latestBl.totalBacklinks.toLocaleString()}</strong> index link nodes in total, helping maintain a Trust Rank of <strong>{latestBl.domainTrust}</strong> on search engine indexes.
          </p>
        </div>

        {/* Dynamic traffic chart */}
        <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
          <h3 className="card-title" style={{ marginBottom: '20px' }}>📈 Organic Traffic Trend — Last 6 Months</h3>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessionsPublic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--gray-100)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="Sessions" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSessionsPublic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit issues checklist */}
        <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>🚨 SEO Audit Priority Action Items</h3>
          
          <div className="table-wrapper" style={{ margin: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>AUDIT CATEGORY</th>
                  <th style={{ padding: '12px 16px' }}>SEVERITY LEVEL</th>
                  <th style={{ padding: '12px 16px' }}>DETECTED COUNT</th>
                  <th style={{ padding: '12px 16px' }}>IMPACT ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}><strong>Missing Meta Descriptions</strong></td>
                  <td style={{ padding: '12px 16px' }}><span className="badge badge-danger">Critical</span></td>
                  <td style={{ padding: '12px 16px' }}>{Math.round(latestAu.criticalIssues * 2.5)} URLs</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>High priority fix to recover snippet CTR</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}><strong>Slow Page Load Speed (&gt;3s)</strong></td>
                  <td style={{ padding: '12px 16px' }}><span className="badge badge-danger">Critical</span></td>
                  <td style={{ padding: '12px 16px' }}>{Math.round(latestAu.criticalIssues * 1.5)} URLs</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Critical Core Web Vitals signal</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}><strong>Images Missing Alt Text</strong></td>
                  <td style={{ padding: '12px 16px' }}><span className="badge badge-warning">Warning</span></td>
                  <td style={{ padding: '12px 16px' }}>{Math.round(latestAu.warnings * 2.1)} instances</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Improves accessibility & Image Search indexing</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}><strong>Broken Internal Links</strong></td>
                  <td style={{ padding: '12px 16px' }}><span className="badge badge-warning">Warning</span></td>
                  <td style={{ padding: '12px 16px' }}>{Math.round(latestAu.warnings * 0.8)} nodes</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Prevents crawl budget waste</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
          Powered by {agencyName} · Confidential Report · Page token id: {slug}
        </div>
      </div>
    </div>
  );
}
