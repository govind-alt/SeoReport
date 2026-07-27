'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardMetrics } from '@/app/actions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function DashboardPage({ params }: { params: Promise<{ domain: string }> }) {
  const [selectedClient, setSelectedClient] = useState('All Clients');
  const [selectedPeriod, setSelectedPeriod] = useState('June 2026');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  const basePath = domain === 'localhost' ? '/localhost' : '';

  useEffect(() => {
    setLoading(true);
    let targetClientId = undefined;
    if (selectedClient !== 'All Clients' && metrics?.clients) {
      const client = metrics.clients.find((c: any) => c.name === selectedClient);
      if (client) targetClientId = client.id;
    }
    getDashboardMetrics(domain, targetClientId)
      .then(data => { setMetrics(data); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, selectedClient, selectedPeriod]);
  
  if (!metrics && loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading dashboard metrics...</div>
      </div>
    );
  }

  const currentData = metrics?.chartData || { traffic: [], keywords: [] };
  const healthColor = (h: number) => h >= 80 ? 'var(--success)' : h >= 60 ? '#F59E0B' : 'var(--danger)';
  const healthClass = (h: number) => h >= 80 ? 'success' : h >= 60 ? 'warning' : 'danger';
  const fmtNum = (n: number) => new Intl.NumberFormat('en-US').format(n);
  if (metrics?.activeClients === 0) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', paddingTop: '40px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), #6a7290)', color: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Welcome to RankFlow! 👋</div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>Let&apos;s get you set up so you can start generating automated SEO reports.</div>
          </div>
          <div style={{ fontSize: '48px' }}>🚀</div>
        </div>
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Setup Checklist <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>(0 of 3 complete)</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>1</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Configure Agency Branding</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Set your logo, brand colors, and custom email domains for white-labeling.</div>
              </div>
              <Link href={`${basePath}/settings?tab=branding`} className="btn btn-primary btn-sm">Configure</Link>
            </div>
            <div style={{ display: 'flex', gap: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gray-200)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>2</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Connect SERanking API</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Link your SERanking account to automate data imports.</div>
              </div>
              <Link href={`${basePath}/settings?tab=api-keys`} className="btn btn-secondary btn-sm">Connect API</Link>
            </div>
            <div style={{ display: 'flex', gap: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gray-200)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>3</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Add Your First Client</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Create a client profile and map their SERanking projects.</div>
              </div>
              <Link href={`${basePath}/clients/new`} className="btn btn-secondary btn-sm">Add Client</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
                      
  return (
    <>
      {/* Sync status bar */}
      <div className="sync-bar">
        <span>✅ Data sync complete · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-sm"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px' }}
            onClick={async () => {
              try {
                const r = await fetch('/api/webhooks/daily-sync', { method: 'POST' });
                const d = await r.json();
                alert(d.message || 'Sync triggered');
              } catch { alert('Sync failed'); }
            }}
          >🔄 Trigger Sync</button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="hero-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div className="hero-title">Welcome to RankFlow 👋</div>
            <div className="hero-sub">Your agency is managing {metrics?.activeClients || 0} clients across multiple SEO campaigns.</div>
            <div className="hero-stats">
              <div><div className="hero-stat-val">{metrics?.activeClients || 0}</div><div className="hero-stat-lbl">ACTIVE CLIENTS</div></div>
              <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)' }}></div>
              <div><div className="hero-stat-val">{metrics?.reportsSent || 0}</div><div className="hero-stat-lbl">REPORTS SENT</div></div>
              <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)' }}></div>
              <div><div className="hero-stat-val" style={{ color: '#A7F3D0' }}>{metrics?.avgHealthScore || 0}%</div><div className="hero-stat-lbl">AVG HEALTH SCORE</div></div>
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>SERanking API</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.25)' }}>
              <span style={{ width: '8px', height: '8px', background: '#34D399', borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 0 3px rgba(52,211,153,0.3)' }}></span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700 }}>{metrics?.creditsLeft || 0} credits left</div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>Active Connection</div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-actions">
          <Link href={`${basePath}/reports`} className="hero-btn hero-btn-solid">📄 Generate Report</Link>
          <button
            className="hero-btn hero-btn-white"
            onClick={async () => {
              const { toast } = await import('sonner');
              const t = toast.loading('Seeding demo test clients & SEO reports...');
              const { seedAgencyDemoData } = await import('@/app/actions');
              await seedAgencyDemoData(domain);
              toast.success('Seeded demo test data! Reloading dashboard...', { id: t });
              window.location.reload();
            }}
          >
            🌱 Seed Test Data
          </button>
          <Link href={`${basePath}/clients`} className="hero-btn hero-btn-white">👥 View All Clients</Link>
          <Link href={`${basePath}/settings`} className="hero-btn hero-btn-white">🔑 Manage API Keys</Link>
        </div>
      </div>

      {/* Date Range & Client Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            📅 Performance Period:
          </label>
          <select
            className="form-input"
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            style={{ width: 'auto', minWidth: '160px', fontWeight: 600, fontSize: '13px' }}
          >
            <option value="June 2026">June 2026 (Latest)</option>
            <option value="May 2026">May 2026</option>
            <option value="April 2026">April 2026</option>
            <option value="March 2026">March 2026</option>
            <option value="February 2026">February 2026</option>
            <option value="January 2026">January 2026</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            👥 Client Scope:
          </label>
          <select
            className="form-input"
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
            style={{ width: 'auto', minWidth: '180px', fontWeight: 600, fontSize: '13px' }}
          >
            <option value="All Clients">All Clients ({metrics?.activeClients || 0})</option>
            {metrics?.clients?.map((c: any) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '24px' }}>
        <div className="kpi-card success">
          <div className="kpi-icon" style={{ background: '#ECFDF5' }}>📈</div>
          <div className="kpi-label">Total Organic Sessions</div>
          <div className="kpi-value">{((metrics?.totalSessions || 0) / 1000).toFixed(1)}K</div>
          <div className="kpi-trend trend-up">↑ Current Month</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#EEF2FF' }}>🔑</div>
          <div className="kpi-label">Keywords in Top 10</div>
          <div className="kpi-value">{fmtNum(metrics?.totalKeywords || 0)}</div>
          <div className="kpi-trend trend-up">↑ Across all clients</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#F0FDF4' }}>🏥</div>
          <div className="kpi-label">Average Health Score</div>
          <div className="kpi-value">{metrics?.avgHealthScore || 0}%</div>
          <div className="kpi-trend trend-up">Across all clients</div>
        </div>
        <Link href={`${basePath}/audit-issues`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={`kpi-card ${(metrics?.criticalIssues || 0) > 0 ? 'warning' : ''}`} style={{ cursor: 'pointer' }}>
            <div className="kpi-icon" style={{ background: '#FFFBEB' }}>⚠️</div>
            <div className="kpi-label">Critical Issues</div>
            <div className="kpi-value" style={{ color: (metrics?.criticalIssues || 0) > 0 ? 'var(--warning)' : 'inherit' }}>
              {metrics?.criticalIssues || 0}
            </div>
            <div className="kpi-trend" style={{ color: (metrics?.criticalIssues || 0) > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
              {(metrics?.criticalIssues || 0) > 0 ? 'Need attention ➔' : 'All clear ✓'}
            </div>
          </div>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Agency Traffic Trend</div>
              <div className="chart-subtitle">Total organic sessions · 6 months</div>
            </div>
            <select 
              className="form-input" 
              style={{ width: '130px', fontSize: '11px', padding: '5px 8px', height: 'auto' }}
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option>All Clients</option>
              {metrics?.clients?.map((c: any) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ height: '200px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.traffic}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '12px' }} formatter={(v: any) => [fmtNum(v), 'Sessions']} />
                <Area type="monotone" dataKey="sessions" stroke="#6366F1" strokeWidth={2.5} fill="url(#trafficGrad)" dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Keyword Growth</div>
              <div className="chart-subtitle">Keywords in Top 10 · 6 months</div>
            </div>
          </div>
          <div style={{ height: '200px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.keywords}>
                <defs>
                  <linearGradient id="kwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '12px' }} formatter={(v: any) => [v, 'Top 10 KWs']} />
                <Area type="monotone" dataKey="keywords" stroke="#10B981" strokeWidth={2.5} fill="url(#kwGrad)" dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Client Health Leaderboard + Activity */}
      <div className="grid-2">
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">🏆 Client Health Leaderboard</div>
              <div className="card-subtitle">Ranked by latest site health score</div>
            </div>
            <Link href={`${basePath}/clients`} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>View All →</Link>
          </div>
          <div className="card-body" style={{ paddingTop: '6px', paddingBottom: '6px' }}>
            {(metrics?.clientsWithHealth || []).slice(0, 5).map((c: any, i: number) => (
              <Link href={`${basePath}/clients/${c.id}`} key={c.id} className="client-health-row" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ width: '22px', textAlign: 'center', fontSize: i < 3 ? '16px' : '11px', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </div>
                <div className="client-avatar-sm" style={{ background: c.color }}>{c.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  <div className="progress-bar" style={{ margin: '5px 0 0' }}>
                    <div className={`progress-fill ${healthClass(c.health || 0)}`} style={{ width: `${c.health || 0}%` }}></div>
                  </div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: healthColor(c.health || 0), flexShrink: 0 }}>
                  {c.health !== null ? `${c.health}%` : '--'}
                </div>
              </Link>
            ))}
            {(!metrics?.clientsWithHealth || metrics.clientsWithHealth.length === 0) && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No client data. Run the seed script first.
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">📋 Recent Activity</div>
              <div className="card-subtitle">Latest system and client events</div>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: '6px', paddingBottom: '6px' }}>
            {[
              { icon: '📄', bg: '#EEF2FF', text: 'Monthly SEO report generated', client: 'TechStart.io', time: '2h ago' },
              { icon: '🔄', bg: '#ECFDF5', text: 'Daily SERanking sync completed', client: 'All clients', time: '6h ago' },
              { icon: '⚠️', bg: '#FFFBEB', text: '3 new critical audit issues found', client: 'Acme Corp', time: '1d ago' },
              { icon: '🔗', bg: '#EFF6FF', text: '12 new backlinks discovered', client: 'BlueSky Marketing', time: '1d ago' },
              { icon: '✅', bg: '#ECFDF5', text: 'Report sent to client portal', client: 'GreenLeaf Organics', time: '2d ago' },
            ].map((item, i) => (
              <div key={i} className="activity-item">
                <div className="activity-icon" style={{ background: item.bg }}>{item.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.text}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.client}</div>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
