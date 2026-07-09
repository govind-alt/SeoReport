'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function Sidebar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname() || '';
  
  // Extract domain from pathname (e.g. /localhost/reports -> localhost)
  // If no domain (like at /), default to 'localhost' for development
  const pathParts = pathname.split('/').filter(Boolean);
  const domain = pathParts.length > 0 ? pathParts[0] : 'localhost';

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
        <Link href={`/${domain}`} className={`sidebar-item ${pathname === `/${domain}` ? 'active' : ''}`}>
          <span className="sidebar-item-icon">📊</span>
          <span className="sidebar-item-label">Dashboard</span>
        </Link>
        <Link href={`/${domain}/clients`} className={`sidebar-item ${pathname.includes('/clients') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">👥</span>
          <span className="sidebar-item-label">Clients</span>
          <span className="sidebar-badge">24</span>
        </Link>
        <Link href={`/${domain}/reports`} className={`sidebar-item ${pathname.includes('/reports') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">📄</span>
          <span className="sidebar-item-label">Reports</span>
          <span className="sidebar-badge">38</span>
        </Link>
        <div className="sidebar-section-label">Configuration</div>
        <Link href={`/${domain}/settings`} className={`sidebar-item ${pathname.includes('/settings') ? 'active' : ''}`}>
          <span className="sidebar-item-icon">⚙️</span>
          <span className="sidebar-item-label">Settings</span>
        </Link>
        <Link href={`/${domain}/help`} className={`sidebar-item ${pathname.includes('/help') ? 'active' : ''}`}>
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
                <div className="user-menu-name">John Doe</div>
                <div className="user-menu-email">john@digitalhorizons.com</div>
              </div>
              <Link href={`/${domain}/settings`} className="user-menu-item" style={{ display: 'flex', width: '100%', textDecoration: 'none' }}>⚙️ Account Settings</Link>
              <Link href={`/${domain}/settings`} className="user-menu-item" style={{ display: 'flex', width: '100%', textDecoration: 'none' }}>💳 Billing &amp; Plan</Link>
              <Link href={`/${domain}/help`} className="user-menu-item" style={{ display: 'flex', width: '100%', textDecoration: 'none' }}>❓ Help &amp; Support</Link>
              <div className="user-menu-divider"></div>
              <Link href="/login" className="user-menu-item danger" style={{ display: 'flex', width: '100%', textDecoration: 'none' }}>🚪 Sign Out</Link>
            </div>
          )}
          
          {/* Clickable chip */}
          <div id="sidebarUserChip" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} style={{ cursor: 'pointer' }}>
            <div className="sidebar-avatar">JD</div>
            <div>
              <div className="sidebar-user-name">John Doe</div>
              <div className="sidebar-user-role">Agency Admin</div>
            </div>
            <span className="chevron" style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>▲</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
