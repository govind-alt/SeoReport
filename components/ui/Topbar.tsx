'use client';

import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

function getPageTitle(pathname: string) {
  if (pathname.includes('/reports/builder')) return 'Report Builder';
  if (pathname.includes('/reports/new')) return 'New Report';
  if (pathname.match(/\/reports\/[^/]+/)) return 'Report Details';
  if (pathname.includes('/reports')) return 'Reports';
  if (pathname.includes('/clients/new')) return 'Add Client';
  if (pathname.match(/\/clients\/[^/]+/)) return 'Client Details';
  if (pathname.includes('/clients')) return 'Clients';
  if (pathname.includes('/settings')) return 'Settings';
  if (pathname.includes('/billing')) return 'Billing';
  if (pathname.includes('/team')) return 'Team & Roles';
  if (pathname.includes('/integrations')) return 'Integrations';
  if (pathname.includes('/audit-log')) return 'Audit Log';
  if (pathname.includes('/industry')) return 'Industries';
  if (pathname.includes('/help')) return 'Help & Support';
  return 'Dashboard';
}

export function Topbar() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const topbarRef = useRef<HTMLElement>(null);
  const pathname = usePathname() || '';
  const title = getPageTitle(pathname);

  const [user, setUser] = useState<{ name: string | null; email: string | null; role: string } | null>(null);
  const [agencyName, setAgencyName] = useState<string>('');

  useEffect(() => {
    // Derive domain slug for API calls
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    let domain = 'localhost';
    if (isLocalhost) {
      const segments = window.location.pathname.split('/').filter(Boolean);
      const nonSlug = new Set(['login', 'register', 'forgot-password', 'superadmin', 'c', 'reports', 'r']);
      if (segments[0] && !nonSlug.has(segments[0])) {
        domain = segments[0];
      }
    }

    // Load current user
    import('@/app/actions').then(m => m.getCurrentUser()).then(u => {
      if (u) setUser({ name: u.name ?? null, email: u.email ?? null, role: u.role });
    });

    // Load agency name
    fetch(`/api/counts?domain=${domain}`)
      .then(r => r.json())
      .then(d => { if (d.agencyName) setAgencyName(d.agencyName); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (topbarRef.current && !topbarRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = user?.name || '';
  const displayAgency = agencyName || 'Agency';
  const initials = getInitials(displayName);

  const notifications = [
    { icon: '✅', title: 'Report Generated', desc: 'TechStart.io monthly PDF is ready.', time: '2h ago', unread: true },
    { icon: '🔄', title: 'Daily Sync Complete', desc: 'SERanking data for all clients synced.', time: '6h ago', unread: true },
    { icon: '⚠️', title: 'Critical Issues Found', desc: 'Acme Corp has 5 new critical issues.', time: '1d ago', unread: false },
    { icon: '🔗', title: 'Backlinks Spike', desc: 'BlueSky Marketing gained 18 backlinks.', time: '2d ago', unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="topbar" ref={topbarRef}>
      <div style={{ flex: 1 }}>
        <div className="topbar-title">{title}</div>
      </div>

      <div className="topbar-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={async () => {
            const t = toast.loading('Syncing all clients...');
            try {
              const r = await fetch('/api/webhooks/daily-sync', { method: 'POST' });
              const d = await r.json();
              toast.dismiss(t);
              toast.success(d.message || 'Sync complete');
            } catch {
              toast.dismiss(t);
              toast.error('Sync failed');
            }
          }}
        >🔄 Sync All</button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="topbar-icon-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && <span className="notif-dot"></span>}
          </button>

          {isNotifOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '16px', boxShadow: 'var(--shadow-lg)',
              zIndex: 200, width: '340px', animation: 'scaleIn 0.15s ease',
              overflow: 'hidden', backdropFilter: 'blur(16px)'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '14px' }}>Notifications</div>
                {unreadCount > 0 && (
                  <span style={{ background: 'var(--primary)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px' }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div>
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 16px', display: 'flex', gap: '12px',
                      alignItems: 'flex-start', cursor: 'pointer',
                      background: n.unread ? 'var(--primary-light)' : 'transparent',
                      borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = n.unread ? 'var(--primary-light)' : 'transparent')}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, border: '1px solid var(--border)' }}>{n.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.4' }}>{n.desc}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' }}>{n.time}</div>
                    </div>
                    {n.unread && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '4px' }}></div>}
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setIsNotifOpen(false)}>
                Mark all as read
              </div>
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 800 }}>
            {initials || 'RF'}
          </div>
          {displayAgency}
        </div>
      </div>
    </header>
  );
}
