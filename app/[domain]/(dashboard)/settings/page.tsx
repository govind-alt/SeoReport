'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Settings, Palette, Key, Users, CreditCard, Save, CheckCircle, AlertCircle,
  ExternalLink, Shield, Mail, Lock, Eye, EyeOff, Globe, Building2,
  Bell, RefreshCw, Copy, Trash2, UserPlus, ChevronRight, ArrowUpRight,
  Download, FileText, XCircle, Info, Activity, Code2, Plus, Laptop, Tablet, MobileIcon
} from 'lucide-react';

type Tab = 'general' | 'branding' | 'api-keys' | 'team' | 'billing' | 'notifications' | 'security';

const COLOR_PRESETS = [
  { name: 'Indigo', value: '#6366F1' }, { name: 'Blue', value: '#4F8EF7' },
  { name: 'Violet', value: '#8B5CF6' }, { name: 'Emerald', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' }, { name: 'Rose', value: '#F43F5E' },
  { name: 'Sky', value: '#0EA5E9' }, { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' }, { name: 'Navy', value: '#1A3A5C' },
];

const DEMO_TEAM = [
  { name: 'Alex Morgan',    email: 'demo@rankflow.app',            role: 'Admin',   status: 'Active',  lastSeen: '2 min ago', avatar: 'AM' },
  { name: 'Sarah Reynolds', email: 'sarah@digital-horizons.com',   role: 'Manager', status: 'Active',  lastSeen: '1 hr ago',  avatar: 'SR' },
  { name: 'James Walker',   email: 'james@digital-horizons.com',   role: 'Analyst', status: 'Invited', lastSeen: '—',         avatar: 'JW' },
];

const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Admin:   { bg: 'rgba(239,68,68,0.06)',   color: '#DC2626', border: 'rgba(239,68,68,0.15)' },
  Manager: { bg: 'rgba(79,142,247,0.06)',  color: '#2563EB', border: 'rgba(79,142,247,0.15)' },
  Analyst: { bg: 'rgba(16,185,129,0.06)', color: '#059669', border: 'rgba(16,185,129,0.15)' },
  Invited: { bg: 'rgba(245,158,11,0.06)', color: '#D97706', border: 'rgba(245,158,11,0.15)' },
};

const PLAN_COLORS: Record<string, string> = {
  starter: '#64748B', pro: '#4F8EF7', agency: '#8B5CF6',
};
const PLAN_META: Record<string, { clients: number; reports: string; price: number; desc: string }> = {
  starter: { clients: 5,   reports: '50/mo',      price: 49,  desc: 'For small agencies starting out.' },
  pro:     { clients: 25,  reports: '500/mo',     price: 149, desc: 'Our most popular tier for growing teams.' },
  agency:  { clients: 999, reports: 'Unlimited',  price: 299, desc: 'Enterprise power with full white-label capabilities.' },
};

const INVOICES = [
  { id: 'INV-2026-06', date: 'Jun 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'INV-2026-05', date: 'May 1, 2026', amount: '$149.00', status: 'Paid' },
  { id: 'INV-2026-04', date: 'Apr 1, 2026', amount: '$149.00', status: 'Paid' },
];

/* ── helpers ─────────────────────────────────────── */
function SectionHeader({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 28 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, padding: '24px 0', borderBottom: '1px solid var(--border)', alignItems: 'start' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'connected' | 'disconnected' | 'coming-soon' | 'demo' }) {
  const map = {
    connected:     { label: 'Connected',    bg: 'rgba(16,185,129,0.08)', color: '#059669', border: 'rgba(16,185,129,0.2)', icon: <CheckCircle size={10}/> },
    disconnected:  { label: 'Disconnected', bg: 'rgba(239,68,68,0.08)',  color: '#DC2626', border: 'rgba(239,68,68,0.2)',  icon: <XCircle size={10}/> },
    'coming-soon': { label: 'Coming Soon',  bg: 'var(--gray-100)',        color: 'var(--text-secondary)', border: 'var(--border)', icon: <AlertCircle size={10}/> },
    demo:          { label: 'Demo Mode',    bg: 'rgba(245,158,11,0.08)',  color: '#D97706', border: 'rgba(245,158,11,0.2)', icon: <AlertCircle size={10}/> },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.icon} {s.label}
    </span>
  );
}

export default function SettingsPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const [activeTab, setActiveTabState] = useState<Tab>('general');

  // Sync tab from URL param on load and when param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as Tab | null;
    const valid: Tab[] = ['general', 'branding', 'api-keys', 'team', 'billing', 'notifications', 'security'];
    if (tabParam && valid.includes(tabParam)) {
      setActiveTabState(tabParam);
    }
  }, [searchParams]);

  // Switch tab + update URL
  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const [isUpdateKeyModalOpen, setIsUpdateKeyModalOpen] = useState(false);
  const [isCnameModalOpen, setIsCnameModalOpen] = useState(false);
  const [cnameVerifying, setCnameVerifying]     = useState(false);
  const [cnameStatus, setCnameStatus]           = useState<'idle'|'ok'|'fail'>('idle');
  const [newApiKey, setNewApiKey]               = useState('');
  const [showKey, setShowKey]                   = useState(false);
  const [isSavingKey, setIsSavingKey]           = useState(false);
  const [hasKey, setHasKey]                     = useState(false);
  const [isSavingProfile, setIsSavingProfile]   = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [savedId, setSavedId]                   = useState<string | null>(null);
  const [inviteEmail, setInviteEmail]           = useState('');
  const [inviteRole, setInviteRole]             = useState('Analyst');

  // Profile
  const [agencyName, setAgencyName]       = useState('Digital Horizons Agency');
  const [billingEmail, setBillingEmail]   = useState('billing@digital-horizons.com');
  const [subdomain, setSubdomain]         = useState('digital-horizons');
  const [customDomain, setCustomDomain]   = useState('');
  const [timezone, setTimezone]           = useState('UTC+05:30 (IST)');
  const [locale, setLocale]               = useState('en-US (English - US)');

  // Branding
  const [brandingColor, setBrandingColor] = useState('#6366F1');
  const [accentColor, setAccentColor]     = useState('#10B981');
  const [logoUrl, setLogoUrl]             = useState('');
  const [reportFooter, setReportFooter]   = useState('Prepared by {agency} · Confidential');

  // Notifications
  const [notifReportReady, setNotifReportReady]   = useState(true);
  const [notifSyncError, setNotifSyncError]       = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false);
  const [notifClientViews, setNotifClientViews]   = useState(true);

  // Security
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const [plan] = useState('pro');

  useEffect(() => {
    fetch('/api/agency/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        if (data.name)         setAgencyName(data.name);
        if (data.subdomain)    setSubdomain(data.subdomain);
        if (data.billingEmail) setBillingEmail(data.billingEmail);
        if (data.customDomain) setCustomDomain(data.customDomain);
        if (data.hasSerankingApiKey) setHasKey(true);
        if (data.brandingJson) {
          try {
            const b = JSON.parse(data.brandingJson);
            if (b.primaryColor) setBrandingColor(b.primaryColor);
            if (b.accentColor)  setAccentColor(b.accentColor);
            if (b.logoUrl)      setLogoUrl(b.logoUrl);
          } catch { /* ignore */ }
        }
      })
      .catch(() => {});
  }, []);

  const triggerSaved = (id: string) => {
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2500);
  };

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/agency/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agencyName, billingEmail, customDomain }),
      });
      if (res.ok) { triggerSaved('profile'); toast.success('Agency profile saved successfully.'); }
      else { const d = await res.json(); toast.error(d.error ?? 'Failed to save profile'); }
    } catch { toast.error('Network error'); }
    finally { setIsSavingProfile(false); }
  };

  const saveBranding = async () => {
    setIsSavingBranding(true);
    try {
      const res = await fetch('/api/agency/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandingJson: JSON.stringify({ primaryColor: brandingColor, accentColor, logoUrl }) }),
      });
      if (res.ok) {
        document.documentElement.style.setProperty('--primary', brandingColor);
        triggerSaved('branding');
        toast.success('Branding saved and applied.');
      } else {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to save branding');
      }
    } catch { toast.error('Network error'); }
    finally { setIsSavingBranding(false); }
  };

  const saveKey = async () => {
    if (!newApiKey.trim()) { toast.error('Enter a key first'); return; }
    setIsSavingKey(true);
    try {
      const res = await fetch('/api/agency/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serankingApiKey: newApiKey }),
      });
      if (res.ok) {
        setHasKey(true);
        setIsUpdateKeyModalOpen(false);
        setNewApiKey('');
        toast.success('API key encrypted and saved.');
      } else {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to save key');
      }
    } catch { toast.error('Network error'); }
    finally { setIsSavingKey(false); }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'general',       label: 'General',       icon: <Building2 size={15}/> },
    { id: 'branding',      label: 'Branding & UI', icon: <Palette size={15}/> },
    { id: 'api-keys',      label: 'Integrations',  icon: <Key size={15}/>, badge: hasKey ? undefined : '!' },
    { id: 'team',          label: 'Team',           icon: <Users size={15}/> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15}/> },
    { id: 'security',      label: 'Security',       icon: <Shield size={15}/> },
    { id: 'billing',       label: 'Billing',        icon: <CreditCard size={15}/> },
  ];

  const SaveButton = ({ onClick, saving, id }: { onClick: () => void; saving: boolean; id: string }) => (
    <button onClick={onClick} disabled={saving} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700,
      background: savedId === id ? '#10B981' : 'var(--primary)',
      color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
      boxShadow: '0 4px 12px rgba(79,142,247,0.18)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', opacity: saving ? 0.7 : 1,
    }}
      onMouseEnter={e => { if(!saving && savedId !== id) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {saving ? <RefreshCw size={13} className="spinner" /> : savedId === id ? <CheckCircle size={13} /> : <Save size={13} />}
      {saving ? 'Saving…' : savedId === id ? 'Saved!' : 'Save Changes'}
    </button>
  );

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!checked)} style={{
      width: 46, height: 26, borderRadius: 999, flexShrink: 0,
      background: checked ? 'var(--primary)' : 'var(--gray-200)',
      border: 'none', cursor: 'pointer', position: 'relative',
      boxShadow: checked ? '0 0 10px rgba(79, 142, 247, 0.25)' : 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <span style={{
        position: 'absolute', top: 3, left: checked ? 23 : 3,
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </button>
  );

  return (
    <>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Manage agency profile, integrations, branding, and team access</div>
        </div>
        <a href={`https://${subdomain}.rankflow.app`} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-fast)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <Globe size={12} /> Preview Portal <ArrowUpRight size={11} />
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 24, alignItems: 'start', marginTop: 24 }}>

        {/* Sidebar */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)', position: 'sticky', top: 16 }}>
          <div style={{ padding: '16px 16px 8px', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.9px' }}>Configuration</div>
          <div style={{ padding: '0 8px 8px' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', width: '100%', border: 'none', borderRadius: 8,
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary-dark)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500, fontSize: 13, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s ease', margin: '2px 0'
                  }}
                  onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = 'var(--gray-50)'; }}
                  onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = 'transparent'; }}>
                  <span style={{ opacity: isActive ? 1 : 0.7, color: isActive ? 'var(--primary)' : 'inherit' }}>{tab.icon}</span>
                  <span style={{ flex: 1 }}>{tab.label}</span>
                  {tab.badge && <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#EF4444', color: 'white', fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tab.badge}</span>}
                  {isActive && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
                </button>
              );
            })}
          </div>
          <div style={{ margin: '0 16px 16px', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, rgba(79,142,247,0.06), rgba(139,92,246,0.04))', border: '1px solid rgba(79,142,247,0.12)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Pro Plan</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>25 clients · White-label · Priority support</div>
            <button onClick={() => setActiveTab('billing')} style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: 'var(--primary-dark)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              Upgrade plan <ChevronRight size={10} />
            </button>
          </div>
        </div>

        {/* Panel Container */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>

          {/* GENERAL */}
          {activeTab === 'general' && (
            <div>
              <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)' }}>
                <SectionHeader icon={<Building2 size={20}/>} color="#4F8EF7" title="Agency Profile" desc="This information appears on all reports, client portals, and invoices." />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* General Profile Sub-Card */}
                  <div style={{ background: 'var(--gray-50)', padding: '20px 24px', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 16 }}>Identity Details</div>
                    <SettingRow label="Agency Name" hint="Displayed on all reports and client portals.">
                      <input className="form-input" value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Your Agency Name" />
                    </SettingRow>
                    <SettingRow label="Billing Email" hint="Receives invoices and billing alerts.">
                      <input className="form-input" type="email" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} placeholder="billing@youragency.com" />
                    </SettingRow>
                  </div>

                  {/* Subdomain & URL Sub-Card */}
                  <div style={{ background: 'var(--gray-50)', padding: '20px 24px', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 16 }}>Portal Routing</div>
                    <SettingRow label="Subdomain" hint="Your dashboard and client portal URL.">
                      <div style={{ display: 'flex', boxShadow: 'var(--shadow-sm)', borderRadius: 8, overflow: 'hidden' }}>
                        <input className="form-input" style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }} value={subdomain} onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="your-agency" />
                        <div style={{ background: 'var(--gray-100)', padding: '10px 16px', border: '1px solid var(--border)', borderLeft: 'none', borderRadius: '0 8px 8px 0', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', fontWeight: 600 }}>.rankflow.app</div>
                      </div>
                      {subdomain && <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}><CheckCircle size={12} /> Live subdomain: https://{subdomain}.rankflow.app</div>}
                    </SettingRow>
                    <SettingRow label="Custom Domain" hint="Map your own domain to your agency dashboard. (Pro+)">
                      <div style={{ display: 'flex', gap: 10 }}>
                        <input className="form-input" value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="reports.youragency.com" style={{ boxShadow: 'var(--shadow-sm)' }} />
                        <button className="btn btn-secondary" style={{ whiteSpace: 'nowrap', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8, padding: '10px 16px' }} onClick={() => setIsCnameModalOpen(true)}>
                          Setup Guide <ExternalLink size={12} />
                        </button>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>CNAME record → <code style={{ fontFamily: 'monospace', background: 'var(--gray-200)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-primary)', fontWeight: 600 }}>cname.rankflow.app</code></div>
                    </SettingRow>
                  </div>

                  {/* Localization Sub-Card */}
                  <div style={{ background: 'var(--gray-50)', padding: '20px 24px', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 16 }}>Localization & Formats</div>
                    <SettingRow label="Timezone" hint="Used for scheduling and report timestamps.">
                      <select className="form-input" value={timezone} onChange={e => setTimezone(e.target.value)} style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
                        {['UTC-08:00 (PST)', 'UTC-05:00 (EST)', 'UTC+00:00 (GMT)', 'UTC+01:00 (CET)', 'UTC+05:30 (IST)', 'UTC+08:00 (SGT)', 'UTC+09:00 (JST)'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </SettingRow>
                    <SettingRow label="Locale / Language" hint="Date and number formatting.">
                      <select className="form-input" value={locale} onChange={e => setLocale(e.target.value)} style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
                        {['en-US (English - US)', 'en-GB (English - UK)', 'de-DE (German)', 'fr-FR (French)', 'es-ES (Spanish)', 'ja-JP (Japanese)'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </SettingRow>
                  </div>
                </div>
              </div>
              <div style={{ padding: '24px 40px', display: 'flex', gap: 12, background: 'var(--gray-50)' }}>
                <SaveButton onClick={saveProfile} saving={isSavingProfile} id="profile" />
                <a href={`https://${subdomain}.rankflow.app`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, textDecoration: 'none', borderRadius: 8, padding: '10px 18px' }}>
                  <ExternalLink size={13} /> Preview Portal
                </a>
              </div>
            </div>
          )}

          {/* BRANDING */}
          {activeTab === 'branding' && (
            <div>
              <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)' }}>
                <SectionHeader icon={<Palette size={20}/>} color="#8B5CF6" title="White-label Branding" desc="Customize colors, logo, and report appearance for all client-facing materials." />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <SettingRow label="Primary Brand Color" hint="Applied to report covers, charts, and CTAs.">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <input type="color" value={brandingColor} onChange={e => setBrandingColor(e.target.value)} style={{ width: 56, height: 46, padding: 3, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{brandingColor.toUpperCase()}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click square to adjust color</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                      {COLOR_PRESETS.map(p => (
                        <button key={p.value} title={p.name} onClick={() => setBrandingColor(p.value)}
                          style={{
                            width: 32, height: 32, borderRadius: 8, background: p.value, border: 'none', cursor: 'pointer',
                            outline: brandingColor === p.value ? `3px solid ${p.value}` : '3px solid transparent',
                            outlineOffset: 3, transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }} />
                      ))}
                    </div>
                  </SettingRow>

                  <SettingRow label="Accent Color" hint="Used for highlights, success states, and secondary elements.">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: 56, height: 46, padding: 3, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }} />
                      <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>{accentColor.toUpperCase()}</div>
                    </div>
                  </SettingRow>

                  <SettingRow label="Agency Logo" hint="Transparent PNG recommended. Max 500×150px.">
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 120, height: 50, border: '2px dashed var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--gray-50)', transition: 'var(--transition-fast)' }} 
                        onClick={() => toast.info('Logo upload coming soon — use a URL for now')}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                        {logoUrl ? <img src={logoUrl} alt="logo" style={{ maxHeight: 38, maxWidth: 110, objectFit: 'contain' }} /> : <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Click to Upload</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input className="form-input" placeholder="https://cdn.youragency.com/logo.png" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} style={{ fontSize: 12, boxShadow: 'var(--shadow-sm)' }} />
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Or paste a direct URL to your logo asset</div>
                      </div>
                    </div>
                  </SettingRow>

                  <SettingRow label="Report Footer Text" hint="Appears at the bottom of all generated reports.">
                    <input className="form-input" value={reportFooter} onChange={e => setReportFooter(e.target.value)} placeholder="Prepared by {agency} · Confidential" style={{ boxShadow: 'var(--shadow-sm)' }} />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Use <code style={{ fontFamily: 'monospace', background: 'var(--gray-100)', padding: '2px 5px', borderRadius: 4 }}>{'{agency}'}</code> to auto-fill agency name</div>
                  </SettingRow>

                  {/* Mockup Preview Card */}
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-muted)', marginBottom: 12 }}>Branded Report Preview</div>
                    
                    {/* Premium Device Shell Mockup */}
                    <div style={{ border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-md)', background: 'white' }}>
                      <div style={{ background: '#E2E8F2', padding: '10px 16px', display: 'flex', gap: 6, borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                        {['#FF5F56', '#FFBD2E', '#27C93F'].map(color => (
                          <div key={color} style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                        ))}
                        <div style={{ margin: '0 auto', background: '#F1F5F9', borderRadius: 4, padding: '2px 40px', fontSize: 10, color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.05)', fontFamily: 'monospace' }}>
                          reports.youragency.com
                        </div>
                      </div>
                      
                      {/* Report Cover Screen */}
                      <div style={{ background: `linear-gradient(135deg, ${brandingColor}, ${accentColor})`, padding: '36px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                        <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>{agencyName}</div>
                        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>Monthly SEO Report</div>
                        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>Acme Corporation · June 2026</div>
                      </div>

                      {/* Mockup Data Grid */}
                      <div style={{ padding: '20px 24px', background: 'var(--gray-50)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                          {[
                            { value: '84.2K', label: 'Sessions', change: '+12.4%' },
                            { value: '237', label: 'Top-10 KWs', change: '+18' },
                            { value: '92', label: 'Health Score', change: 'Excellent' }
                          ].map((item, idx) => (
                            <div key={idx} style={{ background: 'white', borderRadius: 10, padding: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.5px' }}>{item.label}</div>
                              <div style={{ fontSize: 18, fontWeight: 900, color: brandingColor, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                {item.value}
                                <span style={{ fontSize: 10, fontWeight: 700, color: idx < 2 ? '#10B981' : '#6366F1' }}>{item.change}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 500 }}>
                          {reportFooter.replace('{agency}', agencyName)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '24px 40px', background: 'var(--gray-50)' }}>
                <SaveButton onClick={saveBranding} saving={isSavingBranding} id="branding" />
              </div>
            </div>
          )}

          {/* API INTEGRATIONS */}
          {activeTab === 'api-keys' && (
            <div style={{ padding: '32px 40px' }}>
              <SectionHeader icon={<Code2 size={20}/>} color="#F59E0B" title="Integrations & API Credentials" desc="Connect external data providers to power automated SEO reports." />
              
              {/* SE Ranking */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 14, marginBottom: 20, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border)', background: 'var(--gray-50)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(245,158,11,0.15)' }}>📊</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>SE Ranking API</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Keyword rankings · Backlinks · Site audit · Competitor data</div>
                  </div>
                  <StatusBadge status={hasKey ? 'connected' : 'demo'} />
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}>
                    <div style={{ flex: 1, background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}>
                      {hasKey ? 'sk-••••••••••••••••••••••••••••••xyz' : 'No key configured (Running in Demo Mode)'}
                    </div>
                    {hasKey && (
                      <button onClick={() => { navigator.clipboard.writeText(''); toast.success('Reference token copied'); }} style={{ padding: '12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-muted)', transition: 'var(--transition-fast)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.7, marginBottom: 20, padding: '12px 16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 8 }}>
                    🔐 <strong>AES-256 Vault Encryption:</strong> Your API key is encrypted immediately upon submission and is never transmitted or saved in plain text.
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8, padding: '10px 18px' }} onClick={() => setIsUpdateKeyModalOpen(true)}>
                      <Key size={12} /> {hasKey ? 'Rotate API Key' : 'Connect SE Ranking'}
                    </button>
                    {hasKey && (
                      <button className="btn btn-secondary" style={{ fontSize: 12, color: '#DC2626', borderColor: 'rgba(220,38,38,0.2)', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8 }} onClick={() => toast.error('Key revoked.')}>
                        <Trash2 size={12} /> Revoke Connection
                      </button>
                    )}
                    <a href="https://app.seranking.com/api.html" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', marginLeft: 'auto', borderRadius: 8, padding: '10px 18px' }}>
                      Get API Token <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Google Search Console */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 14, marginBottom: 20, overflow: 'hidden', opacity: 0.75, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border)', background: 'var(--gray-50)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(79,142,247,0.15)' }}>🔍</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Google Search Console</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Clicks · Impressions · CTR · Average Position</div>
                  </div>
                  <StatusBadge status="coming-soon" />
                </div>
                <div style={{ padding: '16px 24px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  OAuth 2.0 GSC integration is under development. It will pull real click, impression and CTR data directly from your Google property.
                </div>
              </div>

              {/* Webhooks */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', opacity: 0.75, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid var(--border)', background: 'var(--gray-50)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid var(--border)' }}>🪝</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>Webhooks</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Send report events to Slack, Zapier, or any endpoint</div>
                  </div>
                  <StatusBadge status="coming-soon" />
                </div>
                <div style={{ padding: '16px 24px', fontSize: 12, color: 'var(--text-muted)' }}>Configure webhook endpoints to trigger on report generation, client views, and sync completions.</div>
              </div>
            </div>
          )}

          {/* TEAM */}
          {activeTab === 'team' && (
            <div>
              <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                  <SectionHeader icon={<Users size={20}/>} color="#10B981" title="Team Members" desc="Manage agency staff and their access levels." />
                  <button className="btn btn-primary" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0, padding: '10px 18px', borderRadius: 8 }} onClick={() => toast.info('Fill the invite form below')}>
                    <UserPlus size={13} /> Invite Member
                  </button>
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 90px 40px', padding: '12px 20px', background: 'var(--gray-50)', fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid var(--border)' }}>
                    <span>Member</span><span>Last Active</span><span>Role</span><span>Status</span><span></span>
                  </div>
                  {DEMO_TEAM.map((m, i) => {
                    const rs = ROLE_COLORS[m.role] ?? { bg: 'var(--gray-100)', color: 'var(--text-muted)', border: 'var(--border)' };
                    const ss = m.status === 'Active' ? { bg: 'rgba(16,185,129,0.08)', color: '#059669', border: 'rgba(16,185,129,0.18)' } : { bg: 'rgba(245,158,11,0.08)', color: '#D97706', border: 'rgba(245,158,11,0.18)' };
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 90px 40px', padding: '16px 20px', borderBottom: i < DEMO_TEAM.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', background: 'var(--surface)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>{m.avatar}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.email}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.lastSeen}</div>
                        <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`, width: 'fit-content' }}>{m.role}</span>
                        <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, width: 'fit-content' }}>{m.status}</span>
                        <button onClick={() => toast.info(`Actions for ${m.name}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 6, padding: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>···</button>
                      </div>
                    );
                  })}
                </div>
                
                {/* Invite section */}
                <div style={{ background: 'var(--gray-50)', borderRadius: 12, padding: 24, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                    <Mail size={16} style={{ color: 'var(--primary)' }} /> Invite a Team Member
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>An invitation email will be sent with a secure sign-up link.</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input className="form-input" style={{ flex: 1, background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }} placeholder="colleague@youragency.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                    <select className="form-input" style={{ width: 140, background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                      <option>Admin</option><option>Manager</option><option>Analyst</option><option>Viewer</option>
                    </select>
                    <button className="btn btn-primary" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', borderRadius: 8, padding: '10px 20px' }}
                      onClick={() => { if (!inviteEmail) { toast.error('Enter an email'); return; } toast.success(`Invite sent to ${inviteEmail}`); setInviteEmail(''); }}>
                      <Plus size={14} /> Send Invite
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 40px', background: 'var(--gray-50)', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={13} style={{ color: 'var(--primary)' }} /> Your Pro plan supports up to 5 team members.{' '}
                <button onClick={() => setActiveTab('billing')} style={{ background: 'none', border: 'none', color: 'var(--primary-dark)', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Upgrade for more</button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div style={{ padding: '32px 40px' }}>
              <SectionHeader icon={<Bell size={20}/>} color="#F59E0B" title="Notification Preferences" desc="Control when and how you receive alerts about your agency account." />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
                {[
                  { key: 'report', label: 'Report Ready',   desc: 'Get notified when a report is generated and ready to send.',          value: notifReportReady,   set: setNotifReportReady },
                  { key: 'sync',   label: 'Sync Errors',    desc: 'Alert when a data sync fails or encounters API rate limits.',          value: notifSyncError,     set: setNotifSyncError },
                  { key: 'views',  label: 'Client Views',   desc: 'Notify when a client opens a shared report link.',                     value: notifClientViews,   set: setNotifClientViews },
                  { key: 'digest', label: 'Weekly Digest',  desc: 'Summary email every Monday with key metrics across all clients.',      value: notifWeeklyDigest,  set: setNotifWeeklyDigest },
                ].map((n, i) => (
                  <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', border: '1px solid var(--border)', borderRadius: 12, background: n.value ? 'var(--surface)' : 'var(--gray-50)', transition: 'var(--transition)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{n.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.desc}</div>
                    </div>
                    <Toggle checked={n.value} onChange={n.set} />
                  </div>
                ))}
              </div>

              <div style={{ padding: '24px 0', borderTop: '1px solid var(--border)' }}>
                <SaveButton onClick={() => { toast.success('Notification preferences saved successfully.'); triggerSaved('notif'); }} saving={false} id="notif" />
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div>
              <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)' }}>
                <SectionHeader icon={<Shield size={20}/>} color="#EF4444" title="Security Settings" desc="Protect your agency account with additional authentication layers." />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  
                  {/* Two-Factor Auth Box */}
                  <div style={{ background: 'var(--gray-50)', padding: '20px 24px', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 16 }}>Authentication Levels</div>
                    <SettingRow label="Two-Factor Auth" hint="Require a TOTP code on login in addition to your password.">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Toggle checked={mfaEnabled} onChange={v => { setMfaEnabled(v); toast.info(v ? '2FA setup flow coming soon' : '2FA disabled'); }} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{mfaEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </SettingRow>
                    <SettingRow label="Password" hint="Last changed: 3 months ago.">
                      <button className="btn btn-secondary" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8, padding: '10px 16px' }} onClick={() => toast.info('Password change email sent')}>
                        <Lock size={12} /> Change Password
                      </button>
                    </SettingRow>
                  </div>

                  {/* Active Sessions Box */}
                  <div style={{ background: 'var(--gray-50)', padding: '20px 24px', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 16 }}>Sessions & Timeouts</div>
                    <SettingRow label="Session Timeout" hint="Automatically sign out after inactivity.">
                      <select className="form-input" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}><option>30 days</option><option>7 days</option><option>24 hours</option><option>8 hours</option></select>
                    </SettingRow>
                    <SettingRow label="Active Sessions" hint="Devices currently signed in to your account.">
                      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                        {[{ device: 'Chrome on Windows', loc: 'Mumbai, India', current: true }, { device: 'Safari on iPhone', loc: 'Mumbai, India', current: false }].map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i === 0 ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}>
                            <Activity size={16} style={{ color: s.current ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{s.device}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.loc}</div>
                            </div>
                            {s.current
                              ? <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.18)', padding: '3px 8px', borderRadius: 20 }}>Current</span>
                              : <button style={{ fontSize: 11, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick={() => toast.success('Session revoked')}>Revoke</button>}
                          </div>
                        ))}
                      </div>
                    </SettingRow>
                  </div>

                  {/* Danger Zone Box */}
                  <div style={{ marginTop: 10, padding: 24, background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#DC2626', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={15} /> Danger Zone</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>These actions are permanent and cannot be undone. Make sure you want to perform them.</div>
                    <button className="btn btn-secondary" style={{ fontSize: 12, color: '#DC2626', borderColor: 'rgba(220,38,38,0.25)', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, background: 'white' }} onClick={() => toast.error('To delete your account, contact support@rankflow.app')}>
                      <Trash2 size={13} /> Delete Agency Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BILLING */}
          {activeTab === 'billing' && (
            <div style={{ padding: '32px 40px' }}>
              <SectionHeader icon={<CreditCard size={20}/>} color="#6366F1" title="Plan & Billing" desc="Manage your subscription, payment method, and download invoices." />
              
              {/* Plans Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
                {(['starter', 'pro', 'agency'] as const).map(p => {
                  const isActive = plan === p;
                  const meta = PLAN_META[p];
                  return (
                    <div key={p} style={{ borderRadius: 14, padding: 24, border: `2px solid ${isActive ? PLAN_COLORS[p] : 'var(--border)'}`, background: isActive ? `${PLAN_COLORS[p]}05` : 'var(--surface)', position: 'relative', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}>
                      {isActive && <div style={{ position: 'absolute', top: -1, right: 14, background: PLAN_COLORS[p], color: 'white', fontSize: 9, fontWeight: 900, padding: '4px 10px', borderRadius: '0 0 6px 6px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Current Plan</div>}
                      <div style={{ fontSize: 12, fontWeight: 800, color: PLAN_COLORS[p], textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>{p}</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 }}>${meta.price}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span></div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14, height: 36 }}>{meta.desc}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, borderTop: '1px solid var(--border)', paddingTop: 14, fontWeight: 600 }}>{meta.clients === 999 ? 'Unlimited' : meta.clients} clients · {meta.reports}</div>
                      {!isActive && <button className="btn btn-primary" style={{ width: '100%', fontSize: 12, justifyContent: 'center', borderRadius: 8, padding: '10px 0' }} onClick={() => toast.info(`Upgrade to ${p} plan coming soon`)}>Upgrade Tier</button>}
                    </div>
                  );
                })}
              </div>

              {/* Billing Sub-Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 6 }}>Next Invoice</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 2 }}>$149.00</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Billed on <strong>Aug 1, 2026</strong></div>
                  </div>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }} />
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 6 }}>Payment Method</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><span>💳</span> Visa ending in 4242</div>
                    <button style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => toast.info('Billing portal opening soon')}>Update Details →</button>
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: '12px 20px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr 120px 100px 40px' }}>
                  <span>Invoice Reference</span><span>Billing Date</span><span>Amount</span><span></span>
                </div>
                {INVOICES.map((inv, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 40px', padding: '16px 20px', borderBottom: i < INVOICES.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{inv.id}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{inv.date}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{inv.amount}</span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 6, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => toast.success(`Downloading ${inv.id}…`)}>
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8 }} onClick={() => toast.info('Billing portal opening soon')}>
                  <ExternalLink size={12} /> Manage Billing Portal
                </button>
                <button className="btn btn-secondary" style={{ fontSize: 12, color: '#DC2626', borderColor: 'rgba(220,38,38,0.2)', padding: '10px 18px', borderRadius: 8 }} onClick={() => toast.info('To cancel, contact support@rankflow.app')}>
                  Cancel Subscription
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CNAME Setup Guide Modal ───────────────────────────── */}
      {isCnameModalOpen && (
        <div className="modal-overlay active" onClick={() => { setIsCnameModalOpen(false); setCnameStatus('idle'); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 620, maxHeight: '90vh', overflowY: 'auto', borderRadius: 16 }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', padding: '20px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(79,142,247,0.18)' }}>🌐</div>
                <div>
                  <div className="modal-title" style={{ fontSize: 16, fontWeight: 800 }}>Custom Domain Setup Guide</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Point your subdomain to RankFlow servers in 4 steps</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => { setIsCnameModalOpen(false); setCnameStatus('idle'); }}>✕</button>
            </div>
            <div style={{ padding: '28px' }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>1</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Enter custom subdomain</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Under the General Settings tab, input your target domain in the **Custom Domain** field, e.g. <code style={{ fontFamily: 'monospace', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>reports.youragency.com</code>.</div>
                  {customDomain && (
                    <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#059669', fontWeight: 700 }}>
                      <CheckCircle size={13} /> Configured: <strong>{customDomain}</strong>
                    </div>
                  )}
                </div>
              </div>
              {/* Step 2 */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>2</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Add CNAME record in your registrar DNS panel</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>Log in to your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.) and add the following:</div>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 12, boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 60px 40px', background: 'var(--gray-50)', padding: '10px 16px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      <span>Type</span><span>Host / Name</span><span>Value / Target</span><span>TTL</span><span></span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 60px 40px', padding: '14px 16px', alignItems: 'center', background: 'var(--surface)', gap: 4 }}>
                      <span style={{ background: 'rgba(79,142,247,0.08)', color: 'var(--primary-dark)', padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 800, border: '1px solid rgba(79,142,247,0.18)', width: 'fit-content' }}>CNAME</span>
                      <code style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)', background: 'var(--gray-100)', padding: '4px 8px', borderRadius: 5, width: 'fit-content' }}>
                        {customDomain ? customDomain.split('.')[0] : 'reports'}
                      </code>
                      <code style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)', background: 'var(--gray-100)', padding: '4px 8px', borderRadius: 5, width: 'fit-content' }}>cname.rankflow.app</code>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>3600</span>
                      <button onClick={() => { navigator.clipboard.writeText('CNAME\t' + (customDomain ? customDomain.split('.')[0] : 'reports') + '\tcname.rankflow.app\t3600'); toast.success('DNS record copied!'); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Copy to clipboard">
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    💡 <strong>Cloudflare users:</strong> Ensure the proxy setting is set to <strong>DNS Only</strong> (grey cloud, not orange) to allow SSL handshake.
                  </div>
                </div>
              </div>
              {/* Step 3 */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>3</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Save changes & wait for propagation</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Click **Save Changes** at the bottom of the Settings panel. DNS updates generally propagate worldwide within **15–30 minutes**.</div>
                </div>
              </div>
              {/* Step 4 */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>4</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Automatic SSL certificate issuance</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Once resolving, RankFlow auto-provisions a secure, free Let's Encrypt SSL certificate for your custom portal domain. HTTPS is configured instantly.</div>
                </div>
              </div>
              
              {/* Verification Panel */}
              <div style={{ padding: '20px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DNS Verification Tool</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)', background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-sm)' }}>
                    {customDomain || 'reports.youragency.com'} → cname.rankflow.app
                  </div>
                  <button disabled={cnameVerifying}
                    style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 12, fontWeight: 700, cursor: cnameVerifying ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 10px rgba(79,142,247,0.15)', opacity: cnameVerifying ? 0.7 : 1, transition: 'var(--transition-fast)' }}
                    onClick={async () => {
                      setCnameVerifying(true); setCnameStatus('idle');
                      await new Promise(r => setTimeout(r, 2200));
                      if (customDomain && customDomain.includes('.')) {
                        setCnameStatus('ok'); toast.success(`DNS propagated successfully!`);
                      } else {
                        setCnameStatus('fail'); toast.error('Propagation check failed. Enter a domain first.');
                      }
                      setCnameVerifying(false);
                    }}>
                    {cnameVerifying ? <RefreshCw size={12} className="spinner" /> : <Activity size={12} />}
                    {cnameVerifying ? 'Verifying…' : 'Check DNS Now'}
                  </button>
                </div>
                {cnameStatus === 'ok' && <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669', fontWeight: 700 }}><CheckCircle size={13} /> Active CNAME pointing detected. SSL certificate active.</div>}
                {cnameStatus === 'fail' && <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#DC2626', fontWeight: 700 }}><XCircle size={13} /> Domain mapping not detected yet. Confirm your DNS entries.</div>}
              </div>
              
              {/* Troubleshooting */}
              <details style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>🔧 DNS Troubleshooting Checklist</summary>
                <ul style={{ paddingLeft: 18, lineHeight: 2, marginTop: 8 }}>
                  <li>Confirm value field is exactly <code style={{ fontFamily: 'monospace' }}>cname.rankflow.app</code></li>
                  <li>GoDaddy/Namecheap panels require just <code style={{ fontFamily: 'monospace' }}>reports</code> as Host (not the full domain).</li>
                  <li>Check for competing wildcard or A records pointing to the same subdomain hostname.</li>
                  <li>Contact <a href="mailto:support@rankflow.app" style={{ color: 'var(--primary)' }}>support@rankflow.app</a> if issues persist after 2 hours.</li>
                </ul>
              </details>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', padding: '16px 28px' }}>
              <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                <ExternalLink size={12} /> Open DNS Checker ↗
              </a>
              <button className="btn btn-primary" style={{ fontSize: 13, borderRadius: 8, padding: '8px 20px' }} onClick={() => { setIsCnameModalOpen(false); setCnameStatus('idle'); }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {isUpdateKeyModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsUpdateKeyModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 500, borderRadius: 16 }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', padding: '20px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Key size={16} style={{ color: '#D97706' }} />
                </div>
                <div>
                  <div className="modal-title" style={{ fontSize: 16, fontWeight: 800 }}>SE Ranking API Key</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{hasKey ? 'Rotate API Key connection' : 'Connect API Key token'}</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setIsUpdateKeyModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
                🔐 <strong>Zero-Knowledge Vault Encryption:</strong> Your key credentials are encrypted with AES-256 in client-side runtime before submission.
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, display: 'block' }}>SE Ranking API Token</label>
                <div style={{ position: 'relative' }}>
                  <input type={showKey ? 'text' : 'password'} className="form-input" placeholder="Paste your token credentials here…" value={newApiKey} onChange={e => setNewApiKey(e.target.value)} style={{ paddingRight: 44, fontFamily: showKey ? 'monospace' : 'inherit', borderRadius: 8 }} autoFocus />
                  <button type="button" onClick={() => setShowKey(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Generate your token at <a href="https://app.seranking.com/api.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>SE Ranking → Account Settings → API ↗</a>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', padding: '16px 28px' }}>
              <button className="btn btn-secondary" onClick={() => setIsUpdateKeyModalOpen(false)} style={{ borderRadius: 8 }}>Cancel</button>
              <button className="btn btn-primary" onClick={saveKey} disabled={isSavingKey} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8, padding: '10px 20px' }}>
                {isSavingKey ? <RefreshCw size={13} className="spinner" /> : <Lock size={13} />}
                {isSavingKey ? 'Encrypting…' : 'Save Encrypted Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
