'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, FileText, Settings, HelpCircle,
  ChevronUp, LogOut, CreditCard, User, Zap, Shield, ExternalLink
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface AgencyInfo {
  plan: string;
  clientCount: number;
  maxClients: number;
}

const PLAN_META: Record<string, { label: string; max: number; color: string }> = {
  starter: { label: 'Starter',   max: 5,   color: '#64748B' },
  pro:     { label: 'Pro',       max: 25,  color: '#4F8EF7' },
  agency:  { label: 'Agency',   max: 999, color: '#8B5CF6' },
};

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  superadmin: { label: 'Super Admin',   color: '#DC2626', bg: 'rgba(239,68,68,0.12)' },
  admin:      { label: 'Agency Admin',  color: '#4F8EF7', bg: 'rgba(79,142,247,0.12)' },
  member:     { label: 'Team Member',   color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  client:     { label: 'Client',        color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
};

export function Sidebar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState<AgencyInfo | null>(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Session data ──────────────────────────────────────────────────────────
  const userName     = session?.user?.name  ?? 'Loading…';
  const userEmail    = session?.user?.email ?? '';
  const userRole     = (session?.user as { role?: string })?.role ?? 'member';
  const userInitials = userName !== 'Loading…'
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '…';

  const roleMeta = ROLE_META[userRole] ?? ROLE_META.member;

  // ── Domain / base path ────────────────────────────────────────────────────
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  const isDomainSegment = firstSegment && !['clients', 'reports', 'settings', 'help', 'login', 'register'].includes(firstSegment);
  const domain   = isDomainSegment ? firstSegment : null;
  const basePath = domain ? `/${domain}` : '';

  // ── Fetch real agency info (plan + client count) ─────────────────────────
  const fetchAgencyInfo = useCallback(async () => {
    try {
      const [settingsRes, clientsRes] = await Promise.all([
        fetch('/api/agency/settings'),
        fetch('/api/clients'),
      ]);
      if (!settingsRes.ok) return;
      const settings = await settingsRes.json();
      const clients  = clientsRes.ok ? await clientsRes.json() : [];

      const plan = settings.plan ?? 'pro';
      setAgencyInfo({
        plan,
        clientCount: Array.isArray(clients) ? clients.length : 0,
        maxClients:  PLAN_META[plan]?.max ?? 25,
      });
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => { fetchAgencyInfo(); }, [fetchAgencyInfo]);

  // ── Click-outside to close user menu ─────────────────────────────────────
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isUserMenuOpen]);

  // Close menu on route change
  useEffect(() => { setIsUserMenuOpen(false); }, [pathname]);

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    toast.loading('Signing out…');
    await signOut({ callbackUrl: '/login' });
  };

  // ── Navigate to settings with a specific tab ─────────────────────────────
  const goToSettings = (tab: string) => {
    setIsUserMenuOpen(false);
    router.push(`${basePath}/settings?tab=${tab}`);
  };

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems = [
    { href: `${basePath}/`,        label: 'Dashboard', icon: LayoutDashboard, exact: true  },
    { href: `${basePath}/clients`, label: 'Clients',   icon: Users,            exact: false },
    { href: `${basePath}/reports`, label: 'Reports',   icon: FileText,         exact: false },
  ];

  const planInfo  = PLAN_META[agencyInfo?.plan ?? 'pro'];
  const planColor = planInfo?.color ?? '#4F8EF7';
  const usedPct   = agencyInfo
    ? Math.min(100, Math.round((agencyInfo.clientCount / agencyInfo.maxClients) * 100))
    : 0;

  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">RF</div>
        <div>
          <div className="sidebar-logo-text">RankFlow</div>
          <div className="sidebar-logo-sub">SEO Automation</div>
        </div>
      </div>

      {/* ── Navigation ── */}
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
              <span className="sidebar-item-icon"><Icon size={16} /></span>
              <span className="sidebar-item-label">{label}</span>
            </Link>
          );
        })}

        <div className="sidebar-section-label">Configuration</div>

        <Link
          href={`${basePath}/settings`}
          className={`sidebar-item ${pathname.includes('/settings') ? 'active' : ''}`}
        >
          <span className="sidebar-item-icon"><Settings size={16} /></span>
          <span className="sidebar-item-label">Settings</span>
        </Link>

        <Link
          href={`${basePath}/help`}
          className={`sidebar-item ${pathname.includes('/help') ? 'active' : ''}`}
        >
          <span className="sidebar-item-icon"><HelpCircle size={16} /></span>
          <span className="sidebar-item-label">Help &amp; Support</span>
        </Link>
      </nav>

      {/* ── Plan chip ── */}
      <div style={{ padding: '0 10px 8px' }}>
        <div style={{
          background: `${planColor}18`,
          border: `1px solid ${planColor}35`,
          borderRadius: '10px',
          padding: '10px 12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: 7 }}>
            <Zap size={11} style={{ color: planColor, flexShrink: 0 }} />
            <span style={{ color: planColor, fontWeight: 700, fontSize: 11 }}>
              {planInfo?.label ?? 'Pro'} Plan
            </span>
            <span style={{ color: '#6B7CA8', fontSize: 11, marginLeft: 'auto' }}>
              {agencyInfo ? `${agencyInfo.clientCount}/${agencyInfo.maxClients}` : '—'} clients
            </span>
          </div>
          {/* Usage bar */}
          <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${usedPct}%`,
              background: usedPct > 85
                ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                : `linear-gradient(90deg, ${planColor}, ${planColor}cc)`,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

      {/* ── User footer ── */}
      <div className="sidebar-footer">
        <div className="sidebar-user-wrap" style={{ position: 'relative' }} ref={menuRef}>

          {/* ── User popup menu ── */}
          {isUserMenuOpen && (
            <div
              id="userMenu"
              style={{
                display: 'block',
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: 8, right: 8,
                background: '#1E293B',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14,
                boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
                zIndex: 300,
                overflow: 'hidden',
                animation: 'scaleIn 0.15s ease',
              }}
            >
              {/* Header: name + email + role badge */}
              <div style={{
                padding: '14px 14px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'white',
                    boxShadow: '0 2px 8px rgba(79,142,247,0.3)',
                  }}>
                    {userInitials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="user-menu-name">{userName}</div>
                    <div className="user-menu-email">{userEmail}</div>
                  </div>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: roleMeta.bg, color: roleMeta.color,
                }}>
                  {roleMeta.label}
                </span>
              </div>

              {/* Menu items */}
              <div style={{ padding: '6px' }}>
                <button
                  className="user-menu-item"
                  style={{ display: 'flex', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '10px', alignItems: 'center' }}
                  onClick={() => goToSettings('general')}
                >
                  <User size={14} />
                  <span style={{ flex: 1 }}>Account Settings</span>
                  <ExternalLink size={10} style={{ opacity: 0.4 }} />
                </button>

                <button
                  className="user-menu-item"
                  style={{ display: 'flex', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '10px', alignItems: 'center' }}
                  onClick={() => goToSettings('billing')}
                >
                  <CreditCard size={14} />
                  <span style={{ flex: 1 }}>Billing &amp; Plan</span>
                  {agencyInfo && (
                    <span style={{
                      fontSize: 9, padding: '2px 7px', borderRadius: 20, fontWeight: 800,
                      background: `${planColor}22`, color: planColor,
                    }}>
                      {planInfo?.label}
                    </span>
                  )}
                </button>

                <button
                  className="user-menu-item"
                  style={{ display: 'flex', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '10px', alignItems: 'center' }}
                  onClick={() => goToSettings('security')}
                >
                  <Shield size={14} />
                  <span style={{ flex: 1 }}>Security</span>
                </button>

                <button
                  className="user-menu-item"
                  style={{ display: 'flex', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '10px', alignItems: 'center' }}
                  onClick={() => { setIsUserMenuOpen(false); router.push(`${basePath}/help`); }}
                >
                  <HelpCircle size={14} />
                  <span style={{ flex: 1 }}>Help &amp; Support</span>
                </button>

                <div className="user-menu-divider" />

                <button
                  className="user-menu-item danger"
                  style={{ display: 'flex', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '10px', alignItems: 'center' }}
                  onClick={handleSignOut}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* ── User chip (trigger) ── */}
          <div
            id="sidebarUserChip"
            onClick={() => setIsUserMenuOpen(o => !o)}
            style={{
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '10px', padding: '8px 10px', borderRadius: '8px',
              transition: 'var(--transition-fast)',
              background: isUserMenuOpen ? 'var(--sidebar-hover)' : 'transparent',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = isUserMenuOpen ? 'var(--sidebar-hover)' : 'transparent')}
          >
            <div className="sidebar-avatar">{userInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userName}
              </div>
              <div className="sidebar-user-role">{roleMeta.label}</div>
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
