import './dashboard.css';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <>
      
<div className="app-layout">

  {/* SIDEBAR */}
  <aside className="sidebar">
    <div className="sidebar-logo">
      <div className="sidebar-logo-icon">RF</div>
      <div><div className="sidebar-logo-text">RankFlow</div><div className="sidebar-logo-sub">Digital Horizons</div></div>
    </div>
    <nav className="sidebar-nav">
      <a href="dashboard.html" className="sidebar-item active"><span className="sidebar-item-icon">📊</span><span className="sidebar-item-label">Dashboard</span></a>
      <a href="clients.html" className="sidebar-item"><span className="sidebar-item-icon">👥</span><span className="sidebar-item-label">Clients</span><span className="sidebar-badge">24</span></a>
      <a href="reports.html" className="sidebar-item"><span className="sidebar-item-icon">📄</span><span className="sidebar-item-label">Reports</span><span className="sidebar-badge">38</span></a>
      <div className="sidebar-section-label">Configuration</div>
      <a href="settings.html" className="sidebar-item"><span className="sidebar-item-icon">⚙️</span><span className="sidebar-item-label">Settings</span></a>
      <a href="help.html" className="sidebar-item"><span className="sidebar-item-icon">❓</span><span className="sidebar-item-label">Help &amp; Support</span></a>
    </nav>
        <div className="sidebar-footer">
      <div className="sidebar-user-wrap">
        {/* User menu popup */}
        <div id="userMenu">
          <div className="user-menu-header">
            <div className="user-menu-name">John Doe</div>
            <div className="user-menu-email">john@digitalhorizons.com</div>
          </div>
          <button className="user-menu-item" onClick="window.location.href='settings.html'">⚙️ Account Settings</button>
          <button className="user-menu-item" onClick="Toast.info('Opening billing...');window.location.href='settings.html'">💳 Billing &amp; Plan</button>
          <button className="user-menu-item" onClick="window.location.href='help.html'">❓ Help &amp; Support</button>
          <div className="user-menu-divider"></div>
          <button className="user-menu-item danger" onClick="Logout.confirm()">🚪 Sign Out</button>
        </div>
        {/* Clickable chip */}
        <div id="sidebarUserChip">
          <div className="sidebar-avatar">JD</div>
          <div>
            <div className="sidebar-user-name">John Doe</div>
            <div className="sidebar-user-role">Agency Admin</div>
          </div>
          <span className="chevron">▲</span>
        </div>
      </div>
    </div>
  </aside>

  <div className="main-content">
    {/* TOPBAR */}
    <header className="topbar">
      <div style={{flex: '1'}}>
        <div className="topbar-title">Dashboard</div>
      </div>
      <div className="topbar-actions">
        <button className="date-range-btn" onClick="Toast.info('Date picker opened')">
          📅 Jun 2026 vs May 2026 ▾
        </button>
        <button className="btn btn-secondary btn-sm" onClick="Toast.info('Syncing all clients...')">🔄 Sync All</button>
        <button className="btn btn-primary btn-sm" onClick="Modal.open('generateReportModal')">＋ Generate Report</button>
        <div className="relative">
          <button className="topbar-icon-btn" data-notif-toggle="notifDropdown">🔔
            <span className="notif-dot"></span>
          </button>
          <div className="notif-dropdown" id="notifDropdown">
            <div className="notif-header">
              <div style={{fontSize: '14px', fontWeight: '800'}}>Notifications</div>
              <button className="btn btn-ghost btn-sm" data-mark-read>Mark all read</button>
            </div>
            <div className="notif-item unread">
              <div className="notif-avatar">✅</div>
              <div style={{flex: '1'}}><div className="notif-text"><strong>Acme Corp</strong> report generated successfully</div><div className="notif-time">2 min ago</div></div>
              <div className="notif-unread-dot"></div>
            </div>
            <div className="notif-item unread">
              <div className="notif-avatar">📈</div>
              <div style={{flex: '1'}}><div className="notif-text"><strong>TechStart.io</strong> — 3 new keywords entered Top 10</div><div className="notif-time">45 min ago</div></div>
              <div className="notif-unread-dot"></div>
            </div>
            <div className="notif-item unread">
              <div className="notif-avatar">❌</div>
              <div style={{flex: '1'}}><div className="notif-text"><strong>BlueSky Marketing</strong> — Report failed (API 429)</div><div className="notif-time">1 hour ago</div></div>
              <div className="notif-unread-dot"></div>
            </div>
            <div className="notif-item">
              <div className="notif-avatar">🔄</div>
              <div style={{flex: '1'}}><div className="notif-text"><strong>Daily sync complete</strong> — 24 clients updated</div><div className="notif-time">3 hours ago</div></div>
            </div>
            <div className="notif-item">
              <div className="notif-avatar">⚠️</div>
              <div style={{flex: '1'}}><div className="notif-text"><strong>SERanking API key</strong> expires in 14 days</div><div className="notif-time">Yesterday</div></div>
            </div>
            <div style={{padding: '10px 16px', textAlign: 'center', borderTop: '1px solid var(--border)'}}>
              <a href="#" style={{fontSize: '12px', fontWeight: '600'}}>View all notifications →</a>
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Sync status bar */}
    <div className="sync-bar">
      <span>✅ Data sync complete · Jun 23, 2026 at 02:14 AM · All 24 clients updated</span>
      <div style={{display: 'flex', gap: '8px'}}>
        <span style={{fontSize: '11px', color: '#065F46'}}>Next sync: Jun 24 at 02:00 AM</span>
        <button className="btn btn-sm" style={{background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px'}} onClick="Toast.info('Manual sync queued...')">🔄 Force Sync</button>
      </div>
    </div>

    <div className="page-content">

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
          <button className="btn btn-warning btn-sm" style={{background: '#F59E0B', color: 'white', border: 'none'}} onClick="window.location.href='settings.html'">🔑 Connect Now →</button>
          <button className="btn btn-ghost btn-sm" onClick="this.closest('.gsc-setup-banner').style.display='none'">Dismiss</button>
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
          <button className="hero-btn hero-btn-solid" onClick="Modal.open('generateReportModal')">📄 Generate Report</button>
          <button className="hero-btn hero-btn-white" onClick="window.location.href='clients.html'">👥 View All Clients</button>
          <button className="hero-btn hero-btn-white" onClick="window.location.href='settings.html'">🔑 Manage API Keys</button>
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
          <div style={{height: '200px'}}><canvas id="agencyTrafficChart"></canvas></div>
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
          <div style={{height: '200px'}}><canvas id="kwGrowthChart"></canvas></div>
          <div style={{display: 'flex', gap: '16px', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)'}}>
            <div><span style={{color: 'var(--text-primary)', fontWeight: '700'}}>+34</span> new top-10 kws this month</div>
            <div><span style={{color: 'var(--success)', fontWeight: '700'}}>623</span> total top-10 rankings</div>
          </div>
        </div>
      </div>

      {/* Reports + Clients Row */}
      <div className="grid-2" style={{marginBottom: '24px'}}>

        {/* Reports Status */}
        <div className="chart-card" style={{marginBottom: '0'}}>
          <div className="chart-header">
            <div><div className="chart-title">Reports This Month</div><div className="chart-subtitle">18 generated · 6 pending</div></div>
            <a href="reports.html" className="btn btn-ghost btn-sm">View all →</a>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px'}}>
            <div style={{width: '100px', height: '100px', flexShrink: '0', position: 'relative'}}>
              <canvas id="reportStatusChart"></canvas>
              <div style={{position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{fontSize: '20px', fontWeight: '800'}}>18</div>
                <div style={{fontSize: '9px', color: 'var(--text-muted)'}}>DONE</div>
              </div>
            </div>
            <div style={{flex: '1', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><div style={{width: '8px', height: '8px', background: 'var(--success)', borderRadius: '2px'}}></div>Completed</div>
                <strong>18</strong>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><div style={{width: '8px', height: '8px', background: 'var(--warning)', borderRadius: '2px'}}></div>Pending</div>
                <strong>6</strong>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><div style={{width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '2px'}}></div>Failed</div>
                <strong>1</strong>
              </div>
            </div>
          </div>
          {/* Overdue clients */}
          <div style={{background: 'var(--warning-light)', border: '1px solid #FDE68A', borderRadius: '8px', padding: '10px 12px'}}>
            <div style={{fontSize: '11px', fontWeight: '700', color: '#92400E', marginBottom: '6px'}}>⚠ Overdue Reports (need action)</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px'}}>
                <span style={{color: '#92400E'}}>GreenLeaf Organics</span>
                <button className="btn btn-sm" style={{background: '#F59E0B', color: 'white', border: 'none', padding: '3px 10px', fontSize: '11px'}} onClick="Toast.success('Generating for GreenLeaf...')">Generate Now</button>
              </div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px'}}>
                <span style={{color: '#92400E'}}>RetailPro Ltd</span>
                <button className="btn btn-sm" style={{background: '#F59E0B', color: 'white', border: 'none', padding: '3px 10px', fontSize: '11px'}} onClick="Toast.success('Generating for RetailPro...')">Generate Now</button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="chart-card" style={{marginBottom: '0'}}>
          <div className="chart-header">
            <div><div className="chart-title">Recent Activity</div><div className="chart-subtitle">Latest events across all clients</div></div>
          </div>
          <div>
            <div className="activity-item">
              <div className="activity-icon" style={{background: '#ECFDF5'}}>✅</div>
              <div style={{flex: '1'}}>
                <div style={{fontSize: '13px'}}><strong>Acme Corp</strong> report generated</div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>Monthly SEO report sent to sarah@acmecorp.com</div>
              </div>
              <div style={{fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap'}}>2 min</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{background: '#EEF2FF'}}>📈</div>
              <div style={{flex: '1'}}>
                <div style={{fontSize: '13px'}}><strong>TechStart.io</strong> — 3 keywords entered Top 10</div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>"saas startup tools", "mvp software", "tech agency uk"</div>
              </div>
              <div style={{fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap'}}>45 min</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{background: '#FEF2F2'}}>❌</div>
              <div style={{flex: '1'}}>
                <div style={{fontSize: '13px'}}><strong>BlueSky Marketing</strong> report failed</div>
                <div style={{fontSize: '11px', color: 'var(--danger)'}}>SERanking API 429 — <a href="reports.html" style={{color: 'var(--danger)'}}>View error →</a></div>
              </div>
              <div style={{fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap'}}>1 hr</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{background: '#EEF2FF'}}>🔄</div>
              <div style={{flex: '1'}}>
                <div style={{fontSize: '13px'}}><strong>Daily sync complete</strong> — All 24 clients</div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>Positions, backlinks, and health scores updated</div>
              </div>
              <div style={{fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap'}}>3 hr</div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{background: '#ECFDF5'}}>👤</div>
              <div style={{flex: '1'}}>
                <div style={{fontSize: '13px'}}><strong>New client added</strong> — RetailPro Ltd</div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>retailpro.co.uk · Added by sarah@digitalhorizons.com</div>
              </div>
              <div style={{fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap'}}>Yesterday</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Clients Health Table */}
      <div className="table-wrapper">
        <div className="table-header">
          <div><div className="table-title">Top Clients — Health Overview</div><div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Sorted by health score</div></div>
          <div className="table-actions">
            <button className="btn btn-secondary btn-sm" onClick="window.location.href='clients.html'">View All 24 →</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Health Score</th>
              <th>Top 10 KWs</th>
              <th>Sessions (Jun)</th>
              <th>Backlinks</th>
              <th>Report Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr onClick="window.location.href='client-detail.html'" style={{cursor: 'pointer'}}>
              <td>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <div className="client-avatar-sm" style={{background: 'linear-gradient(135deg,#4F46E5,#7C3AED)'}}>AC</div>
                  <div><div style={{fontWeight: '700'}}>Acme Corp</div><div style={{fontSize: '11px', color: 'var(--text-muted)'}}>acmecorp.com</div></div>
                </div>
              </td>
              <td>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div className="progress-bar" style={{width: '70px', margin: '0'}}><div className="progress-fill success" style={{width: '76%'}}></div></div>
                  <strong style={{color: 'var(--success)'}}>76</strong>
                </div>
              </td>
              <td><strong>47</strong> <span style={{fontSize: '11px', color: 'var(--success)'}}>↑+4</span></td>
              <td>8,420 <span style={{fontSize: '11px', color: 'var(--success)'}}>↑+16%</span></td>
              <td>1,847</td>
              <td><span className="badge badge-success">✅ Done</span></td>
              <td><a href="client-detail.html" className="btn btn-ghost btn-sm">View →</a></td>
            </tr>
            <tr>
              <td>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <div className="client-avatar-sm" style={{background: 'linear-gradient(135deg,#10B981,#059669)'}}>TS</div>
                  <div><div style={{fontWeight: '700'}}>TechStart.io</div><div style={{fontSize: '11px', color: 'var(--text-muted)'}}>techstart.io</div></div>
                </div>
              </td>
              <td>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div className="progress-bar" style={{width: '70px', margin: '0'}}><div className="progress-fill success" style={{width: '89%'}}></div></div>
                  <strong style={{color: 'var(--success)'}}>89</strong>
                </div>
              </td>
              <td><strong>87</strong> <span style={{fontSize: '11px', color: 'var(--success)'}}>↑+11</span></td>
              <td>12,340 <span style={{fontSize: '11px', color: 'var(--success)'}}>↑+21%</span></td>
              <td>3,241</td>
              <td><span className="badge badge-success">✅ Done</span></td>
              <td><button className="btn btn-ghost btn-sm" onClick="Toast.info('Opening TechStart...')">View →</button></td>
            </tr>
            <tr>
              <td>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <div className="client-avatar-sm" style={{background: 'linear-gradient(135deg,#F59E0B,#D97706)'}}>GL</div>
                  <div><div style={{fontWeight: '700'}}>GreenLeaf Organics</div><div style={{fontSize: '11px', color: 'var(--text-muted)'}}>greenleaf.com</div></div>
                </div>
              </td>
              <td>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div className="progress-bar" style={{width: '70px', margin: '0'}}><div className="progress-fill warning" style={{width: '64%'}}></div></div>
                  <strong style={{color: 'var(--warning)'}}>64</strong>
                </div>
              </td>
              <td><strong>31</strong> <span style={{fontSize: '11px', color: 'var(--danger)'}}>↓-2</span></td>
              <td>4,120 <span style={{fontSize: '11px', color: 'var(--danger)'}}>↓-3%</span></td>
              <td>842</td>
              <td><span className="badge badge-warning">⏳ Pending</span></td>
              <td><button className="btn btn-ghost btn-sm" onClick="Toast.info('Opening GreenLeaf...')">View →</button></td>
            </tr>
            <tr>
              <td>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <div className="client-avatar-sm" style={{background: 'linear-gradient(135deg,#3B82F6,#2563EB)'}}>BS</div>
                  <div><div style={{fontWeight: '700'}}>BlueSky Marketing</div><div style={{fontSize: '11px', color: 'var(--text-muted)'}}>bluesky.co.uk</div></div>
                </div>
              </td>
              <td>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div className="progress-bar" style={{width: '70px', margin: '0'}}><div className="progress-fill danger" style={{width: '48%'}}></div></div>
                  <strong style={{color: 'var(--danger)'}}>48</strong>
                </div>
              </td>
              <td><strong>22</strong> <span style={{fontSize: '11px', color: 'var(--danger)'}}>↓-4</span></td>
              <td>3,280 <span style={{fontSize: '11px', color: 'var(--danger)'}}>↓-8%</span></td>
              <td>541</td>
              <td><span className="badge badge-danger">❌ Failed</span></td>
              <td><button className="btn btn-ghost btn-sm" onClick="Toast.info('Opening BlueSky...')">View →</button></td>
            </tr>
          </tbody>
        </table>
        <div className="table-footer">
          <span>Showing top 4 of 24 clients by health score</span>
          <a href="clients.html" style={{fontSize: '12px', fontWeight: '600'}}>View all clients →</a>
        </div>
      </div>

    </div>{/* /page-content */}
  </div>{/* /main-content */}
</div>{/* /app-layout */}

{/* Generate Report Modal */}
<div className="modal-overlay" id="generateReportModal">
  <div className="modal">
    <div className="modal-header">
      <div><div className="modal-title">Generate Report</div><div className="modal-subtitle">Create a branded SEO report for a client</div></div>
      <button className="modal-close" data-modal-close="generateReportModal">✕</button>
    </div>
    <div className="modal-body">
      <div className="form-group">
        <label className="form-label">Client <span className="required">*</span></label>
        <select className="form-input" id="dashGenClient">
          <option value="">Select client...</option>
          <option>Acme Corp</option><option>TechStart.io</option>
          <option>GreenLeaf Organics</option><option>BlueSky Marketing</option>
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Period</label>
          <select className="form-input"><option>June 2026 (current)</option><option>May 2026</option></select>
        </div>
        <div className="form-group">
          <label className="form-label">Delivery</label>
          <select className="form-input"><option>Email + Portal</option><option>Draft only</option></select>
        </div>
      </div>
    </div>
    <div className="modal-footer">
      <button className="btn btn-secondary" data-modal-close="generateReportModal">Cancel</button>
      <button className="btn btn-primary" onClick="dashGenReport()">🚀 Generate</button>
    </div>
  </div>
</div>

<div className="toast-container" id="toastContainer"></div>
<script src="js/app.js"></script>


    </>
  );
}