'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { getClientDetails, syncClientData } from '@/app/actions';

const trendData = [
  { name: 'Jan', count: 32 },
  { name: 'Feb', count: 35 },
  { name: 'Mar', count: 41 },
  { name: 'Apr', count: 42 },
  { name: 'May', count: 43 },
  { name: 'Jun', count: 47 },
];

const trafficData = [
  { name: 'Jan', count: 6200 },
  { name: 'Feb', count: 6800 },
  { name: 'Mar', count: 7100 },
  { name: 'Apr', count: 7400 },
  { name: 'May', count: 7900 },
  { name: 'Jun', count: 8420 },
];

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string; domain: string }> }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const resolvedParams = use(params);
  const clientId = resolvedParams.clientId;
  const domain = resolvedParams.domain;

  useEffect(() => {
    setLoading(true);
    getClientDetails(clientId).then(data => {
      setClient(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [clientId]);

  const handleSync = async () => {
    setIsSyncing(true);
    toast.loading('Syncing data...', { id: 'sync' });
    try {
      await syncClientData(clientId, domain);
      toast.success('Sync complete', { id: 'sync' });
      // Refresh local data
      const updatedData = await getClientDetails(clientId);
      if (updatedData) setClient(updatedData);
    } catch (e: any) {
      toast.error(e.message || 'Sync failed', { id: 'sync' });
    }
    setIsSyncing(false);
  };

  if (loading) return <div style={{padding: '40px'}}>Loading...</div>;
  if (!client) return (
    <div style={{padding: '40px', textAlign: 'center'}}>
      <h2>Client not found</h2>
      <p style={{color: 'var(--text-muted)', marginBottom: '20px'}}>The client you are looking for does not exist.</p>
      <Link href="/clients" className="btn btn-primary">Back to Clients</Link>
    </div>
  );

  return (
    <>
      {/* Breadcrumb */}
      <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px'}}>
        <Link href={`/${domain}/clients`} style={{color: 'inherit', textDecoration: 'none'}}>Clients</Link> › <span style={{color: 'var(--text)', fontWeight: 500}}>{client.name}</span> › <span style={{textTransform: 'capitalize'}}>{activeTab}</span>
      </div>
      
      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{client.name}</div>
          <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>{client.domain}</a>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div onClick={() => toast.info('Date range filtering coming soon')} style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'var(--bg)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500}}>
            📅 May 2024 vs Apr 2024 ▾
          </div>
          
          <div onClick={() => toast.info(client.gscConnected ? 'Google Search Console is active' : 'You can connect GSC in client settings')} style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 500, padding: '6px 10px', borderRadius: '6px', background: client.gscConnected ? '#f0fdf4' : '#fff1f2', border: `1px solid ${client.gscConnected ? '#c0e8c8' : '#fecdd3'}`, color: client.gscConnected ? '#15803d' : '#e11d48', cursor: 'pointer'}}>
            {client.gscConnected ? '✅ GSC Connected' : '❌ GSC Disconnected'}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => { toast.info('Client settings editing coming soon'); window.location.href = `/${domain}/settings`; }}>⚙ Edit</button>
          <button className="btn btn-primary btn-sm" onClick={() => window.location.href = `/${domain}/reports`}>+ Report</button>
          <div style={{fontSize: '18px', cursor: 'pointer', padding: '4px'}} onClick={() => toast('No new notifications', { icon: '🔔' })}>🔔</div>
        </div>
      </div>

      {/* TABS */}
      <div className="custom-tabs">
        {['overview', 'keywords', 'backlinks', 'audit', 'analytics', 'competitors', 'reports'].map(tab => (
          <div 
            key={tab} 
            className={`ctab ${activeTab === tab ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="tab-panel active">
          <div className="kpi-grid kpi-grid-5" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '20px' }}>
            <div className="kpi-card success">
              <div className="kpi-label">Sessions</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>{client.snapshots?.analytics?.[0]?.sessions || '--'}</div>
              <div className="kpi-trend trend-up">↑</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Top 10 Keywords</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>{client.snapshots?.keywords?.[0]?.top10 || '--'}</div>
              <div className="kpi-trend trend-up">↑</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Domain Trust</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>{client.snapshots?.backlinks?.domainTrust || '--'}</div>
              <div className="kpi-trend trend-up">↑</div>
            </div>
            <div className="kpi-card success">
              <div className="kpi-label">Site Health</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>{client.snapshots?.audit?.healthScore || '--'}%</div>
              <div className="kpi-trend trend-up">↑</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">AI Visibility</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>14</div>
              <div className="kpi-trend trend-flat">ChatGPT mentions</div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-header">
                <div>
                  <div className="chart-title">Keyword Position Trend</div>
                  <div className="chart-subtitle">Top 10 count — 6 months</div>
                </div>
              </div>
              <div style={{ height: '180px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="chart-card" style={{ marginBottom: 0 }}>
              <div className="chart-header">
                <div>
                  <div className="chart-title">Organic Traffic Trend</div>
                  <div className="chart-subtitle">Sessions — 6 months</div>
                </div>
              </div>
              <div style={{ height: '180px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6B7280'}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={() => toast.success('Report generation started')}>+ Generate Report</button>
            <button className="btn btn-secondary btn-sm" onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? '🔄 Syncing...' : '🔄 Sync Now'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('reports')}>📄 View Reports</button>
          </div>
        </div>
      )}

      {/* TAB: KEYWORDS (placeholder for other tabs) */}
      {activeTab !== 'overview' && (
        <div className="tab-panel active">
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Data</h3>
            <p style={{ color: 'var(--text-muted)' }}>This section will be wired up to the SERanking API endpoints.</p>
          </div>
        </div>
      )}

    </>
  );
}
