'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, FileText, Settings, HelpCircle,
  ChevronUp, LogOut, CreditCard, User, Zap
} from 'lucide-react';

export function Sidebar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const userName = session?.user?.name ?? 'Loading...';
  const userEmail = session?.user?.email ?? '';
  const userRole = (session?.user as { role?: string })?.role ?? 'member';
  const userInitials = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const roleLabel: Record<string, string> = {
    superadmin: 'Super Admin',
    admin: 'Agency Admin',
    member: 'Team Member',
    client: 'Client',
  };

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    toast.loading('Signing out...');
    await signOut({ callbackUrl: '/login' });
  };

  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  const isLocalhostPath = firstSegment && !['clients', 'reports', 'settings', 'help', 'login', 'register'].includes(firstSegment);
  const domain = isLocalhostPath ? firstSegment : null;
  const basePath = domain ? `/${domain}` : '';

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navItems = [
    { href: `${basePath}/`, label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: `${basePath}/clients`, label: 'Clients', icon: Users, badge: null },
    { href: `${basePath}/reports`, label: 'Reports', icon: FileText, badge: null },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">RF</div>
        <div>
          <div className="sidebar-logo-text">RankFlow</div>
          <div className="sidebar-logo-sub">SEO Automation</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isItemActive = exact 
            ? pathname === href || pathname === `${basePath}/` 
            : pathname.startsWith(href) && href !== `${basePath}/`;

          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-item ${isItemActive ? 'active' : ''}`}
            >
              <span className="sidebar-item-icon">
                <Icon size={16} />
              </span>
              <span className="sidebar-item-label">{label}</span>
            </Link>
          );
        })}

        <div className="sidebar-section-label">Configuration</div>
        <Link href={`${basePath}/settings`} className={`sidebar-item ${pathname.includes('/settings') ? 'active' : ''}`}>
          <span className="sidebar-item-icon"><Settings size={16} /></span>
          <span className="sidebar-item-label">Settings</span>
        </Link>
        <Link href={`${basePath}/help`} className={`sidebar-item ${pathname.includes('/help') ? 'active' : ''}`}>
          <span className="sidebar-item-icon"><HelpCircle size={16} /></span>
          <span className="sidebar-item-label">Help &amp; Support</span>
        </Link>
      </nav>

      {/* Plan Chip */}
      <div style={{ padding: '0 10px 8px' }}>
        <div style={{
          background: 'rgba(79,142,247,0.12)',
          border: '1px solid rgba(79,142,247,0.25)',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Zap size={12} style={{ color: '#4F8EF7', flexShrink: 0 }} />
          <div style={{ fontSize: '11px' }}>
            <span style={{ color: '#4F8EF7', fontWeight: 700 }}>Agency Plan</span>
            <span style={{ color: '#6B7CA8', marginLeft: '4px' }}>· 5/25 clients</span>
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-wrap" style={{ position: 'relative' }}>
          {/* User menu */}
          {isUserMenuOpen && (
            <div id="userMenu" style={{ display: 'block' }}>
              <div className="user-menu-header">
                <div className="user-menu-name">{userName}</div>
                <div className="user-menu-email">{userEmail}</div>
              </div>
              <Link href="/settings" className="user-menu-item" style={{ display: 'flex', width: '100%', textDecoration: 'none', gap: '8px', alignItems: 'center' }} onClick={() => setIsUserMenuOpen(false)}>
                <User size={13} /> Account Settings
              </Link>
              <Link href="/settings?tab=billing" className="user-menu-item" style={{ display: 'flex', width: '100%', textDecoration: 'none', gap: '8px', alignItems: 'center' }} onClick={() => setIsUserMenuOpen(false)}>
                <CreditCard size={13} /> Billing &amp; Plan
              </Link>
              <Link href="/help" className="user-menu-item" style={{ display: 'flex', width: '100%', textDecoration: 'none', gap: '8px', alignItems: 'center' }} onClick={() => setIsUserMenuOpen(false)}>
                <HelpCircle size={13} /> Help &amp; Support
              </Link>
              <div className="user-menu-divider" />
              <button
                className="user-menu-item danger"
                style={{ display: 'flex', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '8px', alignItems: 'center' }}
                onClick={handleSignOut}
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          )}

          {/* User chip */}
          <div
            id="sidebarUserChip"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', transition: 'var(--transition-fast)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="sidebar-avatar">{userInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div className="sidebar-user-role">{roleLabel[userRole] ?? 'Team Member'}</div>
            </div>
            <ChevronUp
              size={12}
              style={{
                color: 'var(--sidebar-text)',
                transform: isUserMenuOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: '0.2s',
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
