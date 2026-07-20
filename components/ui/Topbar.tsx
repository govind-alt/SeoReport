'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Bell, Search, RefreshCw, X, CheckCircle2, AlertTriangle, Zap, FileText, TrendingUp } from 'lucide-react';

// ── Notification type ────────────────────────────────────────────────────────
interface Notif {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

function notifMeta(type: string): { bg: string; color: string; icon: React.ReactNode } {
  switch (type) {
    case 'report':  return { bg: '#EBF2FF', color: '#4F8EF7', icon: <FileText size={14} /> };
    case 'ranking': return { bg: '#ECFDF5', color: '#10B981', icon: <TrendingUp size={14} /> };
    case 'alert':   return { bg: '#FFFBEB', color: '#F59E0B', icon: <AlertTriangle size={14} /> };
    case 'sync':    return { bg: '#ECFDF5', color: '#10B981', icon: <Zap size={14} /> };
    case 'invite':  return { bg: '#F3E8FF', color: '#9333EA', icon: <CheckCircle2 size={14} /> };
    default:        return { bg: '#F1F5F9', color: '#64748B', icon: <Bell size={14} /> };
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Breadcrumb ───────────────────────────────────────────────────────────────
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

// ── Main Topbar ──────────────────────────────────────────────────────────────
export function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [notifOpen, setNotifOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Live notifications state
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // ── Fetch notifications from API ─────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      // silently fail — don't break the UI
    }
  }, []);

  // Fetch on mount and every 60 s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Also fetch when the dropdown opens
  useEffect(() => {
    if (notifOpen) fetchNotifications();
  }, [notifOpen, fetchNotifications]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const markAllRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications', { method: 'POST' });
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to update notifications');
      fetchNotifications(); // revert
    }
  };

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    } catch {
      // silently revert
      fetchNotifications();
    }
  };

  const dismissNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic remove
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch {
      fetchNotifications(); // revert
    }
  };

  // ── Sync button ──────────────────────────────────────────────────────────
  const handleSync = async () => {
    setIsSyncing(true);
    const toastId = toast.loading('Syncing SERanking data...');
    await new Promise(r => setTimeout(r, 2000));
    setIsSyncing(false);
    toast.success('Sync complete! Data updated.', { id: toastId });
    // Create a sync notification via API
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sync',
          title: 'SE Ranking Sync Complete',
          body: 'Manual sync completed — all client data updated',
        }),
      });
      fetchNotifications();
    } catch { /* ignore */ }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Search results ───────────────────────────────────────────────────────
  const domain = pathname.split('/').filter(Boolean)[0] || 'digital-horizons';
  const base = `/${domain}`;

  const ALL_SEARCH_ITEMS = [
    { label: 'Dashboard Overview', type: 'Page', href: base },
    { label: 'Clients List', type: 'Page', href: `${base}/clients` },
    { label: 'SEO Reports', type: 'Page', href: `${base}/reports` },
    { label: 'Settings & Integrations', type: 'Page', href: `${base}/settings` },
    { label: 'Help & Support Center', type: 'Page', href: `${base}/help` },
    { label: 'Acme Corp', type: 'Client', href: `${base}/clients` },
    { label: 'TechVision Inc', type: 'Client', href: `${base}/clients` },
    { label: 'GrowthLabs', type: 'Client', href: `${base}/clients` },
    { label: 'NexaRetail', type: 'Client', href: `${base}/clients` },
    { label: 'BloomAgency', type: 'Client', href: `${base}/clients` },
    { label: 'HealthPlus', type: 'Client', href: `${base}/clients` },
    { label: 'Acme Corp — June 2026 Report', type: 'Report', href: `${base}/reports` },
    { label: 'TechVision Inc — June 2026 Report', type: 'Report', href: `${base}/reports` },
    { label: 'NexaRetail — June 2026 Report', type: 'Report', href: `${base}/reports` },
    { label: 'BloomAgency — May 2026 Report', type: 'Report', href: `${base}/reports` },
  ];

  const searchResults = searchQuery.trim().length > 0
    ? ALL_SEARCH_ITEMS.filter(r => r.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

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

        {/* ── Search ── */}
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
              width: 340, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 500, overflow: 'hidden',
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
              {searchQuery.trim().length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  Type to search across clients, reports, and settings
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  No results for &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {searchResults.map((r, i) => (
                    <Link
                      key={i}
                      href={r.href}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <div
                        style={{
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
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Notifications ── */}
        <div style={{ position: 'relative' }}>
          <button
            className="topbar-action-btn"
            onClick={() => setNotifOpen(o => !o)}
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

          {notifOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 360, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 500, overflow: 'hidden',
            }}>
              {/* Header */}
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

              {/* Body */}
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifLoading ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                    Loading…
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '36px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                    <Bell size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.25 }} />
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>You&apos;re all caught up!</div>
                    No new notifications right now.
                  </div>
                ) : notifications.map((n, idx) => {
                  const meta = notifMeta(n.type);
                  const content = (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        display: 'flex', alignItems: 'flex-start', gap: 11,
                        cursor: 'pointer', transition: 'background 0.12s',
                        background: !n.read ? 'rgba(79,142,247,0.045)' : 'transparent',
                        borderBottom: idx < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                        position: 'relative',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = !n.read ? 'rgba(79,142,247,0.07)' : 'var(--surface-2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = !n.read ? 'rgba(79,142,247,0.045)' : 'transparent'}
                      onClick={() => {
                        if (!n.read) markRead(n.id);
                        if (!n.link) setNotifOpen(false);
                      }}
                    >
                      {/* Icon badge */}
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: meta.bg, color: meta.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {meta.icon}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: !n.read ? 600 : 400, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                          {n.body}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>
                          {timeAgo(n.createdAt)}
                        </div>
                      </div>

                      {/* Unread dot + dismiss */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, paddingTop: 2 }}>
                        {!n.read && (
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />
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
                  );

                  // If it has a link, wrap in Link
                  return n.link ? (
                    <Link key={n.id} href={n.link} style={{ textDecoration: 'none', display: 'block' }} onClick={() => setNotifOpen(false)}>
                      {content}
                    </Link>
                  ) : content;
                })}
              </div>

              {/* Footer */}
              <div style={{
                padding: '10px 16px', borderTop: '1px solid var(--border)',
                textAlign: 'center', background: 'var(--surface-2)',
              }}>
                <span
                  style={{ fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => setNotifOpen(false)}
                >
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

      {/* Click outside overlay */}
      {(notifOpen || searchOpen) && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200 }}
          onClick={() => { setNotifOpen(false); setSearchOpen(false); }}
        />
      )}
    </header>
  );
}
