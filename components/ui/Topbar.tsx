'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Bell, Search, RefreshCw, Moon, Sun, X, CheckCircle2, AlertTriangle, Zap, FileText, TrendingUp } from 'lucide-react';

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const displaySegments = segments.filter(s => !s.includes('.') && s.length < 30);

  const breadcrumbs = displaySegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: '/' + displaySegments.slice(0, i + 1).join('/'),
  }));

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="breadcrumb">
      <Link href="/">Home</Link>
      {breadcrumbs.map((crumb, i) => (
        <span key={crumb.href} style={{ display: 'contents' }}>
          <span className="breadcrumb-sep">/</span>
          {i === breadcrumbs.length - 1 ? (
            <span>{crumb.label}</span>
          ) : (
            <Link href={crumb.href}>{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}

const ALL_NOTIFICATIONS = [
  { id: 1, type: 'report', icon: <FileText size={14} />, iconBg: '#EBF2FF', iconColor: '#4F8EF7', text: 'Acme Corp June report generated successfully', time: '2h ago', unread: true },
  { id: 2, type: 'ranking', icon: <TrendingUp size={14} />, iconBg: '#ECFDF5', iconColor: '#10B981', text: 'TechStart.io reached #2 for "local seo london"', time: '5h ago', unread: true },
  { id: 3, type: 'alert', icon: <AlertTriangle size={14} />, iconBg: '#FFFBEB', iconColor: '#F59E0B', text: 'GreenLeaf Organics — 3 critical audit issues found', time: '1d ago', unread: false },
  { id: 4, type: 'sync', icon: <Zap size={14} />, iconBg: '#ECFDF5', iconColor: '#10B981', text: 'SE Ranking sync completed — 247 keywords updated', time: '1d ago', unread: false },
  { id: 5, type: 'report', icon: <CheckCircle2 size={14} />, iconBg: '#ECFDF5', iconColor: '#10B981', text: 'BloomAgency Q2 report delivered to client', time: '2d ago', unread: false },
];

export function Topbar() {
  const { data: session } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS);
  const [isDark, setIsDark] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rankflow-theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('rankflow-theme', 'dark');
        toast.success('Dark mode enabled');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('rankflow-theme', 'light');
        toast.success('Light mode enabled');
      }
      return next;
    });
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    const toastId = toast.loading('Syncing SERanking data...');
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Sync complete! Data updated.', { id: toastId });
      // Add a new notification
      setNotifications(prev => [{
        id: Date.now(),
        type: 'sync',
        icon: <CheckCircle2 size={14} />,
        iconBg: '#ECFDF5',
        iconColor: '#10B981',
        text: 'Manual sync completed — all clients updated',
        time: 'Just now',
        unread: true,
      }, ...prev]);
    }, 2000);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast.success('All notifications marked as read');
  };

  const dismissNotif = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const searchResults = searchQuery.trim().length > 1 ? [
    { label: 'Acme Corp', type: 'Client', href: '#' },
    { label: 'June 2026 Report', type: 'Report', href: '#' },
    { label: 'Settings — API Keys', type: 'Page', href: '#' },
  ].filter(r => r.label.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  return (
    <header className="topbar">
      {/* Left — breadcrumb */}
      <div className="topbar-left">
        <Breadcrumb />
      </div>

      {/* Right — actions */}
      <div className="topbar-actions">
        {/* Sync button */}
        <button
          className="topbar-action-btn"
          onClick={handleSync}
          title="Sync SERanking data"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <RefreshCw size={14} className={isSyncing ? 'spinner' : ''} />
        </button>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <button
            className="topbar-action-btn"
            title="Global Search"
            onClick={() => setSearchOpen(s => !s)}
            style={{ position: 'relative' }}
          >
            <Search size={14} />
          </button>
          {searchOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 320, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 300, overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search clients, reports, settings…"
                  style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13, background: 'transparent', color: 'var(--text-primary)' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                    <X size={12} />
                  </button>
                )}
              </div>
              {searchQuery.trim().length < 2 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  Type to search across clients, reports, and settings
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>No results for "{searchQuery}"</div>
              ) : (
                <div>
                  {searchResults.map((r, i) => (
                    <div key={i} onClick={() => setSearchOpen(false)} style={{
                      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
                      cursor: 'pointer', fontSize: 13, transition: 'background 0.12s',
                      borderBottom: i < searchResults.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{r.label}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>{r.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          className="topbar-action-btn"
          onClick={toggleDark}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ position: 'relative' }}
        >
          {isDark ? <Sun size={14} style={{ color: '#F59E0B' }} /> : <Moon size={14} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="topbar-action-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications"
            id="notif-bell"
            style={{ position: 'relative' }}
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                minWidth: '16px', height: '16px',
                background: 'var(--danger)', borderRadius: '50%',
                border: '1.5px solid var(--surface)',
                fontSize: '9px', fontWeight: 800, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 340, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 14,
              boxShadow: 'var(--shadow-lg)', zIndex: 300, overflow: 'hidden',
            }}>
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'var(--danger)', color: 'white', fontWeight: 800 }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    style={{ fontSize: 11, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                    onClick={markAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                    <Bell size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                    You're all caught up!
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      cursor: 'pointer', transition: 'background 0.12s',
                      background: n.unread ? 'rgba(79,142,247,0.04)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                      position: 'relative',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = n.unread ? 'rgba(79,142,247,0.07)' : 'var(--surface-2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = n.unread ? 'rgba(79,142,247,0.04)' : 'transparent'}
                    onClick={() => {
                      setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, unread: false } : notif));
                      setNotifOpen(false);
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                      background: n.iconBg, color: n.iconColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {n.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: n.unread ? 600 : 400, color: 'var(--text-primary)', lineHeight: 1.45 }}>{n.text}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontWeight: 600 }}>{n.time}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {n.unread && (
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                      )}
                      <button
                        onClick={e => dismissNotif(n.id, e)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2, borderRadius: 4 }}
                        title="Dismiss"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '10px 16px', borderTop: '1px solid var(--border)',
                textAlign: 'center', background: 'var(--surface-2)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => setNotifOpen(false)}>
                  View all activity →
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User chip */}
        {session?.user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '4px 8px 4px 14px',
            borderLeft: '1.5px solid var(--border)', marginLeft: '6px',
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(79,142,247,0.25)',
            }}>
              {session.user.name?.slice(0, 2).toUpperCase() ?? 'U'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {session.user.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(notifOpen || searchOpen) && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100 }}
          onClick={() => { setNotifOpen(false); setSearchOpen(false); }}
        />
      )}
    </header>
  );
}
