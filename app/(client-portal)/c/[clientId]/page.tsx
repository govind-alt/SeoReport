'use client';

import { use, useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { getClientDetails } from '@/app/actions';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={circumference} strokeDashoffset={progress} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
    </svg>
  );
}

// Build mini trend from snapshots
function buildTrend(snapshots: any[], key: string) {
  return snapshots.slice(-6).map((s: any, i: number) => ({
    name: `W${i + 1}`,
    value: s[key] || 0
  }));
}

export default function ClientPortalPage({ params }: { params: Promise<{ clientId: string }> }) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.clientId;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    getClientDetails(clientId).then(data => {
      setClient(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [clientId]);

  const downloadPdf = async (reportId: string) => {
    setDownloadingId(reportId);
    const toastId = toast.loading('Generating PDF report…');
    try {
      const res = await fetch(`/api/reports/generate?id=${reportId}`);
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SEO-Report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', { id: toastId });
    } catch {
      toast.error('Failed to generate PDF.', { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080C18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Toaster position="top-right" />
        <div style={{ width: 48, height: 48, border: '3px solid rgba(99,102,241,0.3)', borderTop: '3px solid #6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif', fontSize: '14px' }}>Loading your dashboard…</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ minHeight: '100vh', background: '#080C18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Toaster position="top-right" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ color: 'white', fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: '22px' }}>Portal not found</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px', fontSize: '14px' }}>This link is invalid or your portal hasn&apos;t been set up yet.</p>
        </div>
      </div>
    );
  }

  const latestAudit = client.snapshots.audit;
  const latestAnalytics = client.snapshots.analytics?.[0];
  const latestKeywords = client.snapshots.keywords?.[0];
  const latestBacklinks = client.snapshots.backlinks;
  const reports = client.snapshots.reports || [];
  const keywordHistory = buildTrend(client.snapshots.keywords || [], 'top10');

  const kpis = [
    {
      label: 'Organic Sessions',
      value: latestAnalytics?.sessions?.toLocaleString() || '—',
      sub: `${latestAnalytics?.users?.toLocaleString() || '—'} users`,
      trend: '+12.4%',
      positive: true,
      icon: '🌐',
      color: '#6366F1',
      bg: 'rgba(99,102,241,0.12)'
    },
    {
      label: 'Keywords in Top 10',
      value: latestKeywords?.top10 || '—',
      sub: `${latestKeywords?.top3 || 0} in top 3`,
      trend: '+8 this month',
      positive: true,
      icon: '🔑',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.12)'
    },
    {
      label: 'Site Health Score',
      value: null,
      healthScore: latestAudit?.healthScore,
      sub: latestAudit?.criticalIssues > 0 ? `${latestAudit.criticalIssues} issues to fix` : 'No critical issues',
      trend: latestAudit?.criticalIssues > 0 ? null : 'Clean bill of health',
      positive: !(latestAudit?.criticalIssues > 0),
      icon: '❤️',
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)'
    },
    {
      label: 'Total Backlinks',
      value: latestBacklinks?.totalBacklinks?.toLocaleString() || '—',
      sub: `${latestBacklinks?.referringDomains || '—'} referring domains`,
      trend: `+${latestBacklinks?.newBacklinks || 0} new`,
      positive: true,
      icon: '🔗',
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.12)'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'reports', label: 'My Reports', icon: '📄', badge: reports.length || null },
    { id: 'keywords', label: 'Keywords', icon: '🔑' },
    { id: 'support', label: 'Support', icon: '💬' }
  ];

  // CSS-in-JS styles
  const styles = {
    page: { minHeight: '100vh', background: '#080C18', color: 'white', fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' } as React.CSSProperties,
    header: {
      background: 'rgba(8,12,24,0.8)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '64px', position: 'sticky' as const, top: 0, zIndex: 100
    },
    surface: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', backdropFilter: 'blur(8px)'
    } as React.CSSProperties
  };

  return (
    <div style={styles.page}>
      <Toaster position="top-right" richColors />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        .cp-tab-btn { background: none; border: none; cursor: pointer; padding: 20px 4px; font-family: inherit; font-size: 14px; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        .cp-tab-btn:hover { color: white !important; }
        .kpi-card { transition: transform 0.2s, box-shadow 0.2s; }
        .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .report-row:hover { background: rgba(255,255,255,0.05) !important; }
        .download-btn { transition: all 0.2s; }
        .download-btn:hover { transform: scale(1.04); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease-out; }
      `}</style>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366F1, #3B82F6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>RF</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px' }}>SEO Client Portal</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{client.domain}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
            {(client.name || 'C').substring(0, 2).toUpperCase()}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            <strong style={{ color: 'white' }}>{client.name}</strong>
          </div>
          <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* TAB NAV */}
      <div style={{ background: 'rgba(8,12,24,0.6)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', display: 'flex', gap: '32px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className="cp-tab-btn"
            onClick={() => setActiveTab(tab.id)}
            style={{
              borderBottom: activeTab === tab.id ? '2px solid #6366F1' : '2px solid transparent',
              color: activeTab === tab.id ? '#6366F1' : 'rgba(255,255,255,0.45)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              position: 'relative'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge && (
              <span style={{ background: '#6366F1', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px' }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
                Welcome back, {client.name.split(' ')[0]} 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>
                Here&apos;s your SEO performance summary for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
              </p>
            </div>

            {/* KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {kpis.map((kpi, i) => (
                <div key={i} className="kpi-card" style={{ ...styles.surface, padding: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `radial-gradient(circle, ${kpi.color} 0%, transparent 70%)`, opacity: 0.15, transform: 'translate(20px,-20px)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ width: 40, height: 40, background: kpi.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{kpi.icon}</div>
                    <div style={{ fontSize: '11px', color: kpi.positive ? '#10B981' : '#EF4444', fontWeight: 700, background: kpi.positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: '20px' }}>
                      {kpi.positive ? '▲' : '▼'} {kpi.trend}
                    </div>
                  </div>
                  {kpi.healthScore !== undefined ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                      <div style={{ position: 'relative' }}>
                        <ScoreRing score={kpi.healthScore} size={64} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800 }}>{kpi.healthScore}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 800 }}>{kpi.healthScore}/100</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{kpi.sub}</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '4px' }}>{kpi.value}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{kpi.sub}</div>
                    </>
                  )}
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: '8px' }}>{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* KEYWORD TREND CHART */}
            {keywordHistory.length > 0 && (
              <div style={{ ...styles.surface, padding: '28px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Keyword Ranking Trend</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '4px' }}>Top 10 keywords over time</p>
                  </div>
                </div>
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={keywordHistory} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                      <defs>
                        <linearGradient id="kwGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1A1D2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
                      <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2.5} fill="url(#kwGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* LATEST REPORT PREVIEW */}
            {reports.length > 0 && (
              <div style={{ ...styles.surface, padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Latest Report</h3>
                  <button onClick={() => setActiveTab('reports')} style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    View all {reports.length} reports →
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(99,102,241,0.08)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📄</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{reports[0].title}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }} suppressHydrationWarning>
                        {new Date(reports[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => window.open(`/reports/render/${reports[0].id}`, '_blank')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                      👁 Preview
                    </button>
                    <button className="download-btn" onClick={() => downloadPdf(reports[0].id)} disabled={downloadingId === reports[0].id} style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                      {downloadingId === reports[0].id ? '⏳ Generating…' : '⬇ Download PDF'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>Your Monthly Reports</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px', fontSize: '14px' }}>Download or preview your monthly SEO performance reports.</p>
            </div>

            {reports.length === 0 ? (
              <div style={{ ...styles.surface, padding: '80px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No reports yet</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Your agency will generate your first report soon. Check back here!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reports.map((r: any, i: number) => (
                  <div key={r.id} className="report-row" style={{ ...styles.surface, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: 44, height: 44, background: i === 0 ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📄</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{r.title}</div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }} suppressHydrationWarning>
                            {new Date(r.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>READY</span>
                          {i === 0 && <span style={{ background: 'rgba(99,102,241,0.2)', color: '#6366F1', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>LATEST</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => window.open(`/reports/render/${r.id}`, '_blank')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                        👁 Preview
                      </button>
                      <button className="download-btn" onClick={() => downloadPdf(r.id)} disabled={downloadingId === r.id} style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, minWidth: '140px', textAlign: 'center' }}>
                        {downloadingId === r.id ? '⏳ Generating…' : '⬇ Download PDF'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KEYWORDS TAB */}
        {activeTab === 'keywords' && (
          <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>Keyword Performance</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px', fontSize: '14px' }}>Your keyword position summary from the latest data sync.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
              {[
                { label: 'Keywords in Top 3', value: latestKeywords?.top3 || 0, color: '#10B981', icon: '🥇' },
                { label: 'Keywords in Top 10', value: latestKeywords?.top10 || 0, color: '#6366F1', icon: '📈' },
                { label: 'Keywords in Top 100', value: latestKeywords?.top100 || 0, color: '#F59E0B', icon: '📊' }
              ].map((item, i) => (
                <div key={i} style={{ ...styles.surface, padding: '28px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontSize: '40px', fontWeight: 900, color: item.color, letterSpacing: '-2px' }}>{item.value}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '8px', fontWeight: 500 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...styles.surface, padding: '28px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Ranking Trend (Last 6 Months)</h3>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={keywordHistory} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                    <defs>
                      <linearGradient id="kwGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1A1D2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px' }} />
                    <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fill="url(#kwGrad2)" dot={false} name="Top 10 Keywords" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* SUPPORT TAB */}
        {activeTab === 'support' && (
          <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>Help & Support</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px', fontSize: '14px' }}>Have a question about your report or SEO performance? Message your agency.</p>
            </div>
            <div style={{ ...styles.surface, padding: '32px', maxWidth: '640px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '24px' }}>Send a message to your agency</h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</label>
                <input placeholder="e.g. Question about my keyword rankings" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 14px', color: 'white', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</label>
                <textarea rows={5} placeholder="Describe your question or concern in detail..." style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 14px', color: 'white', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
              </div>
              <button onClick={() => toast.success('Message sent! Your agency will respond shortly.')} style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Send Message →
              </button>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 32px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '40px' }}>
        Reports prepared exclusively for {client.name} · Powered by <strong style={{ color: 'rgba(255,255,255,0.4)' }}>RankFlow</strong>
      </div>
    </div>
  );
}
