'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getClientDetails, generateReportForClient, deleteClient, updateClient, sendClientPortalInvite } from '@/app/actions';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ClientDetailPage({ params }: { params: Promise<{ domain: string; clientId: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  const clientId = resolvedParams.clientId;

  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'traffic' | 'backlinks' | 'audit' | 'competitors' | 'reports'>('overview');
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [invitingPortal, setInvitingPortal] = useState(false);

  useEffect(() => {
    getClientDetails(clientId).then(data => {
      setClient(data);
      // Parse competitors from JSON string
      if (data?.competitors) {
        try {
          const parsed = JSON.parse(data.competitors);
          setCompetitors(Array.isArray(parsed) ? parsed : []);
        } catch {
          setCompetitors([]);
        }
      }
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [clientId]);

  const handleAddCompetitor = async () => {
    if (!newCompetitor.trim()) return;
    const domain = newCompetitor.trim().replace(/^https?:\/\//, '').replace(/\/.*/, '');
    const updated = [...competitors, domain];
    setCompetitors(updated);
    setNewCompetitor('');
    setShowAddCompetitor(false);
    try {
      await fetch(`/api/clients/${clientId}/competitors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitors: updated }),
      });
      toast.success(`Added ${domain} as competitor`);
    } catch {
      toast.error('Failed to save competitor');
    }
  };

  const handleRemoveCompetitor = async (domain: string) => {
    const updated = competitors.filter(c => c !== domain);
    setCompetitors(updated);
    try {
      await fetch(`/api/clients/${clientId}/competitors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitors: updated }),
      });
      toast.success(`Removed ${domain}`);
    } catch {
      toast.error('Failed to update competitors');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        <div>Loading client data...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
        <div style={{ fontSize: '16px', fontWeight: 700 }}>Client not found</div>
        <Link href={`/${domain}/clients`} className="btn btn-secondary" style={{ marginTop: '16px', display: 'inline-block' }}>← Back to Clients</Link>
      </div>
    );
  }

  const { snapshots } = client;

  // Build chart data from snapshots (sorted oldest first)
  const kwSnaps = [...(snapshots.keywords || [])].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const anSnaps = [...(snapshots.analytics || [])].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const trafficData = anSnaps.map((s: any) => ({
    name: MONTHS[new Date(s.date).getMonth()],
    sessions: s.sessions,
    users: s.users,
  }));

  const keywordData = kwSnaps.map((s: any) => ({
    name: MONTHS[new Date(s.date).getMonth()],
    top3: s.top3,
    top10: s.top10,
    top100: s.top100,
  }));

  const latest = {
    kw: kwSnaps[kwSnaps.length - 1] || { top3: 0, top10: 0, top100: 0, totalKeywords: 0 },
    an: anSnaps[anSnaps.length - 1] || { sessions: 0, users: 0, pageviews: 0 },
    bl: snapshots.backlinks || { totalBacklinks: 0, referringDomains: 0, newBacklinks: 0, lostBacklinks: 0, domainTrust: 0 },
    au: snapshots.audit || { healthScore: 0, criticalIssues: 0, warnings: 0, notices: 0 },
  };

  const prevAn = anSnaps[anSnaps.length - 2];
  const prevKw = kwSnaps[kwSnaps.length - 2];
  const sessionChange = prevAn ? (((latest.an.sessions - prevAn.sessions) / prevAn.sessions) * 100).toFixed(1) : null;
  const kwChange = prevKw ? latest.kw.top10 - prevKw.top10 : null;

  const pieData = [
    { name: 'Top 3', value: latest.kw.top3, color: '#10B981' },
    { name: '4-10', value: latest.kw.top10 - latest.kw.top3, color: '#3B82F6' },
    { name: '11-100', value: latest.kw.top100 - latest.kw.top10, color: '#8B5CF6' },
    { name: '100+', value: Math.max(0, latest.kw.totalKeywords - latest.kw.top100), color: '#E5E7EB' },
  ].filter(d => d.value > 0);

  const handleGenerateReport = async () => {
    const toastId = toast.loading(`Generating report for ${client.name}...`);
    try {
      await generateReportForClient(domain, clientId);
      toast.success('Report generated!', { id: toastId });
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate report', { id: toastId });
    }
  };

  const handleDeleteClient = async () => {
    if (!confirm(`Are you sure you want to delete "${client.name}"? This action cannot be undone.`)) return;
    try {
      await deleteClient(domain, clientId);
      toast.success(`${client.name} deleted`);
      window.location.href = `/${domain}/clients`;
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete client');
    }
  };

  const handleSendPortalInvite = async () => {
    if (!client.contactEmail) {
      toast.error('This client has no contact email. Please edit the client first.');
      return;
    }
    setInvitingPortal(true);
    try {
      await sendClientPortalInvite(domain, clientId);
      toast.success(`Portal invite sent to ${client.contactEmail}!`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to send portal invite');
    } finally {
      setInvitingPortal(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href={`/${domain}/clients`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>← Clients</Link>
          <div className="client-avatar" style={{ background: '#4F46E5', width: '42px', height: '42px', fontSize: '14px', flexShrink: 0 }}>{client.name.substring(0, 2).toUpperCase()}</div>
          <div>
            <div className="page-title" style={{ marginBottom: '2px' }}>{client.name}</div>
            <div className="page-subtitle">{client.website}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleDeleteClient} style={{ color: 'var(--danger)' }}>🗑 Delete</button>
          <button className="btn btn-secondary btn-sm" onClick={() => {
            setEditName(client.name);
            setEditWebsite(client.website || '');
            setShowEditModal(true);
          }}>✏️ Edit</button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleSendPortalInvite}
            disabled={invitingPortal}
            title={client.contactEmail ? `Send portal invite to ${client.contactEmail}` : 'Add a contact email first'}
          >
            {invitingPortal ? '⏳ Sending…' : '📧 Send Portal Invite'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleGenerateReport}>📄 Generate Report</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '24px' }}>
        <div className="kpi-card success">
          <div className="kpi-icon">🌐</div>
          <div className="kpi-label">Organic Sessions</div>
          <div className="kpi-value">{latest.an.sessions.toLocaleString()}</div>
          <div className={`kpi-trend ${sessionChange && Number(sessionChange) >= 0 ? 'trend-up' : 'trend-down'}`}>
            {sessionChange ? `${Number(sessionChange) >= 0 ? '+' : ''}${sessionChange}% vs last month` : 'No previous data'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">🔑</div>
          <div className="kpi-label">Keywords Top 10</div>
          <div className="kpi-value">{latest.kw.top10}</div>
          <div className={`kpi-trend ${kwChange && kwChange >= 0 ? 'trend-up' : 'trend-down'}`}>
            {kwChange !== null ? `${kwChange >= 0 ? '+' : ''}${kwChange} vs last month` : 'No previous data'}
          </div>
        </div>
        <div className={`kpi-card ${latest.au.healthScore >= 80 ? 'success' : latest.au.healthScore >= 60 ? '' : 'warning'}`}>
          <div className="kpi-icon">❤️</div>
          <div className="kpi-label">Site Health Score</div>
          <div className="kpi-value" style={{ color: latest.au.healthScore >= 80 ? 'var(--success)' : latest.au.healthScore >= 60 ? 'inherit' : 'var(--warning)' }}>{latest.au.healthScore}%</div>
          <div className="kpi-trend">{latest.au.criticalIssues} critical issues</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">🔗</div>
          <div className="kpi-label">Total Backlinks</div>
          <div className="kpi-value">{(latest.bl.totalBacklinks || 0).toLocaleString()}</div>
          <div className="kpi-trend trend-up">+{latest.bl.newBacklinks || 0} new this month</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--border)', marginBottom: '24px', overflowX: 'auto' }}>
        {([
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'keywords', label: 'Keywords', icon: '🔑' },
          { id: 'traffic', label: 'Analytics', icon: '📈' },
          { id: 'backlinks', label: 'Backlinks', icon: '🔗' },
          { id: 'audit', label: 'Audit', icon: '🩺' },
          { id: 'competitors', label: 'Competitors', icon: '⚔️' },
          { id: 'reports', label: 'Reports', icon: '📄' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            {/* Traffic Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Organic Sessions Trend</div>
                  <div className="chart-subtitle">Monthly organic traffic · 6 months</div>
                </div>
              </div>
              <div style={{ height: '200px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(v: any) => [v.toLocaleString(), 'Sessions']} />
                    <Area type="monotone" dataKey="sessions" stroke="#2563EB" strokeWidth={3} fill="url(#trafficGrad)" dot={{ r: 4, strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Keyword Ranking Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Keyword Rankings</div>
                  <div className="chart-subtitle">Top 10 keywords · 6 months</div>
                </div>
              </div>
              <div style={{ height: '200px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={keywordData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="top3" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Top 3" />
                    <Line type="monotone" dataKey="top10" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} name="Top 10" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Audit + Backlinks row */}
          <div className="grid-2">
            <div className="card">
              <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>🔍 Site Audit</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 900, color: latest.au.healthScore >= 80 ? '#10B981' : latest.au.healthScore >= 60 ? '#F59E0B' : '#EF4444' }}>{latest.au.healthScore}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>HEALTH SCORE</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Critical Issues', value: latest.au.criticalIssues, color: '#EF4444' },
                    { label: 'Warnings', value: latest.au.warnings, color: '#F59E0B' },
                    { label: 'Notices', value: latest.au.notices, color: '#6B7280' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="progress-bar" style={{ width: '100%' }}>
                <div className={`progress-fill ${latest.au.healthScore >= 80 ? 'success' : 'warning'}`} style={{ width: `${latest.au.healthScore}%` }}></div>
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>🔗 Backlink Profile</div>
              {[
                { label: 'Total Backlinks', value: latest.bl.totalBacklinks?.toLocaleString() || '0' },
                { label: 'Referring Domains', value: latest.bl.referringDomains?.toLocaleString() || '0' },
                { label: 'New This Month', value: `+${latest.bl.newBacklinks || 0}`, positive: true },
                { label: 'Lost This Month', value: `-${latest.bl.lostBacklinks || 0}`, negative: true },
                { label: 'Domain Trust Score', value: `${latest.bl.domainTrust || 0}/100` },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: item.positive ? 'var(--success)' : item.negative ? 'var(--danger)' : 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Keywords */}
      {activeTab === 'keywords' && (
        <div>
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            <div className="chart-card">
              <div className="chart-header"><div className="chart-title">Keyword Distribution</div></div>
              <div style={{ height: '220px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any, name: any) => [v, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }}></div>
                    {d.name}: <strong>{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-header"><div className="chart-title">Top 10 Keywords Trend</div></div>
              <div style={{ height: '200px', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={keywordData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="top3" stackId="a" fill="#10B981" name="Top 3" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="top10" stackId="a" fill="#3B82F6" name="Top 10" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Keyword Stats */}
          <div className="card">
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Keyword Position Breakdown</div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Position Range</th><th>Count</th><th>Change (MoM)</th><th>% of Total</th></tr></thead>
                <tbody>
                  <tr><td><span className="pos-badge pos-1-3" style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Top 3</span></td><td><strong>{latest.kw.top3}</strong></td><td className="chg-up">▲+{prevKw ? latest.kw.top3 - prevKw.top3 : 0}</td><td>{latest.kw.totalKeywords ? ((latest.kw.top3 / latest.kw.totalKeywords) * 100).toFixed(1) : 0}%</td></tr>
                  <tr><td><span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Top 10</span></td><td><strong>{latest.kw.top10}</strong></td><td className="chg-up">▲+{prevKw ? latest.kw.top10 - prevKw.top10 : 0}</td><td>{latest.kw.totalKeywords ? ((latest.kw.top10 / latest.kw.totalKeywords) * 100).toFixed(1) : 0}%</td></tr>
                  <tr><td><span style={{ background: '#EDE9FE', color: '#5B21B6', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Top 100</span></td><td><strong>{latest.kw.top100}</strong></td><td className="chg-up">▲+{prevKw ? latest.kw.top100 - prevKw.top100 : 0}</td><td>{latest.kw.totalKeywords ? ((latest.kw.top100 / latest.kw.totalKeywords) * 100).toFixed(1) : 0}%</td></tr>
                  <tr><td><span style={{ background: '#F3F4F6', color: '#374151', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>Total Tracked</span></td><td><strong>{latest.kw.totalKeywords}</strong></td><td>—</td><td>100%</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Traffic */}
      {activeTab === 'traffic' && (
        <div>
          <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '24px' }}>
            <div className="kpi-card success"><div className="kpi-icon">👥</div><div className="kpi-label">Sessions</div><div className="kpi-value">{latest.an.sessions.toLocaleString()}</div><div className="kpi-trend trend-up">Current month</div></div>
            <div className="kpi-card"><div className="kpi-icon">🧑</div><div className="kpi-label">Users</div><div className="kpi-value">{latest.an.users.toLocaleString()}</div><div className="kpi-trend">Unique visitors</div></div>
            <div className="kpi-card"><div className="kpi-icon">📄</div><div className="kpi-label">Pageviews</div><div className="kpi-value">{latest.an.pageviews.toLocaleString()}</div><div className="kpi-trend">Total page views</div></div>
            <div className="kpi-card"><div className="kpi-icon">📊</div><div className="kpi-label">Pages/Session</div><div className="kpi-value">{latest.an.sessions ? (latest.an.pageviews / latest.an.sessions).toFixed(1) : '0'}</div><div className="kpi-trend">Avg pages per visit</div></div>
          </div>
          <div className="chart-card">
            <div className="chart-header"><div className="chart-title">Traffic Trend</div><div className="chart-subtitle">Sessions & Users over 6 months</div></div>
            <div style={{ height: '280px', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(v: any, n: any) => [v.toLocaleString(), n]} />
                  <Area type="monotone" dataKey="sessions" stroke="#2563EB" strokeWidth={3} fill="url(#sessGrad)" dot={{ r: 4, strokeWidth: 2 }} name="Sessions" />
                  <Area type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} fill="url(#userGrad)" dot={{ r: 3, strokeWidth: 2 }} name="Users" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Backlinks */}
      {activeTab === 'backlinks' && (
        <div>
          <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '24px' }}>
            {[
              { icon: '🔗', label: 'Total Backlinks', val: (latest.bl.totalBacklinks || 0).toLocaleString(), trend: `+${latest.bl.newBacklinks || 0} new this month`, color: 'success' },
              { icon: '🌐', label: 'Referring Domains', val: (latest.bl.referringDomains || 0).toLocaleString(), trend: 'Unique domains linking', color: '' },
              { icon: '✅', label: 'New Backlinks', val: `+${latest.bl.newBacklinks || 0}`, trend: 'Gained this month', color: 'success' },
              { icon: '🏆', label: 'Domain Trust', val: `${latest.bl.domainTrust || 0}/100`, trend: 'Authority score', color: '' },
            ].map(k => (
              <div key={k.label} className={`kpi-card ${k.color}`}>
                <div className="kpi-icon">{k.icon}</div>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">{k.val}</div>
                <div className="kpi-trend trend-up">{k.trend}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Backlink Profile</div>
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔗</div>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Backlink data from SERanking</div>
              <div style={{ fontSize: '13px' }}>Connect SERanking to see detailed backlink analysis including anchor texts, referring pages, and link quality scores.</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit */}
      {activeTab === 'audit' && (
        <div>
          <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '24px' }}>
            {[
              { icon: '❤️', label: 'Health Score', val: `${latest.au.healthScore}%`, trend: 'Overall site health', color: latest.au.healthScore >= 80 ? 'success' : 'warning' },
              { icon: '🚨', label: 'Critical Issues', val: latest.au.criticalIssues.toString(), trend: 'Requires immediate action', color: latest.au.criticalIssues > 0 ? 'warning' : 'success' },
              { icon: '⚠️', label: 'Warnings', val: latest.au.warnings.toString(), trend: 'Recommended fixes', color: '' },
              { icon: 'ℹ️', label: 'Notices', val: latest.au.notices.toString(), trend: 'Low priority items', color: '' },
            ].map(k => (
              <div key={k.label} className={`kpi-card ${k.color}`}>
                <div className="kpi-icon">{k.icon}</div>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">{k.val}</div>
                <div className="kpi-trend">{k.trend}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Site Audit Details</div>
            {latest.au.healthScore === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🩺</div>
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>No audit data yet</div>
                <div style={{ fontSize: '13px' }}>Run a site audit from SERanking to see detailed technical SEO issues here.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[{ severity: 'critical', icon: '🚨', label: `${latest.au.criticalIssues} Critical Issues`, desc: 'Broken links, missing canonical tags, blocked resources', color: 'var(--danger)' },
                  { severity: 'warning', icon: '⚠️', label: `${latest.au.warnings} Warnings`, desc: 'Missing alt texts, slow page speed, duplicate content', color: 'var(--warning)' },
                  { severity: 'info', icon: 'ℹ️', label: `${latest.au.notices} Notices`, desc: 'Minor optimizations, meta description length, etc.', color: 'var(--primary)' }].map(item => (
                  <div key={item.severity} style={{ display: 'flex', gap: '14px', padding: '14px', background: 'var(--gray-50)', borderRadius: '8px', alignItems: 'center' }}>
                    <div style={{ fontSize: '24px' }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: item.color, fontSize: '14px' }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>View Details</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Competitors */}
      {activeTab === 'competitors' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Competitor Analysis</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Track and compare competitor domains for {client.name}</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddCompetitor(true)}>+ Add Competitor</button>
          </div>

          {/* Add Competitor Modal */}
          {showAddCompetitor && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddCompetitor(false)}>
              <div style={{ background: 'white', borderRadius: '14px', padding: '28px', width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>➕ Add Competitor Domain</div>
                <div className="form-group">
                  <label className="form-label">Competitor Website</label>
                  <label className="form-label">Competitor Domain</label>
                  <input type="text" className="form-input" placeholder="e.g., example.com" value={newCompetitor} onChange={e => setNewCompetitor(e.target.value)} />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setShowAddCompetitor(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleAddCompetitor}>Add Competitor</button>
                </div>
              </div>
            </div>
          )}

          {competitors.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '14px' }}>⚔️</div>
              <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>No competitors added yet</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Add competitor domains to track their rankings alongside {client.name}</div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddCompetitor(true)}>+ Add First Competitor</button>
            </div>
          ) : (
            <div className="card">
              <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Tracked Competitors ({competitors.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {competitors.map((comp, i) => (
                  <div key={comp} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: '8px', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `hsl(${i * 47 + 200}, 70%, 92%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: `hsl(${i * 47 + 200}, 60%, 40%)` }}>
                      {comp.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{comp}</div>
                      <a href={`https://${comp}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none' }}>https://{comp} ↗</a>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => window.open(`https://seranking.com/research?domain=${comp}`, '_blank')}>📊 Analyze</button>
                      <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveCompetitor(comp)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '20px', padding: '16px', background: 'linear-gradient(135deg, #f0f4ff, #faf0ff)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>💡 Competitor tracking tip</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Connect SERanking to automatically pull competitor ranking data and compare keyword overlaps, traffic estimates, and backlink profiles side-by-side.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleGenerateReport}>📄 Generate New Report</button>
          </div>
          <div className="card">
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Report History</div>
            {(!snapshots.reports || snapshots.reports.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
                <div>No reports generated yet</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Title</th><th>Period</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                  <tbody>
                    {snapshots.reports.map((r: any) => (
                      <tr key={r.id}>
                        <td><strong>{r.title}</strong></td>
                        <td>{new Date(r.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                        <td><span className="badge badge-success"><span className="badge-dot"></span>Ready</span></td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }} suppressHydrationWarning>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => window.open(`/reports/render/${r.id}`, '_blank')}>👁 View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Edit Client Modal */}
      {showEditModal && (
        <div className="modal-overlay active" style={{ zIndex: 1000 }} onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit Client</div>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSaving(true);
              try {
                await updateClient(clientId, domain, { name: editName, domain: editWebsite });
                setClient({ ...client, name: editName, website: editWebsite });
                toast.success('Client updated successfully');
                setShowEditModal(false);
              } catch (err: any) {
                toast.error(err.message || 'Failed to update client');
              } finally {
                setIsSaving(false);
              }
            }}>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Client Name</label>
                  <input required type="text" className="form-input" value={editName} onChange={e => setEditName(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Website Domain</label>
                  <input type="text" className="form-input" placeholder="e.g., example.com" value={editWebsite} onChange={e => setEditWebsite(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)} disabled={isSaving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
