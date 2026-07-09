'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

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

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div className="client-avatar" style={{ background: '#4F46E5', width: '56px', height: '56px', fontSize: '20px' }}>AC</div>
        <div style={{ flex: '1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Acme Corp</h1>
            <span className="badge badge-success">Active</span>
            <span className="badge badge-primary">B2B SaaS</span>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            <a href="https://acmecorp.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>acmecorp.com</a> · Client since Jan 2025
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => alert('Editing settings')}>⚙️ Settings</button>
          <button className="btn btn-primary" onClick={() => alert('Generating report...')}>📄 Generate Report</button>
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
              <div className="kpi-value" style={{ fontSize: '24px' }}>8,420</div>
              <div className="kpi-trend trend-up">↑ +16.3%</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Top 10 Keywords</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>47</div>
              <div className="kpi-trend trend-up">↑ +4 kws</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Domain Trust</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>42</div>
              <div className="kpi-trend trend-up">↑ +2 pts</div>
            </div>
            <div className="kpi-card success">
              <div className="kpi-label">Site Health</div>
              <div className="kpi-value" style={{ fontSize: '24px' }}>76%</div>
              <div className="kpi-trend trend-up">↑ +8 pts</div>
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
            <button className="btn btn-secondary btn-sm" onClick={() => toast.loading('Syncing data...', { duration: 2000 })}>🔄 Sync Now</button>
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
