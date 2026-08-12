'use client';

import { toast } from 'sonner';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { getClientPortalData, updateUserAccount, logSupportMessage } from '@/app/actions';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ClientDashboardPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  const basePath = domain === 'localhost' ? '/localhost' : `/${domain}`;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'support' | 'settings'>('overview');

  // Chart view metric control
  const [chartMetric, setChartMetric] = useState<'sessions' | 'keywords' | 'health' | 'backlinks'>('sessions');

  // User account modal/form state
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingAccount, setUpdatingAccount] = useState(false);

  // Contact support state
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportLogs, setSupportLogs] = useState<any[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    getClientPortalData(domain)
      .then(d => {
        setData(d);
        if (d?.client) {
          setAccountName(d.client.contactName || '');
          setAccountEmail(d.client.contactEmail || '');
        }
        if (d?.supportLogs) {
          setSupportLogs(d.supportLogs);
        }
        setLoading(false);
      })
      .catch(e => {
        toast.error('Failed to load dashboard data');
        setLoading(false);
      });
  }, [domain]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>⏳</div>
          <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-secondary)' }}>Loading your premium SEO portal...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>❌</div>
          <div style={{ fontWeight: 600, fontSize: '15px' }}>Could not load data for this portal.</div>
        </div>
      </div>
    );
  }

  const { client, snapshots, reports } = data;
  const agencyName = client.agency?.name || 'Your Agency';

  const kwSnaps = [...(snapshots.keywords || [])].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const anSnaps = [...(snapshots.analytics || [])].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const auSnaps = [...(snapshots.audit || [])].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const blSnaps = [...(snapshots.backlinks || [])].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Metrics extract
  const latestKw = kwSnaps[kwSnaps.length - 1] || { top3: 0, top10: 0, top100: 0, totalKeywords: 0 };
  const prevKw = kwSnaps[kwSnaps.length - 2] || { top3: 0, top10: 0, top100: 0, totalKeywords: 0 };
  const kwChange = latestKw.top10 - prevKw.top10;

  const latestAn = anSnaps[anSnaps.length - 1] || { sessions: 0, users: 0, pageviews: 0 };
  const prevAn = anSnaps[anSnaps.length - 2];
  const sessionChange = prevAn ? (((latestAn.sessions - prevAn.sessions) / prevAn.sessions) * 100).toFixed(1) : 0;

  const latestAu = auSnaps[auSnaps.length - 1] || { healthScore: 0, criticalIssues: 0, warnings: 0, notices: 0 };
  const prevAu = auSnaps[auSnaps.length - 2] || { healthScore: 0 };
  const healthChange = latestAu.healthScore - prevAu.healthScore;

  const latestBl = blSnaps[blSnaps.length - 1] || { totalBacklinks: 0, referringDomains: 0, newBacklinks: 0, lostBacklinks: 0, domainTrust: 0 };
  const prevBl = blSnaps[blSnaps.length - 2] || { totalBacklinks: 0 };
  const backlinksChange = latestBl.totalBacklinks - prevBl.totalBacklinks;

  // Chart datasets mapping
  const getTrafficChartData = () => {
    return anSnaps.map((s: any) => ({
      name: MONTHS[new Date(s.date).getMonth()],
      Sessions: s.sessions,
      Users: s.users,
      Pageviews: s.pageviews,
    }));
  };

  const getKeywordChartData = () => {
    return kwSnaps.map((s: any) => ({
      name: MONTHS[new Date(s.date).getMonth()],
      'Top 3': s.top3,
      'Top 10': s.top10,
      'Top 100': s.top100,
      Total: s.totalKeywords,
    }));
  };

  const getHealthChartData = () => {
    return auSnaps.map((s: any) => ({
      name: MONTHS[new Date(s.date).getMonth()],
      'Health Score': s.healthScore,
    }));
  };

  const getBacklinksChartData = () => {
    return blSnaps.map((s: any) => ({
      name: MONTHS[new Date(s.date).getMonth()],
      'Total Backlinks': s.totalBacklinks,
      'Referring Domains': s.referringDomains,
    }));
  };

  const getCompetitors = () => {
    const web = client.domain.toLowerCase();
    if (web.includes('zomato')) {
      return [
        { name: 'Swiggy', domain: 'swiggy.com', top10: 24, health: '82%', backlinks: '142K' },
        { name: 'EatSure', domain: 'eatsure.com', top10: 15, health: '74%', backlinks: '48K' }
      ];
    }
    if (web.includes('swiggy')) {
      return [
        { name: 'Zomato', domain: 'zomato.com', top10: 31, health: '85%', backlinks: '190K' },
        { name: 'Foodpanda', domain: 'foodpanda.in', top10: 8, health: '65%', backlinks: '12K' }
      ];
    }
    return [
      { name: 'Competitor A', domain: 'competitora.com', top10: 18, health: '79%', backlinks: '85K' },
      { name: 'Competitor B', domain: 'competitorb.com', top10: 11, health: '71%', backlinks: '34K' }
    ];
  };

  const competitors = getCompetitors();

  const downloadPdf = async (reportId: string) => {
    const toastId = toast.loading('Generating PDF... This may take 5-10 seconds.');
    try {
      const res = await fetch(`/api/reports/generate?id=${reportId}`);
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `SEO-Report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF. Please try again.', { id: toastId });
    }
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage) return;
    setSendingSupport(true);
    const t = toast.loading('Sending message...');
    try {
      await logSupportMessage(domain, client.id, supportMessage);
      toast.success('Message sent successfully! The agency team has been notified.', { id: t });
      
      const newLog = {
        id: Math.random().toString(),
        createdAt: new Date().toISOString(),
        action: `Client (${client.name}) Support Request: "${supportMessage}"`
      };
      setSupportLogs(prev => [newLog, ...prev]);
      setSupportMessage('');
      setIsSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message', { id: t });
    } finally {
      setSendingSupport(false);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    setUpdatingAccount(true);
    try {
      await updateUserAccount({
        name: accountName,
        email: accountEmail,
        oldPassword: oldPassword || undefined,
        newPassword: newPassword || undefined
      });
      toast.success("Account settings updated successfully!");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setData((prev: any) => ({
        ...prev,
        client: {
          ...prev.client,
          contactName: accountName,
          contactEmail: accountEmail
        }
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to update account settings.");
    } finally {
      setUpdatingAccount(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Dynamic left sidebar layout */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📈</div>
          <div>
            <div className="sidebar-logo-text" style={{ textTransform: 'uppercase' }}>{agencyName}</div>
            <div className="sidebar-logo-sub">Client Hub</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
            style={{ width: '100%', border: 'none', background: 'none' }}
          >
            <span className="sidebar-item-icon">📊</span>
            <span className="sidebar-item-label">Dashboard Overview</span>
          </button>

          <button 
            onClick={() => setActiveTab('reports')} 
            className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`}
            style={{ width: '100%', border: 'none', background: 'none' }}
          >
            <span className="sidebar-item-icon">📋</span>
            <span className="sidebar-item-label">SEO Reports</span>
            {reports.length > 0 && <span className="sidebar-badge">{reports.length}</span>}
          </button>

          <button 
            onClick={() => setActiveTab('support')} 
            className={`sidebar-item ${activeTab === 'support' ? 'active' : ''}`}
            style={{ width: '100%', border: 'none', background: 'none' }}
          >
            <span className="sidebar-item-icon">💬</span>
            <span className="sidebar-item-label">Support Tickets</span>
            {supportLogs.length > 0 && <span className="sidebar-badge">{supportLogs.length}</span>}
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
            style={{ width: '100%', border: 'none', background: 'none' }}
          >
            <span className="sidebar-item-icon">👤</span>
            <span className="sidebar-item-label">My Account</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-wrap">
            <div id="sidebarUserChip">
              <div className="sidebar-avatar">
                {client.contactName ? client.contactName.substring(0, 2).toUpperCase() : 'ME'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {client.contactName || client.name}
                </div>
                <div className="sidebar-user-role" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {client.domain}
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                toast.success('Signed out successfully!');
                window.location.href = `${basePath}/c/login`;
              }} 
              className="sidebar-item danger" 
              style={{ width: '100%', marginTop: '8px', border: 'none', background: 'none' }}
            >
              <span className="sidebar-item-icon">🚪</span>
              <span className="sidebar-item-label">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        {/* Dynamic premium Topbar */}
        <div className="topbar">
          <div className="topbar-title">
            {activeTab === 'overview' && '📊 Portal Overview'}
            {activeTab === 'reports' && '📋 Your SEO Reports'}
            {activeTab === 'support' && '💬 Support & Messages'}
            {activeTab === 'settings' && '👤 Account Profile'}
            <span className="topbar-subtitle">{client.name} · {client.domain}</span>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('support')}>
              📧 Contact Support
            </button>
          </div>
        </div>

        {/* Dynamic Page content area */}
        <div className="page-content" style={{ padding: '32px 40px', maxWidth: '1200px' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* Premium Header message */}
              <div className="hero-banner" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)', marginBottom: '32px' }}>
                <div className="hero-title">Welcome back, {client.contactName || 'Valued Client'}! 👋</div>
                <p style={{ opacity: 0.9, fontSize: '13px' }}>Here is the latest snapshot of your website search performance managed by {agencyName}. Metrics auto-sync monthly.</p>
              </div>

              {/* Redesigned metrics scorecard grid */}
              <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '32px' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Keywords Position</div>
                    <span style={{ fontSize: '16px' }}>🔑</span>
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{latestKw.top10} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>in Top 10</span></div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', marginTop: '8px', color: 'var(--text-muted)' }}>
                    <span>⭐ Top 3: <strong style={{ color: 'var(--success)' }}>{latestKw.top3}</strong></span>
                    <span>📈 Top 100: <strong>{latestKw.top100}</strong></span>
                  </div>
                  <div style={{ fontSize: '10px', color: kwChange >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '8px', fontWeight: 700 }}>
                    {kwChange >= 0 ? '▲ +' : '▼ '}{kwChange} top 10 keywords this month
                  </div>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Organic Sessions</div>
                    <span style={{ fontSize: '16px' }}>🕸️</span>
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{latestAn.sessions.toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', marginTop: '8px', color: 'var(--text-muted)' }}>
                    <span>👥 Users: <strong>{latestAn.users.toLocaleString()}</strong></span>
                    <span>📄 Views: <strong>{latestAn.pageviews.toLocaleString()}</strong></span>
                  </div>
                  <div style={{ fontSize: '10px', color: Number(sessionChange) >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '8px', fontWeight: 700 }}>
                    {Number(sessionChange) >= 0 ? '▲ +' : '▼ '}{sessionChange}% traffic difference
                  </div>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Technical Site Health</div>
                    <span style={{ fontSize: '16px' }}>🛡️</span>
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{latestAu.healthScore}%</div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', marginTop: '8px', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--danger)' }}>🚨 {latestAu.criticalIssues} critical</span>
                    <span>⚠️ {latestAu.warnings || 0} warn</span>
                  </div>
                  <div style={{ fontSize: '10px', color: healthChange >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '8px', fontWeight: 700 }}>
                    {healthChange >= 0 ? '▲ +' : '▼ '}{healthChange} health points change
                  </div>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Backlink Profile</div>
                    <span style={{ fontSize: '16px' }}>🔗</span>
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{latestBl.totalBacklinks.toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', marginTop: '8px', color: 'var(--text-muted)' }}>
                    <span>🏢 Referring: <strong>{latestBl.referringDomains.toLocaleString()}</strong></span>
                    <span>👑 Trust Score: <strong>{latestBl.domainTrust}/100</strong></span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--success)', marginTop: '8px', fontWeight: 700 }}>
                    ▲ +{latestBl.newBacklinks || 0} new acquired links
                  </div>
                </div>
              </div>

              {/* Redesigned interactive visual chart with toggle controller */}
              <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 className="card-title">📈 Search Growth Timeline</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Toggle parameters to analyze historical trends.</p>
                  </div>
                  
                  {/* Metric Switch Toggles */}
                  <div className="pill-filters" style={{ margin: 0 }}>
                    <button onClick={() => setChartMetric('sessions')} className={`pill ${chartMetric === 'sessions' ? 'active' : ''}`}>
                      🕸️ Traffic
                    </button>
                    <button onClick={() => setChartMetric('keywords')} className={`pill ${chartMetric === 'keywords' ? 'active' : ''}`}>
                      🔑 Keywords
                    </button>
                    <button onClick={() => setChartMetric('health')} className={`pill ${chartMetric === 'health' ? 'active' : ''}`}>
                      🛡️ Audit Health
                    </button>
                    <button onClick={() => setChartMetric('backlinks')} className={`pill ${chartMetric === 'backlinks' ? 'active' : ''}`}>
                      🔗 Backlinks
                    </button>
                  </div>
                </div>

                <div style={{ height: '300px', width: '100%' }}>
                  {chartMetric === 'sessions' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getTrafficChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--info)" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="var(--info)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                        <Tooltip contentStyle={{ background: 'var(--gray-100)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="Sessions" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSessions)" />
                        <Area type="monotone" dataKey="Users" stroke="var(--info)" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {chartMetric === 'keywords' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getKeywordChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                        <Tooltip contentStyle={{ background: 'var(--gray-100)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line type="monotone" dataKey="Top 3" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Top 10" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Top 100" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {chartMetric === 'health' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getHealthChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                        <Tooltip contentStyle={{ background: 'var(--gray-100)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="Health Score" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHealth)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {chartMetric === 'backlinks' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getBacklinksChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                        <Tooltip contentStyle={{ background: 'var(--gray-100)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line type="monotone" dataKey="Total Backlinks" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Referring Domains" stroke="var(--info)" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Competitor Analysis Card */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 className="card-title">🥊 Competitor Domain Analysis</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Sync: Live API</span>
                </div>
                <div className="table-wrapper" style={{ margin: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px 16px' }}>DOMAIN</th>
                        <th style={{ padding: '12px 16px' }}>TOP 10 KEYWORDS</th>
                        <th style={{ padding: '12px 16px' }}>HEALTH SCORE</th>
                        <th style={{ padding: '12px 16px' }}>BACKLINKS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--primary-light)' }}>
                        <td style={{ padding: '12px 16px' }}><strong>{client.domain} (You)</strong></td>
                        <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 700 }}>{latestKw.top10}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>{latestAu.healthScore}%</td>
                        <td style={{ padding: '12px 16px' }}>{latestBl.totalBacklinks.toLocaleString()}</td>
                      </tr>
                      {competitors.map(c => (
                        <tr key={c.domain} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{c.domain} ({c.name})</td>
                          <td style={{ padding: '12px 16px' }}>{c.top10}</td>
                          <td style={{ padding: '12px 16px' }}>{c.health}</td>
                          <td style={{ padding: '12px 16px' }}>{c.backlinks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REPORTS LIST */}
          {activeTab === 'reports' && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="card-title">📋 SEO Reports Inventory</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Download generated PDFs or view detailed interactive snapshots.</p>
              </div>

              <div className="table-wrapper" style={{ margin: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '14px 20px' }}>REPORT TITLE</th>
                      <th style={{ padding: '14px 20px' }}>STATUS</th>
                      <th style={{ padding: '14px 20px' }}>CREATION DATE</th>
                      <th style={{ padding: '14px 20px' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report: any) => (
                      <tr key={report.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 20px' }}><strong>{report.title}</strong></td>
                        <td style={{ padding: '14px 20px' }}>
                          {report.status === 'generated' ? (
                            <span className="badge badge-success">✅ Ready</span>
                          ) : (
                            <span className="badge badge-secondary">⏳ Processing</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 20px' }} suppressHydrationWarning>{new Date(report.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href={`${basePath}/r/${report.id}`} target="_blank" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>👁️ View</Link>
                            <button className="btn btn-secondary btn-sm" onClick={() => downloadPdf(report.id)}>📥 Download PDF</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          No generated reports found for your account.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SUPPORT TICKETS */}
          {activeTab === 'support' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px' }}>
              {/* Message history */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 className="card-title" style={{ marginBottom: '18px' }}>💬 Support Correspondence Logs</h3>
                
                <div className="table-wrapper" style={{ margin: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px 16px' }}>DATE</th>
                        <th style={{ padding: '12px 16px' }}>MESSAGE SENT</th>
                        <th style={{ padding: '12px 16px' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportLogs.map((log: any) => {
                        const parts = log.action.split('Support Request: "');
                        let msg = parts[1]?.split('" | Response: "')[0] || log.action;
                        if (msg.endsWith('"')) msg = msg.slice(0, -1);
                        
                        let reply = parts[1]?.split('" | Response: "')[1]?.split('" [RESOLVED]')[0] || null;
                        
                        const isResolved = log.action.includes('[RESOLVED]');

                        return (
                          <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }} suppressHydrationWarning>{new Date(log.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                              <div>{msg}</div>
                              {reply && (
                                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--primary)', padding: '6px 12px', background: 'var(--primary-light)', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                                  💬 <strong>{agencyName} Reply:</strong> {`"${reply}"`}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {isResolved ? (
                                <span className="badge badge-success">✅ Resolved</span>
                              ) : (
                                <span className="badge badge-secondary">⏳ Sent</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {supportLogs.length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                            No message records found. Ask a question on the right.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit a new message */}
              <div className="card" style={{ padding: '24px', height: 'fit-content', textAlign: 'center' }}>
                {isSubmitted ? (
                  <div style={{ padding: '12px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                    <h3 className="card-title" style={{ marginBottom: '8px', justifyContent: 'center' }}>Inquiry Transmitted!</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                      Your message has been successfully logged. The agency support team has been notified and will respond shortly.
                    </p>
                    <button className="btn btn-secondary btn-full" onClick={() => setIsSubmitted(false)}>
                      Submit Another Ticket
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="card-title" style={{ marginBottom: '12px', textAlign: 'left' }}>✉️ Submit Inquiry</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5, textAlign: 'left' }}>
                      Have questions about custom SEO campaigns, keyword additions, or reports? Send a message directly to the {agencyName} management team.
                    </p>

                    <form onSubmit={handleSendSupport}>
                      <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label">Detailed Message</label>
                        <textarea
                          className="form-input"
                          value={supportMessage}
                          onChange={e => setSupportMessage(e.target.value)}
                          required
                          placeholder="Write your request details here..."
                          style={{ height: '140px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary btn-full" disabled={sendingSupport}>
                        {sendingSupport ? 'Sending Inquiry...' : '🚀 Send Ticket'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="card" style={{ padding: '32px', maxWidth: '600px' }}>
              <h3 className="card-title" style={{ marginBottom: '6px' }}>👤 User Account settings</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>Modify your profile details or change credentials.</p>

              <form onSubmit={handleUpdateAccount}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    value={accountEmail}
                    onChange={e => setAccountEmail(e.target.value)}
                    required
                  />
                </div>

                <div style={{ margin: '28px 0 16px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>🔄 Change Portal Password</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Leave password fields blank if you do not want to alter them.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    className="form-input"
                    type="password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-row" style={{ marginBottom: '24px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">New Password</label>
                    <input
                      className="form-input"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Confirm New Password</label>
                    <input
                      className="form-input"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={updatingAccount}>
                  {updatingAccount ? 'Saving Account...' : '✓ Save Changes'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
