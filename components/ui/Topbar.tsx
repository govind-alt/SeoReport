'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Bell, Search, RefreshCw } from 'lucide-react';

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  // Remove domain segment from display if it looks like a subdomain
  const displaySegments = segments.filter(s => !s.includes('.') && s.length < 30);

  const breadcrumbs = displaySegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: '/' + displaySegments.slice(0, i + 1).join('/'),
  }));

  if (breadcrumbs.length === 0) {
    return null;
  }

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

export function Topbar() {
  const { data: session } = useSession();
  const [notifOpen, setNotifOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    const toastId = toast.loading('Syncing SERanking data...');
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Sync complete! Data updated.', { id: toastId });
    }, 2000);
  };

  const notifications = [
    { id: 1, icon: '📄', text: 'Acme Corp report generated successfully', time: '2h ago', unread: true },
    { id: 2, icon: '📈', text: 'TechStart.io reached position #2 for "local seo london"', time: '5h ago', unread: true },
    { id: 3, icon: '⚠️', text: 'GreenLeaf Organics has 3 critical audit issues', time: '1d ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
          <span style={{ fontSize: '12px', display: 'none' }}>Sync</span>
        </button>

        {/* Search */}
        <button
          className="topbar-action-btn"
          title="Search (coming soon)"
          onClick={() => toast.info('Global search coming soon')}
        >
          <Search size={14} />
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="topbar-action-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                width: '8px', height: '8px', background: 'var(--danger)',
                borderRadius: '50%', border: '1.5px solid var(--surface)',
              }} />
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="notif-dropdown open" style={{ zIndex: 200 }}>
              <div className="notif-header">
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Notifications</span>
                <button
                  style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => toast.success('All marked as read')}
                >
                  Mark all read
                </button>
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`} onClick={() => setNotifOpen(false)}>
                  <div className="notif-avatar">{n.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="notif-text">{n.text}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                  {n.unread && <div className="notif-unread-dot" />}
                </div>
              ))}
              <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                  View all notifications
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User chip */}
        {session?.user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 8px 4px 14px',
            borderLeft: '1.5px solid var(--border)',
            marginLeft: '6px'
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(79,142,247,0.25)'
            }}>
              {session.user.name?.slice(0, 2).toUpperCase() ?? 'U'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap'
              }}>{session.user.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close notif */}
      {notifOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100 }}
          onClick={() => setNotifOpen(false)}
        />
      )}
    </header>
  );
}
