'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, FileText, User,
  BarChart2, TrendingUp, ChevronRight, Menu, Sparkles, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard, path: '/c/dashboard' },
  { id: 'reports',   label: 'My Reports', icon: FileText,         path: '/c/dashboard#reports' },
  { id: 'rankings',  label: 'Rankings',   icon: TrendingUp,       path: '/c/dashboard#rankings' },
  { id: 'analytics', label: 'Analytics',  icon: BarChart2,        path: '/c/dashboard#analytics' },
  { id: 'profile',   label: 'Profile',    icon: User,             path: '/c/dashboard#profile' },
];

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const params = useParams();
  const domain = (params?.domain as string) || 'localhost';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Client';
  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CL';

  // track hash-based active section
  useEffect(() => {
    const update = () => setActiveHash(window.location.hash || '');
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.path.includes('#')) {
      return activeHash === item.path.split('#')[1]
        ? true
        : item.path.includes('#dashboard') && !activeHash;
    }
    return !activeHash;
  };

  const handleNav = (item: typeof NAV_ITEMS[0]) => {
    if (item.path.includes('#')) {
      const hash = item.path.split('#')[1];
      window.location.hash = hash;
      setActiveHash('#' + hash);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .cp-root {
          min-height: 100vh;
          background: #F0F2F8;
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          overflow-x: hidden;
        }

        /* ── SIDEBAR ── */
        .cp-sidebar {
          width: 240px;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(170deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          z-index: 60;
          transition: width 0.3s ease, left 0.3s ease;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .cp-sidebar.collapsed {
          width: 68px;
        }
        .cp-sidebar-logo {
          padding: 22px 18px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cp-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4F8EF7, #2563EB);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 900;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(79,142,247,0.4);
          letter-spacing: -0.5px;
        }
        .cp-logo-text { overflow: hidden; transition: opacity 0.2s, width 0.2s; }
        .cp-sidebar.collapsed .cp-logo-text { opacity: 0; width: 0; }
        .cp-logo-agency { font-size: 13px; font-weight: 800; color: #fff; white-space: nowrap; }
        .cp-logo-sub { font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 1px; white-space: nowrap; }

        .cp-sidebar-collapse-btn {
          margin: 10px 12px;
          padding: 6px 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 7px;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          transition: all 0.2s;
        }
        .cp-sidebar-collapse-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .cp-sidebar-nav {
          flex: 1;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }
        .cp-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 9px;
          cursor: pointer;
          color: rgba(255,255,255,0.55);
          transition: all 0.15s;
          text-decoration: none;
          white-space: nowrap;
          font-size: 13.5px;
          font-weight: 500;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .cp-nav-item:hover {
          background: rgba(79,142,247,0.1);
          color: rgba(255,255,255,0.9);
        }
        .cp-nav-item.active {
          background: rgba(79,142,247,0.2);
          color: #fff;
          font-weight: 600;
          box-shadow: inset 3px 0 0 #4F8EF7;
        }
        .cp-nav-icon { flex-shrink: 0; }
        .cp-nav-label { overflow: hidden; transition: opacity 0.2s, width 0.2s; }
        .cp-sidebar.collapsed .cp-nav-label { opacity: 0; width: 0; }

        .cp-sidebar-user {
          padding: 14px 10px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cp-user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4F8EF7, #2563EB);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
        }
        .cp-user-info { overflow: hidden; transition: opacity 0.2s, width 0.2s; flex: 1; min-width: 0; }
        .cp-sidebar.collapsed .cp-user-info { opacity: 0; width: 0; }
        .cp-user-name { font-size: 12px; font-weight: 700; color: #E2E8F0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cp-user-role { font-size: 10px; color: rgba(255,255,255,0.5); white-space: nowrap; }
        .cp-signout-btn {
          padding: 5px;
          border-radius: 7px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .cp-signout-btn:hover { color: #EF4444; background: rgba(239,68,68,0.1); }

        /* ── MAIN AREA ── */
        .cp-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          margin-left: 240px;
          transition: margin-left 0.3s ease;
        }
        .cp-main.expanded {
          margin-left: 68px;
        }

        /* ── TOPBAR ── */
        .cp-topbar {
          height: 60px;
          background: #fff;
          border-bottom: 1px solid #E4E9F2;
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 1px 4px rgba(26,26,46,0.04);
        }
        .cp-topbar-hamburger {
          display: none;
          padding: 6px;
          border-radius: 8px;
          background: none;
          border: none;
          color: #64748B;
          cursor: pointer;
        }
        .cp-topbar-breadcrumb {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #94A3B8;
        }
        .cp-breadcrumb-active {
          color: #1A1A2E;
          font-weight: 700;
        }
        .cp-topbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cp-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: linear-gradient(135deg, rgba(79,142,247,0.12), rgba(37,99,235,0.08));
          border: 1px solid rgba(79,142,247,0.2);
          color: #4F8EF7;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .cp-topbar-user {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 8px;
          background: #F8FAFC;
          border: 1px solid #E4E9F2;
        }
        .cp-topbar-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4F8EF7, #2563EB);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          color: white;
        }
        .cp-topbar-name { font-size: 12px; font-weight: 700; color: #1A1A2E; }

        /* ── PAGE CONTENT ── */
        .cp-page { flex: 1; padding: 28px 28px 48px; }

        /* ── MOBILE OVERLAY ── */
        .cp-mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 55;
          backdrop-filter: blur(4px);
        }

        @media (max-width: 768px) {
          .cp-sidebar {
            left: -240px;
            width: 240px !important;
          }
          .cp-sidebar.mobile-open {
            left: 0;
          }
          .cp-mobile-overlay { display: block; }
          .cp-topbar-hamburger { display: flex; }
          .cp-page { padding: 20px 16px 48px; }
          .cp-main {
            margin-left: 0 !important;
          }
        }
      `}</style>

      <div className="cp-root">
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div className="cp-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* SIDEBAR */}
        <aside className={`cp-sidebar ${!sidebarOpen ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Logo */}
          <div className="cp-sidebar-logo">
            <div className="cp-logo-icon">RF</div>
            <div className="cp-logo-text">
              <div className="cp-logo-agency">Client Portal</div>
              <div className="cp-logo-sub">SEO Reports Dashboard</div>
            </div>
          </div>

          {/* Collapse Toggle */}
          <button className="cp-sidebar-collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronRight size={14} style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Nav */}
          <nav className="cp-sidebar-nav">
            {NAV_ITEMS.map(item => {
              const active = item.path.includes('#')
                ? activeHash === '#' + item.path.split('#')[1] || (item.id === 'dashboard' && !activeHash)
                : !activeHash;
              return (
                <button
                  key={item.id}
                  className={`cp-nav-item ${active ? 'active' : ''}`}
                  onClick={() => handleNav(item)}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon size={16} className="cp-nav-icon" />
                  <span className="cp-nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User */}
          <div className="cp-sidebar-user">
            <div className="cp-user-avatar">{initials}</div>
            <div className="cp-user-info">
              <div className="cp-user-name">{firstName}</div>
              <div className="cp-user-role">Client Access</div>
            </div>
            <button
              className="cp-signout-btn"
              onClick={() => signOut({ callbackUrl: `/${domain}/c/login` })}
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className={`cp-main ${!sidebarOpen ? 'expanded' : ''}`}>
          {/* Topbar */}
          <div className="cp-topbar">
            <button className="cp-topbar-hamburger" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="cp-topbar-breadcrumb">
              <span>Client Portal</span>
              <ChevronRight size={13} />
              <span className="cp-breadcrumb-active">
                {activeHash
                  ? NAV_ITEMS.find(n => n.path.includes(activeHash.slice(1)))?.label ?? 'Dashboard'
                  : 'Dashboard'}
              </span>
            </div>
            <div className="cp-topbar-actions">
              <div className="cp-badge">
                <Sparkles size={11} />
                SEO Reports
              </div>
              <div className="cp-topbar-user">
                <div className="cp-topbar-avatar">{initials}</div>
                <span className="cp-topbar-name">{session?.user?.name ?? 'Client'}</span>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="cp-page">{children}</div>
        </div>
      </div>
    </>
  );
}
