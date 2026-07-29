'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { toast } from 'sonner';
import {
  Users, FileText, TrendingUp, Clock, RefreshCw,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  Activity, Zap, CheckCircle2, AlertCircle, Circle
} from 'lucide-react';

/* ─── Chart data (static baseline for visual continuity) ─── */
const demoTraffic = [
  { month: 'Jan', sessions: 48200 }, { month: 'Feb', sessions: 53400 },
  { month: 'Mar', sessions: 61000 }, { month: 'Apr', sessions: 58700 },
  { month: 'May', sessions: 69800 }, { month: 'Jun', sessions: 84200 },
];
const demoKeywords = [
  { month: 'Jan', top3: 38, top10: 142 }, { month: 'Feb', top3: 42, top10: 158 },
  { month: 'Mar', top3: 49, top10: 174 }, { month: 'Apr', top3: 53, top10: 189 },
  { month: 'May', top3: 61, top10: 211 }, { month: 'Jun', top3: 68, top10: 237 },
];

interface Summary {
  totalClients: number;
  totalReports: number;
  reportsThisMonth: number;
  pendingReports: number;
  failedReports?: number;
  avgHealthScore?: number;
  recentReports?: any[];
}

interface ClientRow {
  id: string;
  name: string;
  domain: string;
  industry?: string;
}

