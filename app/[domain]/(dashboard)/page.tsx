'use client';

import { useState, use, useEffect } from 'react';
import { getDashboardMetrics } from '@/app/actions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage({ params }: { params: Promise<{ domain: string }> }) {
  const [selectedClient, setSelectedClient] = useState('All Clients');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';

  useEffect(() => {
    setLoading(true);
    let targetClientId = undefined;
    if (selectedClient !== 'All Clients' && metrics?.clients) {
      const client = metrics.clients.find((c: any) => c.name === selectedClient);
      if (client) targetClientId = client.id;
    }
    
    getDashboardMetrics(domain, targetClientId)
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, selectedClient]);
  
  if (!metrics && loading) {
    return <div style={{padding: '40px', color: 'var(--text-muted)'}}>Loading dashboard metrics...</div>;
  }

  const currentData = metrics?.chartData || { traffic: [], keywords: [] };
                      
  return (
    <>
      {/* Sync status bar */}
      <div className="sync-bar">
        <span>✅ Data sync complete · {new Date().toLocaleDateString()}</span>
        <div style={{display: 'flex', gap: '8px'}}>
          <button className="btn btn-sm" style={{background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px'}} onClick={() => window.location.href= domain === 'localhost' ? `/localhost/clients` : `/clients`}>🔄 Manage Sync</button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="hero-banner">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap'}}>
          <div>
            <div className="hero-title">Welcome to RankFlow 👋</div>
            <div className="hero-sub">Your agency is performing exceptionally well this month.</div>
            <div className="hero-stats">
              <div><div className="hero-stat-val">{metrics?.activeClients || 0}</div><div className="hero-stat-lbl">ACTIVE CLIENTS</div></div>
              <div style={{width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)'}}></div>
              <div><div className="hero-stat-val">{metrics?.reportsSent || 0}</div><div className="hero-stat-lbl">REPORTS SENT</div></div>
              <div style={{width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)'}}></div>
              <div><div className="hero-stat-val" style={{color: '#A7F3D0'}}>{metrics?.avgHealthScore || 0}%</div><div className="hero-stat-lbl">AVG HEALTH SCORE</div></div>
            </div>
          </div>
          <div style={{flexShrink: '0'}}>
            <div style={{fontSize: '11px', opacity: '0.7', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px'}}>SERanking API</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.25)'}}>
              <span style={{width: '8px', height: '8px', background: '#34D399', borderRadius: '50%', flexShrink: '0', boxShadow: '0 0 0 3px rgba(52,211,153,0.3)'}}></span>
              <div>
                <div style={{fontSize: '12px', fontWeight: '700'}}>{metrics?.creditsLeft || 0} credits left</div>
                <div style={{fontSize: '10px', opacity: '0.7'}}>Active Connection</div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-actions">
          <button className="hero-btn hero-btn-solid" onClick={() => window.location.href= domain === 'localhost' ? `/localhost/reports` : `/reports`}>📄 Generate Report</button>
          <button className="hero-btn hero-btn-white" onClick={() => window.location.href= domain === 'localhost' ? `/localhost/clients` : `/clients`}>👥 View All Clients</button>
          <button className="hero-btn hero-btn-white" onClick={() => window.location.href= domain === 'localhost' ? `/localhost/settings` : `/settings`}>🔑 Manage API Keys</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid kpi-grid-4" style={{marginBottom: '24px'}}>
        <div className="kpi-card success" onClick={() => window.location.href = domain === 'localhost' ? `/localhost/clients` : `/clients`} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon">📈</div>
          <div className="kpi-label">Total Organic Sessions</div>
          <div className="kpi-value">{(metrics?.totalSessions / 1000).toFixed(1)}K</div>
          <div className="kpi-trend trend-up">Current Month</div>
        </div>
        <div className="kpi-card" onClick={() => window.location.href = domain === 'localhost' ? `/localhost/clients` : `/clients`} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon">🔑</div>
          <div className="kpi-label">Keywords in Top 10</div>
          <div className="kpi-value">{metrics?.totalKeywords || 0}</div>
          <div className="kpi-trend trend-up">Current Month</div>
        </div>
        <div className="kpi-card" onClick={() => window.location.href = domain === 'localhost' ? `/localhost/clients` : `/clients`} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon">🔗</div>
          <div className="kpi-label">Average Health Score</div>
          <div className="kpi-value">{metrics?.avgHealthScore || 0}%</div>
          <div className="kpi-trend trend-up">Across all clients</div>
        </div>
        <div className={`kpi-card ${metrics?.criticalIssues > 0 ? 'warning' : ''}`} onClick={() => window.location.href = domain === 'localhost' ? `/localhost/clients` : `/clients`} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-label">Critical Issues</div>
          <div className="kpi-value" style={{color: metrics?.criticalIssues > 0 ? 'var(--warning)' : 'inherit'}}>{metrics?.criticalIssues || 0}</div>
          <div className="kpi-trend" style={{color: metrics?.criticalIssues > 0 ? 'var(--warning)' : 'inherit'}}>Need attention</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{marginBottom: '24px'}}>
        <div className="chart-card" onClick={() => window.location.href = domain === 'localhost' ? `/localhost/clients` : `/clients`} style={{ cursor: 'pointer' }}>
          <div className="chart-header">
            <div>
              <div className="chart-title">Agency Traffic Trend</div>
              <div className="chart-subtitle">Total organic sessions across all clients · 6 months</div>
            </div>
            <select 
              className="form-input" 
              style={{width: '110px', fontSize: '11px', padding: '5px 8px', height: 'auto'}}
              value={selectedClient}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                setSelectedClient(e.target.value);
              }}
            >
              <option>All Clients</option>
              {metrics?.clients?.map((c: any) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{height: '200px', marginTop: '16px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.traffic}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [new Intl.NumberFormat('en-US').format(value), 'Sessions']}
                />
                <Line type="monotone" dataKey="sessions" stroke="#2563EB" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-card" onClick={() => window.location.href = domain === 'localhost' ? `/localhost/clients` : `/clients`} style={{ cursor: 'pointer' }}>
          <div className="chart-header">
            <div>
              <div className="chart-title">Keyword Growth</div>
              <div className="chart-subtitle">Top 10 keywords across all clients · 6 months</div>
            </div>
          </div>
          <div style={{height: '200px', marginTop: '16px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.keywords}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [value, 'Keywords']}
                />
                <Line type="monotone" dataKey="keywords" stroke="#059669" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
