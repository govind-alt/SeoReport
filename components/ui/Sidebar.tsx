'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Sidebar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
        <Link href="/" className="sidebar-item active">
          <span className="sidebar-item-icon">📊</span>
          <span className="sidebar-item-label">Dashboard</span>
        </Link>
        <Link href="/clients" className="sidebar-item">
          <span className="sidebar-item-icon">👥</span>
          <span className="sidebar-item-label">Clients</span>
          <span className="sidebar-badge">24</span>
        </Link>
        <Link href="#" className="sidebar-item" onClick={(e) => { e.preventDefault(); alert('Reports page will be built in Phase 4'); }}>
          <span className="sidebar-item-icon">📄</span>
          <span className="sidebar-item-label">Reports</span>
          <span className="sidebar-badge">38</span>
        </Link>
        <div className="sidebar-section-label">Configuration</div>
        <Link href="#" className="sidebar-item" onClick={(e) => { e.preventDefault(); alert('Settings page coming soon'); }}>
          <span className="sidebar-item-icon">⚙️</span>
          <span className="sidebar-item-label">Settings</span>
        </Link>
        <Link href="#" className="sidebar-item" onClick={(e) => { e.preventDefault(); alert('Help page coming soon'); }}>
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
              <button className="user-menu-item" onClick={() => alert('Opening Settings...')}>⚙️ Account Settings</button>
              <button className="user-menu-item" onClick={() => alert('Opening Billing...')}>💳 Billing &amp; Plan</button>
              <button className="user-menu-item" onClick={() => alert('Opening Help...')}>❓ Help &amp; Support</button>
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