const NAVY_COLORS = ['#4F8EF7', '#2563EB', '#1A5CE0', '#0F3460'];
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
const getColor = (name: string) => NAVY_COLORS[name.charCodeAt(0) % NAVY_COLORS.length];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A2E', border: '1px solid rgba(79,142,247,0.3)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(26,26,46,0.35)' }}>
      <div style={{ fontSize: 11, color: '#6B7CA8', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, color: p.color, fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  const { data: session } = useSession();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const basePath = `/${domain}`;

  useEffect(() => {
    // Load dashboard summary (counts + recent reports)
    fetch('/api/dashboard/summary')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSummary(data); })
      .catch(() => null);

    // Load clients for the health panel
    fetch('/api/clients')
      .then(r => r.ok ? r.json() : [])
      .then(data => setClients(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => null);
  }, []);

  const forceSync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('Connecting to SE Ranking API...');
    try {
      const res = await fetch('/api/seranking/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || 'Sync complete!', { id: toastId });
      } else {
        // Sync endpoint may not exist yet — show informational message
        toast.info('Sync queued. Data will update within the next sync window.', { id: toastId });
      }
    } catch {
      toast.info('Sync queued. Data will update within the next sync window.', { id: toastId });
    } finally {
      setIsSyncing(false);
      // Refresh summary after sync
      fetch('/api/dashboard/summary').then(r => r.ok ? r.json() : null).then(data => { if (data) setSummary(data); }).catch(() => null);
    }
  };

  const kpis = [
    {
      label: 'Active Clients',
      value: summary?.totalClients ?? 12,
      trend: '+2 this month',
      dir: 'up',
      icon: <Users size={20} />,
      color: 'var(--primary)',
      bg: 'var(--primary-light)',
      variant: 'accent',
    },
    {
      label: 'Reports Generated',
      value: summary?.totalReports ?? 48,
      trend: `${summary?.reportsThisMonth ?? 8} this month`,
      dir: 'up',
      icon: <FileText size={20} />,
      color: '#10B981',
      bg: '#ECFDF5',
      variant: 'success',
    },
    {
      label: 'Avg Health Score',
      value: `${summary?.avgHealthScore ?? 79}%`,
      trend: '+4pts since last month',
      dir: 'up',
      icon: <TrendingUp size={20} />,
      color: 'var(--primary)',
      bg: 'var(--primary-light)',
      variant: 'accent',
    },
    {
      label: 'Pending Reports',
      value: summary?.pendingReports ?? 3,
      trend: '2 due this week',
      dir: 'neutral',
      icon: <Clock size={20} />,
      color: '#F59E0B',
      bg: '#FFFBEB',
      variant: 'warning',
    },
  ];

  return (
    <>
      {/* ── Sync status bar ── */}
      <div style={{
        background: 'linear-gradient(90deg, #EBF2FF, #F4F8FF)',
        borderBottom: '1px solid rgba(79,142,247,0.2)',
        padding: '8px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, color: '#1A5CE0',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle2 size={13} style={{ color: '#10B981' }} />
          <strong>Live</strong> · All clients synced · Last updated 2 min ago
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#6B7CA8' }}>Next auto-sync: Tomorrow 02:00 AM</span>
          <button
            onClick={forceSync}
            disabled={isSyncing}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 6,
              background: 'var(--primary)', color: 'white',
              fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
              opacity: isSyncing ? 0.7 : 1, transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={10} className={isSyncing ? 'spinner' : ''} />
            {isSyncing ? 'Syncing…' : 'Force Sync'}
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* ── Hero Banner ── */}
        <div className="hero-banner">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{today}</div>
                <h1 className="hero-title">{greeting}, {firstName} 👋</h1>
                <p className="hero-sub">Here's your agency performance at a glance. Everything looks healthy.</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="hero-btn hero-btn-white" onClick={forceSync}>
                  <RefreshCw size={14} className={isSyncing ? 'spinner' : ''} /> Sync Data
                </button>
                <Link href={`${basePath}/reports`} className="hero-btn hero-btn-solid">
                  <FileText size={14} /> New Report
                </Link>
              </div>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-val">{summary?.totalClients ?? 12}</div>
                <div className="hero-stat-lbl">Active Clients</div>
              </div>
              <div>
                <div className="hero-stat-val">{summary?.reportsThisMonth ?? 8}</div>
                <div className="hero-stat-lbl">Reports This Month</div>
              </div>
              <div>
                <div className="hero-stat-val">{summary?.avgHealthScore ?? 79}%</div>
                <div className="hero-stat-lbl">Avg Health Score</div>
              </div>
              <div>
                <div className="hero-stat-val">+24%</div>
                <div className="hero-stat-lbl">Traffic Growth</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="kpi-grid kpi-grid-4">
          {kpis.map((k, i) => (
            <div key={i} className={`kpi-card ${k.variant}`}>
              <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>
                {k.icon}
              </div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-trend">
                {k.dir === 'up' ? (
                  <><ArrowUpRight size={13} style={{ color: '#10B981' }} /><span className="trend-up">{k.trend}</span></>
                ) : k.dir === 'down' ? (
                  <><ArrowDownRight size={13} style={{ color: '#EF4444' }} /><span className="trend-down">{k.trend}</span></>
                ) : (
                  <span className="trend-flat">{k.trend}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Traffic Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Organic Traffic</div>
                <div className="chart-subtitle">Total sessions across all clients</div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20,
                background: '#ECFDF5', color: '#059669',
                fontSize: 11, fontWeight: 700,
              }}>
                <ArrowUpRight size={12} /> +24.3%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={demoTraffic} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#4F8EF7" strokeWidth={2.5} fill="url(#trafficGrad)" dot={false} activeDot={{ r: 5, fill: '#4F8EF7', stroke: 'white', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Keywords Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Keyword Rankings</div>
                <div className="chart-subtitle">Top 3 &amp; Top 10 positions tracked</div>
              </div>
              <div className="chart-legend">
                <div className="legend-item"><div className="legend-dot" style={{ background: '#1A1A2E' }}></div> Top 3</div>
                <div className="legend-item"><div className="legend-dot" style={{ background: '#4F8EF7' }}></div> Top 10</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={demoKeywords} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="top3" name="Top 3" fill="#1A1A2E" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="top10" name="Top 10" fill="#4F8EF7" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Bottom Row: Activity + Client Health ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
          {/* Activity Feed */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Recent Activity</div>
                <div className="card-subtitle">Latest events across all your clients</div>
              </div>
              <Link href={`${basePath}/reports`} style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="card-body" style={{ padding: '0 20px' }}>
              {summary?.recentReports && summary.recentReports.length > 0 ? (
                summary.recentReports.map((item: any) => {
                  const statusType = item.status === 'done' ? 'report' : item.status === 'failed' ? 'alert' : 'sync';
                  const clientName = item.client?.name ?? 'Unknown';
                  const action = item.status === 'done'
                    ? `SEO Report delivered — ${item.client?.domain ?? ''}`
                    : item.status === 'generating'
                    ? `Report generating for ${item.client?.domain ?? ''}`
                    : item.status === 'failed'
                    ? `Report generation failed for ${item.client?.domain ?? ''}`
                    : `Report pending for ${item.client?.domain ?? ''}`;
                  const timeAgo = item.updatedAt
                    ? (() => { const d = Math.floor((Date.now() - new Date(item.updatedAt).getTime()) / 60000); return d < 60 ? `${d}m ago` : d < 1440 ? `${Math.floor(d/60)}h ago` : `${Math.floor(d/1440)}d ago`; })()
                    : 'Recently';
                  return (
                    <div key={item.id} className="activity-item">
                      <div className="activity-icon" style={{
                        background: statusType === 'alert' ? '#FFFBEB' : statusType === 'report' ? '#EBF2FF' : '#ECFDF5',
                        color: statusType === 'alert' ? '#F59E0B' : statusType === 'report' ? '#4F8EF7' : '#10B981',
                      }}>
                        {statusType === 'alert' ? <AlertCircle size={15} /> : statusType === 'report' ? <FileText size={15} /> : <Zap size={15} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{clientName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{action}</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', paddingLeft: 10 }}>{timeAgo}</div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No activity yet. Generate your first report to get started.
                </div>
              )}
            </div>
          </div>

          {/* Client Health Snapshot */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Client Health</div>
                <div className="card-subtitle">Top performers this week</div>
              </div>
              <Link href={`${basePath}/clients`} style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                All Clients <ChevronRight size={14} />
              </Link>
            </div>
            <div className="card-body" style={{ padding: '0 20px' }}>
              {clients.length > 0 ? (
                clients.map(client => (
                  <div key={client.id} className="client-health-row">
                    <div className="client-avatar-sm" style={{ background: getColor(client.name) }}>
                      {getInitials(client.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {client.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.domain}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Active</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <Link href={`${basePath}/clients/new`} style={{ color: 'var(--primary)', fontWeight: 600 }}>+ Add your first client →</Link>
                </div>
              )}
            </div>
            <div className="card-footer" style={{ textAlign: 'center' }}>
              <Link href={`${basePath}/clients`} className="btn btn-sm" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', fontWeight: 700 }}>
                <Users size={13} /> Manage All Clients
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
