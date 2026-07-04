'use client';


import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trafficData = [
  { name: 'Jan', sessions: 65000 },
  { name: 'Feb', sessions: 68000 },
  { name: 'Mar', sessions: 72000 },
  { name: 'Apr', sessions: 71000 },
  { name: 'May', sessions: 76000 },
  { name: 'Jun', sessions: 84200 },
];

const keywordData = [
  { name: 'Jan', keywords: 450 },
  { name: 'Feb', keywords: 480 },
  { name: 'Mar', keywords: 510 },
  { name: 'Apr', keywords: 550 },
  { name: 'May', keywords: 589 },
  { name: 'Jun', keywords: 623 },
];

export default function DashboardPage() {
  return (
    <>
      {/* Sync status bar */}
      <div className="sync-bar">
        <span>✅ Data sync complete · Jun 23, 2026 at 02:14 AM · All 24 clients updated</span>
        <div style={{display: 'flex', gap: '8px'}}>
          <span style={{fontSize: '11px', color: '#065F46'}}>Next sync: Jun 24 at 02:00 AM</span>
          <button className="btn btn-sm" style={{background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px'}} onClick={() => alert('Manual sync queued...')}>🔄 Force Sync</button>
        </div>
      </div>

      {/* GSC setup banner (shown when not connected) */}
      <div className="gsc-setup-banner" id="gscSetupBanner">
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <span style={{fontSize: '24px'}}>⚠️</span>
          <div>
            <div style={{fontSize: '13px', fontWeight: '700', color: '#92400E'}}>Connect Google Search Console to unlock Analytics data</div>
            <div style={{fontSize: '12px', color: '#B45309', marginTop: '2px'}}>Traffic, clicks, CTR and impressions are unavailable until GSC is connected.</div>
          </div>
        </div>
        <div style={{display: 'flex', gap: '8px', flexShrink: '0'}}>
          <button className="btn btn-warning btn-sm" style={{background: '#F59E0B', color: 'white', border: 'none'}} onClick={() => window.location.href='/settings'}>🔑 Connect Now →</button>
          <button className="btn btn-ghost btn-sm" onClick={(e) => (e.currentTarget.closest('.gsc-setup-banner') as HTMLElement).style.display='none'}>Dismiss</button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="hero-banner">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap'}}>
          <div>
            <div className="hero-title">Good morning, John 👋</div>
            <div className="hero-sub">Digital Horizons Agency · June 2026 — Your agency is performing exceptionally well.</div>
            <div className="hero-stats">
              <div><div className="hero-stat-val">24</div><div className="hero-stat-lbl">ACTIVE CLIENTS</div></div>
              <div style={{width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)'}}></div>
              <div><div className="hero-stat-val">38</div><div className="hero-stat-lbl">REPORTS SENT</div></div>
              <div style={{width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)'}}></div>
              <div><div className="hero-stat-val" style={{color: '#A7F3D0'}}>↑ 89%</div><div className="hero-stat-lbl">AVG HEALTH SCORE</div></div>
            </div>
          </div>
          <div style={{flexShrink: '0'}}>
            <div style={{fontSize: '11px', opacity: '0.7', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px'}}>SERanking API</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.25)'}}>
              <span style={{width: '8px', height: '8px', background: '#34D399', borderRadius: '50%', flexShrink: '0', boxShadow: '0 0 0 3px rgba(52,211,153,0.3)'}}></span>
              <div>
                <div style={{fontSize: '12px', fontWeight: '700'}}>8,400 credits left</div>
                <div style={{fontSize: '10px', opacity: '0.7'}}>⚠ Key expires in 14 days</div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-actions">
          <button className="hero-btn hero-btn-solid" onClick={() => alert('Generate Report modal')}>📄 Generate Report</button>
          <button className="hero-btn hero-btn-white" onClick={() => window.location.href='/clients'}>👥 View All Clients</button>
          <button className="hero-btn hero-btn-white" onClick={() => window.location.href='/settings'}>🔑 Manage API Keys</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid kpi-grid-4" style={{marginBottom: '24px'}}>
        <div className="kpi-card success">
          <div className="kpi-icon">📊</div>
          <div className="kpi-label">Total Organic Sessions</div>
          <div className="kpi-value">84.2K</div>
          <div className="kpi-trend trend-up">↑ +14.3% vs May</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">🔑</div>
          <div className="kpi-label">Keywords in Top 10</div>
          <div className="kpi-value">623</div>
          <div className="kpi-trend trend-up">↑ +34 this month</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">🔗</div>
          <div className="kpi-label">New Backlinks</div>
          <div className="kpi-value">1,284</div>
          <div className="kpi-trend trend-up">↑ +182 acquired</div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-label">Critical Issues</div>
          <div className="kpi-value" style={{color: 'var(--warning)'}}>18</div>
          <div className="kpi-trend" style={{color: 'var(--warning)'}}>Across 7 clients</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{marginBottom: '24px'}}>
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Agency Traffic Trend</div>
              <div className="chart-subtitle">Total organic sessions across all clients · 6 months</div>
            </div>
            <select className="form-input" style={{width: '110px', fontSize: '11px', padding: '5px 8px', height: 'auto'}}>
              <option>All Clients</option>
              <option>Acme Corp</option>
              <option>TechStart.io</option>
            </select>
          </div>
          <div style={{height: '200px', marginTop: '16px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#2563EB" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{display: 'flex', gap: '16px', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)'}}>
            <div><span style={{color: 'var(--text-primary)', fontWeight: '700'}}>+14.3%</span> avg MoM growth</div>
            <div><span style={{color: 'var(--success)', fontWeight: '700'}}>84.2K</span> sessions Jun 2026</div>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Keyword Growth</div>
              <div className="chart-subtitle">Top 10 keywords across all clients · 6 months</div>
            </div>
          </div>
          <div style={{height: '200px', marginTop: '16px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={keywordData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                <Tooltip />
                <Line type="monotone" dataKey="keywords" stroke="#059669" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{display: 'flex', gap: '16px', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)'}}>
            <div><span style={{color: 'var(--text-primary)', fontWeight: '700'}}>+34</span> new top-10 kws this month</div>
            <div><span style={{color: 'var(--success)', fontWeight: '700'}}>623</span> total top-10 rankings</div>
          </div>
        </div>
      </div>
    </>
  );
}
