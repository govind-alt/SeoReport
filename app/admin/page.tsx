'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Shield, Users, Building2, TrendingUp, DollarSign,
  Activity, AlertCircle, CheckCircle2, Server, Zap,
  RefreshCw, ChevronRight, Eye, MoreVertical, Globe,
  BarChart2, Lock, Settings, LogOut, Bell, Search,
  ArrowUpRight, ArrowDownRight, Database, Cpu
} from 'lucide-react';

/* ─── Demo data ─── */
const mrrData = [
  { month: 'Jan', mrr: 12400 }, { month: 'Feb', mrr: 14800 },
  { month: 'Mar', mrr: 18200 }, { month: 'Apr', mrr: 16900 },
  { month: 'May', mrr: 21600 }, { month: 'Jun', mrr: 26800 },
];
const agencyGrowth = [
  { month: 'Jan', agencies: 8 }, { month: 'Feb', agencies: 11 },
  { month: 'Mar', agencies: 14 }, { month: 'Apr', agencies: 18 },
  { month: 'May', agencies: 23 }, { month: 'Jun', agencies: 29 },
];
const demoAgencies = [
  { id: '1', name: 'Digital Horizons', subdomain: 'demo', plan: 'pro', clients: 12, reports: 48, status: 'active', mrr: 299, joined: 'Jan 2024' },
  { id: '2', name: 'GrowthPeak Agency', subdomain: 'growthpeak', plan: 'starter', clients: 4, reports: 14, status: 'active', mrr: 99, joined: 'Feb 2024' },
  { id: '3', name: 'Nexus SEO', subdomain: 'nexusseo', plan: 'pro', clients: 21, reports: 87, status: 'active', mrr: 299, joined: 'Mar 2024' },
  { id: '4', name: 'RankMaster Co', subdomain: 'rankmaster', plan: 'enterprise', clients: 63, reports: 248, status: 'active', mrr: 999, joined: 'Jan 2024' },
  { id: '5', name: 'BlueOcean SEO', subdomain: 'blueocean', plan: 'starter', clients: 3, reports: 7, status: 'trial', mrr: 0, joined: 'Jun 2024' },
  { id: '6', name: 'VelocityRank', subdomain: 'velocityrank', plan: 'pro', clients: 9, reports: 33, status: 'suspended', mrr: 299, joined: 'Apr 2024' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A2E', border: '1px solid rgba(79,142,247,0.3)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: '#6B7CA8', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, color: p.color ?? '#4F8EF7', fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('mrr') ? `$${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
};

const planColors: Record<string, { bg: string; color: string }> = {
  starter: { bg: '#F1F5F9', color: '#64748B' },
  pro: { bg: '#EBF2FF', color: '#2563EB' },
  enterprise: { bg: '#F0FFF4', color: '#059669' },
};
const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: '#ECFDF5', color: '#059669' },
  trial: { bg: '#FFFBEB', color: '#D97706' },
  suspended: { bg: '#FEF2F2', color: '#DC2626' },
};

type Tab = 'overview' | 'agencies' | 'users' | 'system' | 'billing';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const totalMRR = demoAgencies.reduce((s, a) => s + a.mrr, 0);
  const totalAgencies = demoAgencies.length;
  const totalClients = demoAgencies.reduce((s, a) => s + a.clients, 0);
  const totalReports = demoAgencies.reduce((s, a) => s + a.reports, 0);

  const filteredAgencies = demoAgencies.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.name.toLowerCase().includes(q) || a.subdomain.toLowerCase().includes(q);
    const matchPlan = planFilter === 'all' || a.plan === planFilter;
    return matchSearch && matchPlan;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Top Navigation ── */}
      <header style={{
        background: '#1A1A2E', borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 28px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #4F8EF7 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: 'white',
            boxShadow: '0 4px 12px rgba(79,142,247,0.45)',
          }}>RF</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>RankFlow</div>
            <div style={{ fontSize: 10, color: '#6B7CA8', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Super Admin Console</div>
          </div>
          <div style={{ marginLeft: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 10, color: '#FCA5A5', fontWeight: 700 }}>
            <Shield size={10} style={{ display: 'inline', marginRight: 4 }} />ADMIN
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={refresh} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7CA8' }}>
            <RefreshCw size={14} className={isRefreshing ? 'spinner' : ''} />
          </button>
          <button style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7CA8' }}>
            <Bell size={14} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #4F8EF7, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>SA</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>Super Admin</div>
              <div style={{ fontSize: 10, color: '#6B7CA8' }}>superadmin@rankflow.app</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #E4E9F2', padding: '0 28px', display: 'flex', gap: 0 }}>
        {([
          { id: 'overview', label: 'Overview', icon: <BarChart2 size={14} /> },
          { id: 'agencies', label: 'Agencies', icon: <Building2 size={14} /> },
          { id: 'users', label: 'Users', icon: <Users size={14} /> },
          { id: 'system', label: 'System Health', icon: <Server size={14} /> },
          { id: 'billing', label: 'Billing', icon: <DollarSign size={14} /> },
        ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '14px 18px', fontSize: 13, fontWeight: 600,
              border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #4F8EF7' : '2px solid transparent',
              color: activeTab === tab.id ? '#4F8EF7' : '#6B7CA8',
              marginBottom: -1, transition: 'all 0.15s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '28px', maxWidth: 1400, margin: '0 auto' }}>
        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
              {[
                { label: 'Monthly Revenue', value: `$${totalMRR.toLocaleString()}`, sub: '+18% vs last month', dir: 'up', icon: <DollarSign size={20} />, color: '#4F8EF7', bg: '#EBF2FF' },
                { label: 'Total Agencies', value: totalAgencies, sub: '3 joined this month', dir: 'up', icon: <Building2 size={20} />, color: '#10B981', bg: '#ECFDF5' },
                { label: 'Total Clients', value: totalClients, sub: 'across all agencies', dir: 'up', icon: <Users size={20} />, color: '#4F8EF7', bg: '#EBF2FF' },
                { label: 'Reports Generated', value: totalReports, sub: '34 this week', dir: 'up', icon: <Activity size={20} />, color: '#10B981', bg: '#ECFDF5' },
              ].map((k, i) => (
                <div key={i} style={{
                  background: 'white', border: '1px solid #E4E9F2', borderRadius: 14,
                  padding: '20px', boxShadow: '0 1px 3px rgba(26,26,46,0.06)', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${k.color}, ${k.color}88)` }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>{k.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.8px', lineHeight: 1 }}>{k.value}</div>
                      <div style={{ fontSize: 12, marginTop: 8, color: k.dir === 'up' ? '#10B981' : '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ArrowUpRight size={13} /> {k.sub}
                      </div>
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {k.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, padding: 22, boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Monthly Recurring Revenue</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>Platform MRR growth (last 6 months)</div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={mrrData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="mrr" name="MRR" stroke="#4F8EF7" strokeWidth={2.5} fill="url(#mrrGrad)" dot={false} activeDot={{ r: 5, fill: '#4F8EF7' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, padding: 22, boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Agency Growth</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>New agencies onboarded monthly</div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={agencyGrowth} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="agencies" name="Agencies" fill="#1A1A2E" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Agencies + System Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
              <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E4E9F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Recent Agencies</div>
                  <button onClick={() => setActiveTab('agencies')} style={{ fontSize: 12, color: '#4F8EF7', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    View All <ChevronRight size={14} />
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {['Agency', 'Plan', 'Clients', 'MRR', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8', borderBottom: '1px solid #E4E9F2' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {demoAgencies.slice(0, 5).map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: '#94A3B8' }}>{a.subdomain}.rankflow.app</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ ...planColors[a.plan], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {a.plan.charAt(0).toUpperCase() + a.plan.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.clients}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>${a.mrr}/mo</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ ...statusColors[a.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* System Status */}
              <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E4E9F2' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>System Status</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>All systems operational</div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  {[
                    { label: 'API Gateway', status: 'operational', latency: '18ms' },
                    { label: 'Database', status: 'operational', latency: '4ms' },
                    { label: 'SE Ranking Proxy', status: 'operational', latency: '240ms' },
                    { label: 'PDF Generator', status: 'degraded', latency: '1.8s' },
                    { label: 'Email Service', status: 'operational', latency: '—' },
                  ].map((svc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid #F1F5F9' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: svc.status === 'operational' ? '#10B981' : '#F59E0B' }} />
                        <span style={{ fontSize: 13, color: '#1A1A2E', fontWeight: 500 }}>{svc.label}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: svc.status === 'operational' ? '#10B981' : '#F59E0B', fontWeight: 700 }}>{svc.status === 'operational' ? 'Operational' : 'Degraded'}</div>
                        <div style={{ fontSize: 10, color: '#94A3B8' }}>{svc.latency}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #E4E9F2', fontSize: 11, color: '#94A3B8', borderRadius: '0 0 14px 14px' }}>
                  Last checked: Just now · <a href="#" style={{ color: '#4F8EF7' }}>View Incidents</a>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ AGENCIES TAB ═══ */}
        {activeTab === 'agencies' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.4px' }}>All Agencies</h1>
                <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Manage all registered agencies on the platform</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ padding: '8px 16px', borderRadius: 8, background: '#EBF2FF', color: '#2563EB', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Export CSV
                </button>
                <button style={{ padding: '8px 18px', borderRadius: 8, background: '#4F8EF7', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  + Invite Agency
                </button>
              </div>
            </div>

            {/* Filters */}
            <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 12, padding: '14px 18px', marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input style={{ width: '100%', paddingLeft: 34, padding: '8px 34px', border: '1.5px solid #E4E9F2', borderRadius: 8, fontSize: 13, outline: 'none', background: '#F8FAFC', color: '#1A1A2E', fontFamily: 'inherit' }} placeholder="Search agencies…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {(['all', 'starter', 'pro', 'enterprise'] as const).map(p => (
                <button key={p} onClick={() => setPlanFilter(p)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s', background: planFilter === p ? '#1A1A2E' : 'white', borderColor: planFilter === p ? '#1A1A2E' : '#E4E9F2', color: planFilter === p ? 'white' : '#6B7CA8' }}>
                  {p === 'all' ? 'All Plans' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E4E9F2' }}>
                    {['Agency', 'Subdomain', 'Plan', 'Clients', 'Reports', 'MRR', 'Joined', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAgencies.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')} onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1A1A2E, #4F8EF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white' }}>
                            {a.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: '#94A3B8' }}>Joined {a.joined}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <code style={{ fontSize: 12, background: '#F8FAFC', padding: '2px 8px', borderRadius: 6, color: '#475569', border: '1px solid #E4E9F2' }}>{a.subdomain}</code>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ ...planColors[a.plan], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {a.plan.charAt(0).toUpperCase() + a.plan.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.clients}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.reports}</td>
                      <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 800, color: '#2563EB' }}>${a.mrr}/mo</td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: '#94A3B8' }}>{a.joined}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ ...statusColors[a.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ padding: '5px 10px', border: '1px solid #E4E9F2', borderRadius: 7, background: 'white', cursor: 'pointer', fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Eye size={12} /> View
                          </button>
                          {a.status === 'active' ? (
                            <button style={{ padding: '5px 10px', border: '1px solid #FECACA', borderRadius: 7, background: '#FEF2F2', cursor: 'pointer', fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
                              Suspend
                            </button>
                          ) : a.status === 'suspended' ? (
                            <button style={{ padding: '5px 10px', border: '1px solid #A7F3D0', borderRadius: 7, background: '#ECFDF5', cursor: 'pointer', fontSize: 12, color: '#059669', fontWeight: 600 }}>
                              Restore
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '12px 16px', background: '#F8FAFC', borderTop: '1px solid #E4E9F2', fontSize: 12, color: '#94A3B8', borderRadius: '0 0 14px 14px' }}>
                {filteredAgencies.length} of {demoAgencies.length} agencies
              </div>
            </div>
          </>
        )}

        {/* ═══ USERS TAB ═══ */}
        {activeTab === 'users' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>Platform Users</h1>
                <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>All users across all agencies</p>
              </div>
            </div>
            <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E4E9F2' }}>
                    {['User', 'Email', 'Agency', 'Role', 'Last Login', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Super Admin', email: 'superadmin@rankflow.app', agency: 'RankFlow Platform', role: 'superadmin', last: '2 min ago', status: 'active' },
                    { name: 'Demo Agency Admin', email: 'demo@rankflow.app', agency: 'Digital Horizons', role: 'admin', last: '1 hour ago', status: 'active' },
                    { name: 'Sarah Miller (Client)', email: 'client@acme.com', agency: 'Digital Horizons', role: 'client', last: '3 days ago', status: 'active' },
                    { name: 'Jake Andrews', email: 'jake@growthpeak.com', agency: 'GrowthPeak Agency', role: 'admin', last: '5 hours ago', status: 'active' },
                    { name: 'Lisa Torres', email: 'lisa@nexusseo.com', agency: 'Nexus SEO', role: 'member', last: '2 days ago', status: 'active' },
                  ].map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: u.role === 'superadmin' ? 'linear-gradient(135deg,#EF4444,#DC2626)' : u.role === 'client' ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#4F8EF7,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white' }}>
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: '#64748B' }}>{u.email}</td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: '#64748B' }}>{u.agency}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: u.role === 'superadmin' ? '#FEF2F2' : u.role === 'client' ? '#ECFDF5' : '#EBF2FF', color: u.role === 'superadmin' ? '#DC2626' : u.role === 'client' ? '#059669' : '#2563EB' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: '#94A3B8' }}>{u.last}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#ECFDF5', color: '#059669' }}>Active</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <button style={{ padding: '5px 12px', border: '1px solid #E4E9F2', borderRadius: 7, background: 'white', cursor: 'pointer', fontSize: 12, color: '#475569' }}>Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══ SYSTEM HEALTH TAB ═══ */}
        {activeTab === 'system' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>System Health</h1>
              <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Real-time platform monitoring & diagnostics</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
              {[
                { label: 'API Uptime', value: '99.97%', icon: <Globe size={20} />, color: '#10B981', bg: '#ECFDF5', trend: 'Last 30 days' },
                { label: 'Avg Response', value: '42ms', icon: <Zap size={20} />, color: '#4F8EF7', bg: '#EBF2FF', trend: '↓ 8ms from yesterday' },
                { label: 'DB Queries/min', value: '2,847', icon: <Database size={20} />, color: '#1A1A2E', bg: '#F1F5F9', trend: 'Peak: 4,200' },
                { label: 'Error Rate', value: '0.03%', icon: <AlertCircle size={20} />, color: '#F59E0B', bg: '#FFFBEB', trend: 'Well within threshold' },
              ].map((k, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</span>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#1A1A2E', marginBottom: 6 }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{k.trend}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                { title: 'API Services', items: [
                  { name: 'Authentication API', status: 'operational', uptime: '99.99%' },
                  { name: 'Reports API', status: 'operational', uptime: '99.95%' },
                  { name: 'SE Ranking Proxy', status: 'operational', uptime: '99.81%' },
                  { name: 'PDF Generation', status: 'degraded', uptime: '98.2%' },
                  { name: 'Webhook Dispatcher', status: 'operational', uptime: '99.97%' },
                ]},
                { title: 'Infrastructure', items: [
                  { name: 'Primary Database', status: 'operational', uptime: '100%' },
                  { name: 'Read Replica', status: 'operational', uptime: '100%' },
                  { name: 'CDN Edge', status: 'operational', uptime: '99.99%' },
                  { name: 'Object Storage', status: 'operational', uptime: '100%' },
                  { name: 'Email Gateway', status: 'operational', uptime: '99.93%' },
                ]},
              ].map((section, si) => (
                <div key={si} style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #E4E9F2', fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>{section.title}</div>
                  {section.items.map((item, i) => (
                    <div key={i} style={{ padding: '12px 18px', borderBottom: i < section.items.length - 1 ? '1px solid #F1F5F9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.status === 'operational' ? '#10B981' : '#F59E0B' }} />
                        <span style={{ fontSize: 13, color: '#1A1A2E' }}>{item.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: item.status === 'operational' ? '#10B981' : '#F59E0B' }}>{item.status === 'operational' ? '● Operational' : '◐ Degraded'}</span>
                        <div style={{ fontSize: 10, color: '#94A3B8' }}>{item.uptime} uptime</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══ BILLING TAB ═══ */}
        {activeTab === 'billing' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>Billing & Revenue</h1>
              <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Platform revenue, subscriptions, and invoices</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 24 }}>
              {[
                { label: 'Current MRR', value: `$${totalMRR}`, sub: '+18% MoM', color: '#4F8EF7' },
                { label: 'Annual Run Rate', value: `$${(totalMRR * 12).toLocaleString()}`, sub: 'Projected ARR', color: '#10B981' },
                { label: 'Avg Revenue / Agency', value: `$${Math.round(totalMRR / totalAgencies)}`, sub: 'Per agency per month', color: '#1A1A2E' },
              ].map((k, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, padding: 22, boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>{k.label}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: k.color, letterSpacing: '-1px' }}>{k.value}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E4E9F2', fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Revenue by Agency</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E4E9F2' }}>
                    {['Agency', 'Plan', 'MRR', 'Next Billing', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {demoAgencies.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ ...planColors[a.plan], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {a.plan.charAt(0).toUpperCase() + a.plan.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: a.mrr > 0 ? '#2563EB' : '#94A3B8' }}>{a.mrr > 0 ? `$${a.mrr}/mo` : 'Trial'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#94A3B8' }}>Aug 1, 2026</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ ...statusColors[a.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
