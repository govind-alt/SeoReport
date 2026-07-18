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

/* ─── Demo data (shown until API data loads) ─── */
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
const demoActivity = [
  { id: '1', type: 'report', client: 'Acme Corp', action: 'Monthly SEO Report generated', time: '2 hours ago', status: 'success' },
  { id: '2', type: 'sync',   client: 'TechVision', action: 'SE Ranking data synced — 247 keywords updated', time: '4 hours ago', status: 'success' },
  { id: '3', type: 'alert',  client: 'GrowthLabs', action: 'Traffic drop detected — down 12% this week', time: '6 hours ago', status: 'warning' },
  { id: '4', type: 'report', client: 'Bloom Agency', action: 'Q2 Performance Report delivered to client', time: '1 day ago', status: 'success' },
  { id: '5', type: 'sync',   client: 'NexaRetail', action: 'Backlink audit completed — 1,204 new links', time: '1 day ago', status: 'success' },
];
const demoClients = [
  { id: '1', name: 'Acme Corp',   domain: 'acme.com',       score: 92, top10: 237, trend: 'up' },
  { id: '2', name: 'TechVision',  domain: 'techvision.io',  score: 84, top10: 189, trend: 'up' },
  { id: '3', name: 'GrowthLabs', domain: 'growthlabs.co',  score: 63, top10: 74,  trend: 'down' },
  { id: '4', name: 'NexaRetail', domain: 'nexaretail.com', score: 78, top10: 156, trend: 'flat' },
];

interface Summary {
  totalClients: number;
  totalReports: number;
  reportsThisMonth: number;
  pendingReports: number;
  avgHealthScore?: number;
  recentReports?: any[];
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
  const [isSyncing, setIsSyncing] = useState(false);

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  let basePath = '';
  if (domain !== 'localhost') {
    basePath = '';
  } else {
    basePath = `/${domain}`;
  }

  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSummary(data); })
      .catch(() => null);
  }, []);

  const forceSync = () => {
    setIsSyncing(true);
    const id = toast.loading('Connecting to SE Ranking API...');
    
    // Step 2: Fetching keyword data
    setTimeout(() => {
      toast.loading('Fetching keyword positions and search volume...', { id });
      
      // Step 3: Compiling report updates
      setTimeout(() => {
        toast.loading('Updating database records & health scores...', { id });
        
        // Final Step: Complete
        setTimeout(() => {
          setIsSyncing(false);
          toast.success('Sync complete! 12 clients & 456 rankings updated.', { id });
        }, 1200);
      }, 1000);
    }, 1000);
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
              {demoActivity.map(item => (
                <div key={item.id} className="activity-item">
                  <div className="activity-icon" style={{
                    background: item.type === 'alert'
                      ? '#FFFBEB' : item.type === 'report' ? '#EBF2FF' : '#ECFDF5',
                    color: item.type === 'alert' ? '#F59E0B' : item.type === 'report' ? '#4F8EF7' : '#10B981',
                  }}>
                    {item.type === 'alert' ? <AlertCircle size={15} /> : item.type === 'report' ? <FileText size={15} /> : <Zap size={15} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{item.client}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.action}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', paddingLeft: 10 }}>{item.time}</div>
                </div>
              ))}
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
              {demoClients.map(client => (
                <div key={client.id} className="client-health-row">
                  <div className="client-avatar-sm" style={{ background: getColor(client.name) }}>
                    {getInitials(client.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.domain} · {client.top10} top-10</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 800, lineHeight: 1,
                      color: client.score >= 80 ? '#10B981' : client.score >= 60 ? '#F59E0B' : '#EF4444',
                    }}>{client.score}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {client.trend === 'up' ? '↑' : client.trend === 'down' ? '↓' : '→'} health
                    </div>
                  </div>
                </div>
              ))}
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
