import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">RF</div>
        <div>
          <div className="sidebar-logo-text">RankFlow</div>
          <div className="sidebar-logo-sub">Digital Horizons</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <Link href="/dashboard" className="sidebar-item active">
          <span className="sidebar-item-icon">📊</span>
          <span className="sidebar-item-label">Dashboard</span>
        </Link>
        <Link href="/clients" className="sidebar-item">
          <span className="sidebar-item-icon">👥</span>
          <span className="sidebar-item-label">Clients</span>
          <span className="sidebar-badge">24</span>
        </Link>
        <Link href="/reports" className="sidebar-item">
          <span className="sidebar-item-icon">📄</span>
          <span className="sidebar-item-label">Reports</span>
          <span className="sidebar-badge">38</span>
        </Link>
        <div className="sidebar-section-label">Configuration</div>
        <Link href="/settings" className="sidebar-item">
          <span className="sidebar-item-icon">⚙️</span>
          <span className="sidebar-item-label">Settings</span>
        </Link>
        <Link href="/help" className="sidebar-item">
          <span className="sidebar-item-icon">❓</span>
          <span className="sidebar-item-label">Help &amp; Support</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user-wrap">
          {/* User menu popup would go here */}
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
  );
}
