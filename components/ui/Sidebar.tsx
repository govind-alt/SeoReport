'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function Sidebar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [reportCount, setReportCount] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || '';

  let basePath = '';
  const firstSegment = pathname.split('/')[1];
  if (firstSegment && !['clients', 'reports', 'settings', 'help', ''].includes(firstSegment)) {
    basePath = `/${firstSegment}`;
  }

  useEffect(() => {
    const domain = firstSegment || 'localhost';
    fetch(`/api/counts?domain=${domain}`)
      .then(r => r.json())
      .then(d => { setClientCount(d.clients); setReportCount(d.reports); })
      .catch(() => {});
  }, [firstSegment]);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [user, setUser] = useState<{ name: string | null; email: string | null; role: string } | null>(null);

  useEffect(() => {
    import('@/app/actions').then(m => m.getCurrentUser()).then(u => {
      if (u) {
        setUser({
          name: u.name ?? null,
          email: u.email ?? null,
          role: u.role
        });
      }
    });
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'user@agency.com';
  const displayRole = user?.role || 'Agency Admin';
  const initials = getInitials(displayName);

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
        <Link href={`${basePath}/`} className={`sidebar-item ${pathname === `${basePath}/` || pathname === basePath || pathname === '/' ? 'active' : ''}`}>
          <span className="sidebar-item-icon">📈</span>
          <span className="sidebar-item-label">Dashboard</span>
        </Link>
        <Link href={`${basePath}/clients`} className={`sidebar-item ${pathname.includes('/clients') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">👥</span>
          <span className="sidebar-item-label">Clients</span>
          {clientCount !== null && <span className="sidebar-badge">{clientCount}</span>}
        </Link>
        <Link href={`${basePath}/industry`} className={`sidebar-item ${pathname.includes('/industry') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">🏭</span>
          <span className="sidebar-item-label">Industries</span>
        </Link>
        <Link href={`${basePath}/reports`} className={`sidebar-item ${pathname.includes('/reports') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">📄</span>
          <span className="sidebar-item-label">Reports</span>
          {reportCount !== null && <span className="sidebar-badge">{reportCount}</span>}
        </Link>
        <div className="sidebar-section-label">Configuration</div>
        <Link href={`${basePath}/team`} className={`sidebar-item ${pathname.includes('/team') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">👥</span>
          <span className="sidebar-item-label">Team & Roles</span>
        </Link>
        <Link href={`${basePath}/integrations`} className={`sidebar-item ${pathname.includes('/integrations') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">🔌</span>
          <span className="sidebar-item-label">Integrations</span>
        </Link>
        <Link href={`${basePath}/billing`} className={`sidebar-item ${pathname.includes('/billing') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">💳</span>
          <span className="sidebar-item-label">Billing</span>
        </Link>
        <Link href={`${basePath}/audit-log`} className={`sidebar-item ${pathname.includes('/audit-log') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">🗂️</span>
          <span className="sidebar-item-label">Audit Log</span>
        </Link>
        <Link href={`${basePath}/settings`} className={`sidebar-item ${pathname.includes('/settings') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">⚙️</span>
          <span className="sidebar-item-label">Settings</span>
        </Link>
        <Link href={`${basePath}/help`} className={`sidebar-item ${pathname.includes('/help') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">❓</span>
          <span className="sidebar-item-label">Help &amp; Support</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user-wrap" style={{ position: 'relative' }}>
          {/* User menu popup */}
          {isUserMenuOpen && (
            <div id="userMenu" style={{ display: 'block' }}>
              <div className="user-menu-header">
                <div className="user-menu-name">{displayName}</div>
                <div className="user-menu-email">{displayEmail}</div>
              </div>
              <Link href={`${basePath}/settings?tab=general`} className="user-menu-item" style={{ display: 'flex', width: '100%', textDecoration: 'none' }}>⚙️ Account Settings</Link>
              <Link href={`${basePath}/settings?tab=billing`} className="user-menu-item" style={{ display: 'flex', width: '100%', textDecoration: 'none' }}>💳 Billing &amp; Plan</Link>
              <Link href={`${basePath}/help`} className="user-menu-item" style={{ display: 'flex', width: '100%', textDecoration: 'none' }}>❓ Help &amp; Support</Link>
              <div className="user-menu-divider"></div>
              <button onClick={() => {
                  import('@/app/actions').then(m => m.logoutAction());
                }} className="user-menu-item danger" style={{ display: 'flex', width: '100%', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit' }}>🚪 Sign Out</button>
            </div>
          )}
          
          {/* Clickable chip */}
          <div id="sidebarUserChip" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} style={{ cursor: 'pointer' }}>
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">{displayRole}</div>
            </div>
            <span className="chevron" style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>▲</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
