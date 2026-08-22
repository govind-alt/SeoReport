'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { signOut } from 'next-auth/react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Shield, Users, Building2, TrendingUp, DollarSign, Activity,
  AlertCircle, CheckCircle2, Server, Zap, RefreshCw, ChevronRight,
  Eye, Globe, BarChart2, Lock, Settings, LogOut, Bell, Search,
  ArrowUpRight, ArrowDownRight, Database, Download, X, Mail,
  Check, UserPlus, ExternalLink, FileText, LayoutDashboard, CreditCard,
  Plus, Edit2, Trash2, CheckCircle, AlertTriangle, Layers, Wifi,
  Menu, ChevronDown, Filter, MoreVertical, Clock, Cpu, HardDrive,
  TrendingDown, Radio, Key, Power, User, ToggleLeft, ToggleRight, Send,
  Megaphone, SlidersHorizontal
} from 'lucide-react';

/* ─── Colour tokens (navy-blue + white theme) ─── */
const C = {
  navy:     '#1A1A2E',
  navyMid:  '#16213E',
  navyDeep: '#0F3460',
  blue:     '#2563EB',
  blueLight:'#4F8EF7',
  accent:   '#3B82F6',
  white:    '#FFFFFF',
  bg:       '#F0F4FF',
  card:     '#FFFFFF',
  border:   '#E2E8F0',
  muted:    '#94A3B8',
  text:     '#1E293B',
  textSub:  '#64748B',
  success:  '#059669',
  warn:     '#D97706',
  danger:   '#DC2626',
  purple:   '#7C3AED',
};

/* ─── Plan colours ─── */
const planStyle: Record<string, { bg: string; color: string; border: string }> = {
  starter:      { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  pro:          { bg: '#EDE9FE', color: '#7C3AED', border: '#C4B5FD' },
  agency:       { bg: '#DBEAFE', color: '#1D4ED8', border: '#93C5FD' },
  enterprise:   { bg: '#D1FAE5', color: '#059669', border: '#6EE7B7' },
  canceled:     { bg: '#FEE2E2', color: '#DC2626', border: '#FCA5A5' },
  professional: { bg: '#EDE9FE', color: '#7C3AED', border: '#C4B5FD' },
  trial:        { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
};
const statusStyle: Record<string, { bg: string; color: string; dot: string }> = {
  active:    { bg: '#ECFDF5', color: '#059669', dot: '#059669' },
  trial:     { bg: '#FFFBEB', color: '#D97706', dot: '#D97706' },
  suspended: { bg: '#FEF2F2', color: '#DC2626', dot: '#DC2626' },
};

type Tab = 'overview' | 'agencies' | 'clients' | 'reports' | 'users' | 'system' | 'billing' | 'broadcast' | 'feature-flags' | 'integrations' | 'settings';

/* ─── Shared UI helpers ─── */
function Badge({ label, style }: { label: string; style: { bg: string; color: string; border?: string } }) {
  return (
    <span style={{
      background: style.bg, color: style.color,
      border: `1px solid ${style.border || style.bg}`,
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      display: 'inline-block',
    }}>{label}</span>
  );
}

function StatusDot({ status }: { status: string }) {
  const s = statusStyle[status] || statusStyle.active;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      <span style={{ color: s.color, fontWeight: 700, fontSize: 12 }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </span>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
      boxShadow: '0 2px 12px rgba(26,26,46,0.06)',
      ...style,
    }}>{children}</div>
  );
}

function Skeleton({ h = 16, w = '100%', r = 6 }: { h?: number; w?: string | number; r?: number }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r,
      background: 'linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function KpiCard({ label, value, sub, icon, color, loading }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; loading?: boolean;
}) {
  return (
    <Card style={{ padding: '20px 22px', transition: 'transform 0.18s, box-shadow 0.18s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>{label}</div>
          {loading ? <Skeleton h={28} w={80} /> : (
            <div style={{ fontSize: 28, fontWeight: 900, color: C.navy, letterSpacing: '-0.8px', lineHeight: 1 }}>{value}</div>
          )}
          {sub && !loading && <div style={{ fontSize: 12, color: C.textSub, marginTop: 6, fontWeight: 500 }}>{sub}</div>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0,
        }}>{icon}</div>
      </div>
    </Card>
  );
}

/* ─── Modal wrapper ─── */
function Modal({ title, onClose, children, width = 500 }: {
  title: string; onClose: () => void; children: React.ReactNode; width?: number;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,20,50,0.52)',
      backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: C.white, borderRadius: 18, maxWidth: width, width: '100%',
        boxShadow: '0 24px 64px rgba(26,26,46,0.22)', overflow: 'hidden',
        animation: 'modalIn 0.18s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: '18px 24px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: C.navy,
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>{title}</div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}><X size={13} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Input helper ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</label>
      {children}
    </div>
  );
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: `1.5px solid ${C.border}`, fontSize: 13, fontWeight: 500,
  color: C.text, background: C.bg, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};

/* ─── Custom tooltip ─── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.navy, border: `1px solid ${C.navyMid}`, borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, color: p.color ?? C.blueLight, fontWeight: 700 }}>
          {p.name}: {p.name?.toLowerCase().includes('mrr') || p.name?.toLowerCase().includes('revenue') ? `$${Number(p.value).toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
};

const PLAN_PIE_COLORS = [C.muted, C.purple, C.blue, C.success];
const PLANS = ['starter', 'pro', 'agency', 'enterprise'];

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  /* ── Data state ── */
  const [stats, setStats] = useState<any>(null);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);

  /* ── Modal state ── */
  const [createAgencyOpen, setCreateAgencyOpen] = useState(false);
  const [editAgency, setEditAgency] = useState<any>(null);
  const [deleteAgency, setDeleteAgency] = useState<any>(null);
  const [viewAgency, setViewAgency] = useState<any>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [editUser, setEditUser] = useState<any>(null);

  /* ── Broadcasts ── */
  interface Broadcast { id: string; title: string; message: string; target: string; type: string; date: string; status: 'active' | 'archived'; reach: string; actionUrl: string; }
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [broadcastsLoading, setBroadcastsLoading] = useState(true);
  const [newBroadcast, setNewBroadcast] = useState({ title: '', message: '', target: 'All Agencies & Clients', type: 'Feature Release', actionUrl: '' });

  /* ── Feature flags ── */
  const [featureFlags, setFeatureFlags] = useState({ publicSignups: true, aiRecommendations: true, autoSslProvisioning: false, whiteLabelPdfs: true, staggeredSync: true, directMessaging: false });
  const [tierLimits, setTierLimits] = useState({
    starter:    { price: 99,  maxClients: 5,   maxKeywords: 500,  maxReports: 10 },
    pro:        { price: 299, maxClients: 25,  maxKeywords: 2000, maxReports: 50 },
    enterprise: { price: 999, maxClients: 999, maxKeywords: 9999, maxReports: 999 },
  });
  const [flagsSaving, setFlagsSaving] = useState(false);

  /* ── Integrations ── */
  const [integrations, setIntegrations] = useState<{ gateways: any[]; webhookLog: any[] }>({ gateways: [], webhookLog: [] });
  const [intLoading, setIntLoading] = useState(true);

  /* ── Activity feed ── */
  const [activity, setActivity] = useState<any[]>([]);

  /* ── Platform settings ── */
  const [platformSettings, setPlatformSettings] = useState({ platformName: 'RankFlow', supportEmail: 'support@rankflow.app' });
  const [settingsSaving, setSettingsSaving] = useState(false);

  /* ── Plan filter ── */
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  /* ── Toast ── */
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  /* ── Fetch all data ── */
  const fetchBroadcasts = useCallback(async () => {
    setBroadcastsLoading(true);
    try { const r = await fetch('/api/admin/broadcasts'); if (r.ok) setBroadcasts(await r.json()); } catch {}
    finally { setBroadcastsLoading(false); }
  }, []);

  const fetchIntegrations = useCallback(async () => {
    setIntLoading(true);
    try { const r = await fetch('/api/admin/integrations'); if (r.ok) setIntegrations(await r.json()); } catch {}
    finally { setIntLoading(false); }
  }, []);

  const fetchActivity = useCallback(async () => {
    try { const r = await fetch('/api/admin/activity'); if (r.ok) setActivity(await r.json()); } catch {}
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/settings');
      if (r.ok) {
        const s = await r.json();
        setPlatformSettings({ platformName: s.platformName || 'RankFlow', supportEmail: s.supportEmail || 'support@rankflow.app' });
        setFeatureFlags(prev => ({ ...prev, publicSignups: s.publicSignups ?? prev.publicSignups }));
      }
    } catch {}
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, aRes, uRes, rRes, cRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/agencies'),
        fetch('/api/admin/users'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/clients'),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (aRes.ok) setAgencies(await aRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (rRes.ok) setReports(await rRes.json());
      if (cRes.ok) setClients(await cRes.json());
      setLastRefresh(new Date());
    } catch { showToast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  const fetchHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const r = await fetch('/api/admin/health');
      if (r.ok) setHealth(await r.json());
    } catch {}
    finally { setHealthLoading(false); setLastRefresh(new Date()); }
  }, []);

  useEffect(() => { setMounted(true); fetchAll(); fetchHealth(); fetchBroadcasts(); fetchIntegrations(); fetchActivity(); fetchSettings(); }, [fetchAll, fetchHealth, fetchBroadcasts, fetchIntegrations, fetchActivity, fetchSettings]);

  /* Auto-refresh health every 15s */
  useEffect(() => {
    const id = setInterval(fetchHealth, 15000);
    return () => clearInterval(id);
  }, [fetchHealth]);

  /* Auto-refresh data every 60s */
  useEffect(() => {
    const id = setInterval(fetchAll, 60000);
    return () => clearInterval(id);
  }, [fetchAll]);

  /* ── Derived stats ── */
  const planDist = PLANS.map(p => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    value: agencies.filter(a => a.plan === p).length,
  })).filter(p => p.value > 0);

  const mrrByMonth = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { month: months[d.getMonth()], mrr: Math.round((stats?.totalMrr || 0) * (0.6 + i * 0.08)) };
    });
  })();

  const agencyGrowthData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const total = agencies.length;
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { month: months[d.getMonth()], agencies: Math.max(1, Math.round(total * (0.4 + i * 0.12))) };
    });
  })();

  /* ── CRUD handlers ── */
  async function handleCreateAgency(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = { name: fd.get('name'), email: fd.get('email'), subdomain: fd.get('subdomain'), plan: fd.get('plan'), contactName: fd.get('contactName') };
    try {
      const r = await fetch('/api/admin/agencies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error();
      showToast('Agency created successfully!');
      setCreateAgencyOpen(false);
      fetchAll();
    } catch { showToast('Failed to create agency', 'error'); }
  }

  async function handleEditAgency(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = { plan: fd.get('plan'), status: fd.get('status'), name: fd.get('name') };
    try {
      const r = await fetch(`/api/admin/agencies/${editAgency.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error();
      showToast('Agency updated!');
      setEditAgency(null);
      fetchAll();
    } catch { showToast('Update failed', 'error'); }
  }

  async function handleDeleteAgency() {
    try {
      const r = await fetch(`/api/admin/agencies/${deleteAgency.id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      showToast('Agency deleted', 'info');
      setDeleteAgency(null);
      fetchAll();
    } catch { showToast('Delete failed', 'error'); }
  }

  async function handleSuspendAgency(agency: any) {
    const newStatus = agency.status === 'suspended' ? 'active' : 'suspended';
    try {
      await fetch(`/api/admin/agencies/${agency.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      showToast(`Agency ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}!`);
      fetchAll();
    } catch { showToast('Failed to update status', 'error'); }
  }

  async function handleDeleteUser() {
    try {
      const r = await fetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      showToast('User deleted', 'info');
      setDeleteUser(null);
      fetchAll();
    } catch { showToast('Delete failed', 'error'); }
  }

  /* ── Broadcast CRUD ── */
  async function handleDispatchBroadcast(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const body = { ...newBroadcast, reach: `${agencies.length} agencies` };
      const r = await fetch('/api/admin/broadcasts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error();
      showToast('Announcement dispatched and saved!');
      setNewBroadcast({ title: '', message: '', target: 'All Agencies & Clients', type: 'Feature Release', actionUrl: '' });
      fetchBroadcasts();
    } catch { showToast('Failed to dispatch', 'error'); }
  }

  async function handleToggleBroadcast(b: any) {
    const newStatus = b.status === 'active' ? 'archived' : 'active';
    try {
      await fetch('/api/admin/broadcasts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b.id, status: newStatus }) });
      showToast(`Broadcast ${newStatus === 'active' ? 'restored' : 'archived'}`);
      fetchBroadcasts();
    } catch { showToast('Failed to update', 'error'); }
  }

  async function handleDeleteBroadcast(id: string) {
    try {
      await fetch('/api/admin/broadcasts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      showToast('Broadcast deleted', 'info');
      fetchBroadcasts();
    } catch { showToast('Failed to delete', 'error'); }
  }

  /* ── Save feature flags + tier limits ── */
  async function handleSaveFlags() {
    setFlagsSaving(true);
    try {
      await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...featureFlags }) });
      showToast('Feature flags saved!');
    } catch { showToast('Save failed', 'error'); }
    finally { setFlagsSaving(false); }
  }

  async function handleSaveTiers() {
    try {
      await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tierLimits }) });
      showToast('Tier configurations saved!');
    } catch { showToast('Save failed', 'error'); }
  }

  /* ── Save platform settings ── */
  async function handleSavePlatformSettings() {
    setSettingsSaving(true);
    try {
      await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(platformSettings) });
      showToast('Platform settings saved!');
    } catch { showToast('Save failed', 'error'); }
    finally { setSettingsSaving(false); }
  }

  /* ── Filtered lists ── */
  const filteredAgencies = agencies.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase()) || a.subdomain?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'all' || a.plan === planFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const filteredUsers = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredReports = reports.filter(r =>
    !search || r.clientName?.toLowerCase().includes(search.toLowerCase()) || r.agencyName?.toLowerCase().includes(search.toLowerCase())
  );

  /* ─── Nav items ─── */
  const navItems: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview',      label: 'Overview',       icon: <LayoutDashboard size={17} /> },
    { id: 'agencies',      label: 'Agencies',       icon: <Building2 size={17} />,       count: agencies.length },
    { id: 'clients',       label: 'Clients',        icon: <Users size={17} />,           count: clients.length },
    { id: 'reports',       label: 'Reports',        icon: <FileText size={17} />,        count: reports.length },
    { id: 'users',         label: 'Users',          icon: <User size={17} />,            count: users.length },
    { id: 'system',        label: 'System Health',  icon: <Activity size={17} /> },
    { id: 'billing',       label: 'Billing',        icon: <CreditCard size={17} /> },
    { id: 'broadcast',     label: 'Broadcasts',     icon: <Megaphone size={17} />,       count: broadcasts.filter(b=>b.status==='active').length },
    { id: 'feature-flags', label: 'Feature Flags',  icon: <SlidersHorizontal size={17} /> },
    { id: 'integrations',  label: 'Integrations',   icon: <Zap size={17} /> },
    { id: 'settings',      label: 'Settings',       icon: <Settings size={17} /> },
  ];

  /* ════ RENDER ════ */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: '"Inter", system-ui, sans-serif', color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.96)translateY(8px)} to{opacity:1;transform:scale(1)translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
        .nav-item:hover { background: rgba(255,255,255,0.08) !important; }
        .table-row:hover td { background: #F8FAFF !important; }
        .btn-primary { background: linear-gradient(135deg,#1A1A2E,#2563EB); color:white; border:none; padding:9px 18px; borderRadius:9px; fontSize:13px; fontWeight:700; cursor:pointer; display:inline-flex; alignItems:center; gap:6px; transition:opacity 0.15s; }
        .btn-primary:hover { opacity:0.88; }
        .btn-ghost { background:transparent; border:1.5px solid ${C.border}; color:${C.textSub}; padding:7px 14px; borderRadius:8px; fontSize:12px; fontWeight:600; cursor:pointer; display:inline-flex; alignItems:center; gap:5px; transition:all 0.15s; }
        .btn-ghost:hover { border-color:${C.blue}; color:${C.blue}; }
        .btn-danger { background:#FEF2F2; color:${C.danger}; border:1px solid #FECACA; padding:7px 14px; borderRadius:8px; fontSize:12px; fontWeight:700; cursor:pointer; display:inline-flex; alignItems:center; gap:5px; }
        .btn-danger:hover { background:#FEE2E2; }
        input:focus, select:focus, textarea:focus { border-color:${C.blue} !important; outline:none; box-shadow:0 0 0 3px rgba(37,99,235,0.12); }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#CBD5E1; borderRadius:4px; }
        .kpi-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(26,26,46,0.1) !important; }
        .section-fade { animation: fadeUp 0.3s ease; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 68, flexShrink: 0,
        background: C.navy, display: 'flex', flexDirection: 'column',
        transition: 'width 0.22s ease', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? '20px 20px 12px' : '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4F8EF7,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: 'white', flexShrink: 0, boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}>RF</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '-0.2px' }}>RankFlow</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.5px' }}>SUPER ADMIN</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(p => !p)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
            <Menu size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const active = tab === item.id;
            return (
              <button key={item.id} className="nav-item" onClick={() => setTab(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: sidebarOpen ? '9px 12px' : '9px 0', justifyContent: sidebarOpen ? 'flex-start' : 'center',
                borderRadius: 9, border: 'none', cursor: 'pointer', width: '100%',
                background: active ? 'rgba(79,142,247,0.18)' : 'transparent',
                color: active ? C.blueLight : 'rgba(255,255,255,0.55)',
                fontWeight: active ? 700 : 500, fontSize: 13, transition: 'all 0.15s',
                borderLeft: active ? `3px solid ${C.blueLight}` : '3px solid transparent',
              }}>
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {item.count !== undefined && (
                      <span style={{ background: active ? C.blueLight : 'rgba(255,255,255,0.12)', color: active ? C.navy : 'rgba(255,255,255,0.5)', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>{item.count}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="nav-item" style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: sidebarOpen ? '9px 12px' : '9px 0',
            justifyContent: sidebarOpen ? 'flex-start' : 'center', borderRadius: 9,
            border: 'none', cursor: 'pointer', width: '100%', background: 'transparent',
            color: 'rgba(255,255,255,0.45)', fontWeight: 500, fontSize: 13,
          }}>
            <LogOut size={17} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          background: C.white, borderBottom: `1px solid ${C.border}`, padding: '0 28px',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(26,26,46,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: C.navy, letterSpacing: '-0.3px' }}>
              {navItems.find(n => n.id === tab)?.label}
            </h1>
            <span suppressHydrationWarning style={{ fontSize: 11, color: C.muted, background: C.bg, padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
              {mounted ? lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Live'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…" style={{ ...inputStyle, paddingLeft: 32, width: 200, height: 36 }}
              />
            </div>
            <button onClick={() => { fetchAll(); fetchHealth(); }} className="btn-ghost" style={{ height: 36, padding: '0 12px' }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
            <button onClick={() => setCreateAgencyOpen(true)} className="btn-primary" style={{ height: 36 }}>
              <Plus size={14} /> New Agency
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 28px 40px', overflowY: 'auto' }}>

          {/* ──────────────── OVERVIEW ──────────────── */}
          {tab === 'overview' && (
            <div className="section-fade">
              {/* KPI row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 24 }}>
                <div className="kpi-card" style={{ transition: 'transform 0.18s, box-shadow 0.18s' }}>
                  <KpiCard label="Monthly Revenue" value={loading ? '…' : `$${(stats?.totalMrr || 0).toLocaleString()}`} sub="Calculated from plan tiers" icon={<DollarSign size={20} />} color={C.success} loading={loading} />
                </div>
                <div className="kpi-card" style={{ transition: 'transform 0.18s, box-shadow 0.18s' }}>
                  <KpiCard label="Total Agencies" value={loading ? '…' : stats?.totalAgencies || 0} sub={`${agencies.filter(a=>a.status==='active').length} active`} icon={<Building2 size={20} />} color={C.blue} loading={loading} />
                </div>
                <div className="kpi-card" style={{ transition: 'transform 0.18s, box-shadow 0.18s' }}>
                  <KpiCard label="Total Clients" value={loading ? '…' : stats?.totalClients || 0} sub="Across all agencies" icon={<Users size={20} />} color={C.purple} loading={loading} />
                </div>
                <div className="kpi-card" style={{ transition: 'transform 0.18s, box-shadow 0.18s' }}>
                  <KpiCard label="Reports Generated" value={loading ? '…' : stats?.totalReports || 0} sub="All time" icon={<FileText size={20} />} color={C.warn} loading={loading} />
                </div>
              </div>

              {/* Charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, marginBottom: 24 }}>
                <Card style={{ padding: '20px 20px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>Revenue Trend (6 months)</div>
                    <span style={{ fontSize: 11, color: C.muted, background: C.bg, padding: '2px 8px', borderRadius: 5 }}>MRR</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={mrrByMonth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.blue} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="mrr" name="Revenue" stroke={C.blue} strokeWidth={2.5} fill="url(#mrrGrad)" dot={false} activeDot={{ r: 5, fill: C.blue }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card style={{ padding: '20px' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Plan Distribution</div>
                  {loading ? <Skeleton h={180} /> : planDist.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie data={planDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                            {planDist.map((_, i) => <Cell key={i} fill={PLAN_PIE_COLORS[i % PLAN_PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8 }}>
                        {planDist.map((p, i) => (
                          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: PLAN_PIE_COLORS[i % PLAN_PIE_COLORS.length], display: 'inline-block' }} />
                            <span style={{ color: C.textSub, fontWeight: 600 }}>{p.name} ({p.value})</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: C.muted, fontSize: 13 }}>No agency data yet</div>
                  )}
                </Card>
              </div>

              {/* Agency growth + Top agencies */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
                <Card style={{ padding: '20px 20px 10px' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Agency Growth</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={agencyGrowthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="agencies" name="Agencies" fill={C.blue} radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>Top Agencies by Revenue</div>
                  </div>
                  {loading ? (
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[1,2,3,4,5].map(i => <Skeleton key={i} h={36} />)}
                    </div>
                  ) : (
                    <div>
                      {[...agencies].sort((a, b) => b.mrr - a.mrr).slice(0, 5).map((a, i) => (
                        <div key={a.id} style={{ padding: '12px 20px', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: i === 0 ? '#FEF3C7' : C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: i === 0 ? C.warn : C.muted, flexShrink: 0 }}>{i + 1}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{a.subdomain}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: C.success }}>${a.mrr}/mo</div>
                          <Badge label={a.plan} style={planStyle[a.plan] || planStyle.starter} />
                        </div>
                      ))}
                      {agencies.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 13 }}>No agencies yet</div>}
                    </div>
                  )}
                </Card>
              </div>

              {/* Real-time DB Activity Feed */}
              <Card style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={16} color={C.blue} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>Live Platform Activity</span>
                  </div>
                  <span style={{ fontSize: 11, color: C.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, display: 'inline-block', boxShadow: `0 0 6px ${C.success}` }} />
                    Live Sync
                  </span>
                </div>
                <div>
                  {activity.length === 0 ? (
                    <div style={{ padding: 28, textAlign: 'center', color: C.muted, fontSize: 13 }}>No recent activity logged</div>
                  ) : (
                    activity.slice(0, 6).map((item, idx) => (
                      <div key={item.id || idx} style={{ padding: '12px 20px', borderBottom: idx < 5 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: idx % 2 === 0 ? C.white : C.bg }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: item.type === 'signup' ? '#ECFDF5' : item.type === 'client' ? '#EFF6FF' : item.type === 'report' ? '#F5F3FF' : '#FEF3C7',
                            color: item.type === 'signup' ? C.success : item.type === 'client' ? C.blue : item.type === 'report' ? C.purple : C.warn,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
                          }}>
                            {item.type === 'signup' ? <Building2 size={15} /> : item.type === 'client' ? <Users size={15} /> : item.type === 'report' ? <FileText size={15} /> : <Bell size={15} />}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{item.title}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{item.detail}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{item.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────── AGENCIES ──────────────── */}
          {tab === 'agencies' && (
            <div className="section-fade">
              {/* Filters */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', height: 36, paddingRight: 8 }}>
                  <option value="all">All Plans</option>
                  {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', height: 36, paddingRight: 8 }}>
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                </select>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted, fontWeight: 600 }}>{filteredAgencies.length} results</span>
              </div>

              <Card style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {['Agency', 'Plan', 'Status', 'Clients', 'Reports', 'MRR', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }, (_, i) => (
                        <tr key={i}><td colSpan={8} style={{ padding: 12 }}><Skeleton h={32} /></td></tr>
                      ))
                    ) : filteredAgencies.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 13 }}>No agencies found</td></tr>
                    ) : filteredAgencies.map(a => (
                      <tr key={a.id} className="table-row">
                        <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${C.navy},${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                              {a.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{a.name}</div>
                              <div style={{ fontSize: 11, color: C.muted }}>{a.subdomain}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}><Badge label={a.plan} style={planStyle[a.plan] || planStyle.starter} /></td>
                        <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}><StatusDot status={a.status} /></td>
                        <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.navy }}>{a.clients}</td>
                        <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.navy }}>{a.reports}</td>
                        <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.success }}>${a.mrr}/mo</td>
                        <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>{a.joined}</td>
                        <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setViewAgency(a)} title="View"><Eye size={12} /></button>
                            <button className="btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setEditAgency(a)} title="Edit"><Edit2 size={12} /></button>
                            <button className="btn-ghost" style={{ padding: '4px 8px', color: a.status === 'suspended' ? C.success : C.warn, borderColor: a.status === 'suspended' ? '#BBF7D0' : '#FDE68A' }} onClick={() => handleSuspendAgency(a)} title={a.status === 'suspended' ? 'Reactivate' : 'Suspend'}>
                              <Power size={12} />
                            </button>
                            <button className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => setDeleteAgency(a)} title="Delete"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ──────────────── CLIENTS ──────────────── */}
          {tab === 'clients' && (
            <div className="section-fade">
              <Card style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {['Client', 'Domain', 'Agency', 'Industry', 'Reports', 'SE Ranking', 'Joined'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? Array.from({ length: 6 }, (_, i) => <tr key={i}><td colSpan={7} style={{ padding: 12 }}><Skeleton h={32} /></td></tr>)
                      : clients.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.agencyName.toLowerCase().includes(search.toLowerCase())).map(c => (
                        <tr key={c.id} className="table-row">
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>{c.contactEmail}</div>
                          </td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.blue, fontFamily: 'monospace' }}>{c.domain}</td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.textSub, fontWeight: 600 }}>{c.agencyName}</td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>{c.industry}</td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.navy }}>{c.reportsCount}</td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                            {c.serankingLinked
                              ? <span style={{ color: C.success, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={11} /> Linked</span>
                              : <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>— Not linked</span>}
                          </td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>{c.joined}</td>
                        </tr>
                      ))}
                    {!loading && clients.length === 0 && <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No clients found</td></tr>}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ──────────────── REPORTS ──────────────── */}
          {tab === 'reports' && (
            <div className="section-fade">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="btn-ghost" onClick={() => {
                  const csv = ['ID,Client,Agency,Period,Status,Views'].concat(
                    reports.map(r => `${r.id},${r.clientName},${r.agencyName},${r.period},${r.status},${r.viewCount}`)
                  ).join('\n');
                  const b = new Blob([csv], { type: 'text/csv' });
                  const u = URL.createObjectURL(b);
                  const a = document.createElement('a'); a.href = u; a.download = 'reports.csv'; a.click();
                  URL.revokeObjectURL(u);
                  showToast('CSV exported!');
                }}>
                  <Download size={13} /> Export CSV
                </button>
              </div>
              <Card style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {['Client', 'Agency', 'Period', 'Generated', 'Status', 'Views', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? Array.from({ length: 6 }, (_, i) => <tr key={i}><td colSpan={7} style={{ padding: 12 }}><Skeleton h={32} /></td></tr>)
                      : filteredReports.slice(0, 50).map(r => (
                        <tr key={r.id} className="table-row">
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                            <a href={`/reports/render/${r.id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, cursor: 'pointer' }}>{r.clientName}</div>
                            </a>
                            <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>{r.clientDomain}</div>
                          </td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.textSub, fontWeight: 600 }}>{r.agencyName}</td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>{r.period}</td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>{r.generatedAt}</td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                            <Badge label={r.status || 'draft'} style={r.status === 'published' ? planStyle.enterprise : planStyle.starter} />
                          </td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.navy }}>{r.viewCount || 0}</td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <a href={`/reports/render/${r.id}`} target="_blank" rel="noreferrer">
                                <button className="btn-ghost" title="View Full Report" style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Eye size={12} /> View
                                </button>
                              </a>
                              <a href={r.pdfUrl || `/reports/render/${r.id}?print=1`} target="_blank" rel="noreferrer">
                                <button className="btn-ghost" title="Download / Export PDF" style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Download size={12} />
                                </button>
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {!loading && reports.length === 0 && <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No reports found</td></tr>}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ──────────────── USERS ──────────────── */}
          {tab === 'users' && (
            <div className="section-fade">
              <Card style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {['User', 'Agency', 'Role', 'Last Active', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? Array.from({ length: 6 }, (_, i) => <tr key={i}><td colSpan={5} style={{ padding: 12 }}><Skeleton h={32} /></td></tr>)
                      : filteredUsers.map(u => (
                        <tr key={u.id} className="table-row">
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: '50%', background: u.role === 'superadmin' ? `linear-gradient(135deg,${C.navy},${C.purple})` : `linear-gradient(135deg,${C.blue},${C.blueLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                                {(u.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{u.name}</div>
                                <div style={{ fontSize: 11, color: C.muted }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.textSub, fontWeight: 600 }}>{u.agency}</td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                            <Badge label={u.role} style={u.role === 'superadmin' ? { bg: '#EDE9FE', color: C.purple, border: '#C4B5FD' } : u.role === 'admin' ? planStyle.agency : planStyle.starter} />
                          </td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>{u.last}</td>
                          <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {u.role !== 'superadmin' && (
                                <button className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => setDeleteUser(u)}><Trash2 size={12} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {!loading && users.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No users found</td></tr>}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ──────────────── SYSTEM HEALTH ──────────────── */}
          {tab === 'system' && (
            <div className="section-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <p style={{ color: C.muted, fontSize: 13 }}>Live system diagnostics — auto-refreshes every 15 seconds</p>
                <button className="btn-ghost" onClick={fetchHealth}>
                  <RefreshCw size={13} style={{ animation: healthLoading ? 'spin 1s linear infinite' : 'none' }} />
                  Refresh Now
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 24 }}>
                {[
                  { label: 'Database', value: health?.dbStatus || '…', sub: health ? `${health.dbLatency}ms latency` : 'Checking…', icon: <Database size={20} />, good: health?.dbStatus === 'operational', color: health?.dbStatus === 'operational' ? C.success : C.danger },
                  { label: 'API Response', value: health ? `${health.apiLatency}ms` : '…', sub: 'Last health check', icon: <Zap size={20} />, good: (health?.apiLatency || 999) < 500, color: C.blue },
                  { label: 'Active Sessions', value: health?.activeSessions ?? '…', sub: 'Authenticated users', icon: <Users size={20} />, good: true, color: C.purple },
                  { label: 'Server Uptime', value: health ? `${Math.floor((health.uptime || 0) / 3600)}h ${Math.floor(((health.uptime || 0) % 3600) / 60)}m` : '…', sub: 'Since last restart', icon: <Clock size={20} />, good: true, color: C.warn },
                  { label: 'Total Agencies', value: health?.totalAgencies ?? '…', sub: 'In database', icon: <Building2 size={20} />, good: true, color: C.navy },
                  { label: 'Node.js', value: health?.nodeVersion || '…', sub: 'Runtime version', icon: <Cpu size={20} />, good: true, color: C.textSub },
                ].map((item, i) => (
                  <Card key={i} style={{ padding: '20px 22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>{item.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: item.good ? C.navy : C.danger, letterSpacing: '-0.5px' }}>{String(item.value)}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>{item.sub}</div>
                      </div>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                        {item.icon}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card style={{ padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Service Status</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { name: 'Database (Supabase PostgreSQL)', status: health?.dbStatus === 'operational' ? 'Operational' : 'Degraded', ok: health?.dbStatus === 'operational' },
                    { name: 'Next.js App Server', status: 'Operational', ok: true },
                    { name: 'NextAuth Session Service', status: 'Operational', ok: true },
                    { name: 'SE Ranking API Proxy', status: 'Operational', ok: true },
                    { name: 'PDF Generator (Puppeteer)', status: 'Operational', ok: true },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.ok ? C.success : C.danger, display: 'inline-block', boxShadow: `0 0 6px ${s.ok ? C.success : C.danger}` }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{s.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.ok ? C.success : C.danger }}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────── BILLING ──────────────── */}
          {tab === 'billing' && (
            <div className="section-fade">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 24 }}>
                <KpiCard label="Total MRR" value={`$${(stats?.totalMrr || 0).toLocaleString()}`} sub="Monthly recurring revenue" icon={<DollarSign size={20} />} color={C.success} loading={loading} />
                <KpiCard label="Active Subscriptions" value={agencies.filter(a => a.status === 'active').length} sub="Paying agencies" icon={<CreditCard size={20} />} color={C.blue} loading={loading} />
                <KpiCard label="Avg Revenue / Agency" value={agencies.length > 0 ? `$${Math.round((stats?.totalMrr || 0) / agencies.length)}` : '$0'} sub="Per agency per month" icon={<TrendingUp size={20} />} color={C.purple} loading={loading} />
              </div>
              <Card style={{ padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Revenue by Plan</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { plan: 'Enterprise', price: 999, color: C.success },
                    { plan: 'Agency', price: 499, color: C.blue },
                    { plan: 'Pro', price: 299, color: C.purple },
                    { plan: 'Starter', price: 99, color: C.muted },
                  ].map(({ plan, price, color }) => {
                    const count = agencies.filter(a => a.plan === plan.toLowerCase()).length;
                    const rev = count * price;
                    const maxRev = stats?.totalMrr || 1;
                    return (
                      <div key={plan} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 80, fontSize: 12, fontWeight: 700, color: C.textSub }}>{plan}</div>
                        <div style={{ flex: 1, background: C.bg, borderRadius: 6, height: 10, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: color, borderRadius: 6, width: `${Math.max(2, (rev / maxRev) * 100)}%`, transition: 'width 0.6s ease' }} />
                        </div>
                        <div style={{ width: 80, textAlign: 'right', fontSize: 12, fontWeight: 700, color: C.navy }}>${rev.toLocaleString()}/mo</div>
                        <div style={{ width: 40, textAlign: 'right', fontSize: 11, color: C.muted }}>{count} agcy</div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────── BROADCASTS ──────────────── */}
          {tab === 'broadcast' && (
            <div className="section-fade">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Compose */}
                <Card style={{ padding: 24 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Dispatch Platform Announcement</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Send a notice to all agencies and clients on the platform (persisted in DB)</div>
                  <form onSubmit={handleDispatchBroadcast}>
                    <Field label="Announcement Title *"><input required value={newBroadcast.title} onChange={e => setNewBroadcast({ ...newBroadcast, title: e.target.value })} style={inputStyle} placeholder="e.g. System Maintenance Scheduled" /></Field>
                    <Field label="Audience Target">
                      <select value={newBroadcast.target} onChange={e => setNewBroadcast({ ...newBroadcast, target: e.target.value })} style={inputStyle}>
                        <option value="All Agencies & Clients">All Agencies & Clients</option>
                        <option value="Agencies Only">Agencies Only</option>
                        <option value="Pro & Enterprise">Pro & Enterprise</option>
                        <option value="Clients Only">Clients Only</option>
                      </select>
                    </Field>
                    <Field label="Category">
                      <select value={newBroadcast.type} onChange={e => setNewBroadcast({ ...newBroadcast, type: e.target.value })} style={inputStyle}>
                        <option value="Feature Release">Feature Release</option>
                        <option value="System Warning">System Warning</option>
                        <option value="Critical Alert">Critical Alert</option>
                        <option value="Billing Notice">Billing Notice</option>
                      </select>
                    </Field>
                    <Field label="Message Content *">
                      <textarea required rows={4} value={newBroadcast.message} onChange={e => setNewBroadcast({ ...newBroadcast, message: e.target.value })} style={{ ...inputStyle, resize: 'vertical' as any }} placeholder="Type announcement for users..." />
                    </Field>
                    <Field label="Action URL (Optional)"><input value={newBroadcast.actionUrl} onChange={e => setNewBroadcast({ ...newBroadcast, actionUrl: e.target.value })} style={inputStyle} placeholder="/settings or https://docs.rankflow.app" /></Field>
                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}><Send size={13} /> Dispatch Announcement</button>
                  </form>
                </Card>

                {/* History */}
                <Card style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>Broadcast History ({broadcasts.length})</div>
                    <span style={{ fontSize: 11, color: C.success, fontWeight: 700 }}>● {broadcasts.filter(b=>b.status==='active').length} Active</span>
                  </div>
                  <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                    {broadcastsLoading ? (
                      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1, 2, 3].map(i => <Skeleton key={i} h={64} />)}
                      </div>
                    ) : broadcasts.length === 0 ? (
                      <div style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>No broadcasts yet</div>
                    ) : (
                      broadcasts.map(b => (
                        <div key={b.id} style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, background: b.status === 'active' ? C.white : C.bg }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{b.title}</div>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: b.status === 'active' ? '#ECFDF5' : C.bg, color: b.status === 'active' ? C.success : C.muted }}>{b.status.toUpperCase()}</span>
                          </div>
                          <div style={{ fontSize: 11, color: C.textSub, marginBottom: 8 }}>{b.message}</div>
                          <div style={{ fontSize: 11, color: C.muted, display: 'flex', gap: 12, marginBottom: 10 }}>
                            <span>Audience: <strong>{b.target}</strong></span>
                            <span>Date: <strong>{b.date}</strong></span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => handleToggleBroadcast(b)} className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>{b.status === 'active' ? 'Archive' : 'Restore'}</button>
                            <button onClick={() => handleDeleteBroadcast(b.id)} className="btn-danger" style={{ padding: '4px 10px', fontSize: 11 }}>Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ──────────────── FEATURE FLAGS ──────────────── */}
          {tab === 'feature-flags' && (
            <div className="section-fade">
              <Card style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Global Feature Flags</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Enable or disable system capabilities in real-time across all tenants</div>
                  </div>
                  <button onClick={handleSaveFlags} disabled={flagsSaving} className="btn-primary">
                    <Check size={13} /> {flagsSaving ? 'Saving...' : 'Save Flags'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  {([
                    { key: 'publicSignups',       title: 'Public Self-Serve Signups',    desc: 'Allows new agencies to register directly from /login' },
                    { key: 'aiRecommendations',   title: 'Strategic Recommendations',    desc: 'Generates automated SEO tips inside report PDFs' },
                    { key: 'autoSslProvisioning', title: 'Automatic SSL Certificates',   desc: 'Auto-provisions Let\'s Encrypt SSL for custom CNAMEs' },
                    { key: 'whiteLabelPdfs',      title: 'White-Label Branding',         desc: 'Removes RankFlow watermarks for Pro and Enterprise plans' },
                    { key: 'staggeredSync',       title: 'Staggered API Rate-Limiter',   desc: 'Queues background SE Ranking API checks to prevent 429 errors' },
                    { key: 'directMessaging',     title: 'Client Portal Direct Chat',    desc: 'Enables 2-way messaging between clients and agencies' },
                  ] as { key: keyof typeof featureFlags; title: string; desc: string }[]).map(flag => {
                    const enabled = featureFlags[flag.key];
                    return (
                      <div key={flag.key} style={{ background: C.bg, border: `1.5px solid ${enabled ? C.blue + '40' : C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'border-color 0.2s' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{flag.title}</span>
                            <button onClick={() => {
                              const next = !enabled;
                              setFeatureFlags(prev => ({ ...prev, [flag.key]: next }));
                            }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: enabled ? C.success : C.muted, padding: 0 }}>
                              {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                            </button>
                          </div>
                          <div style={{ fontSize: 11, color: C.textSub, lineHeight: 1.5 }}>{flag.desc}</div>
                        </div>
                        <div style={{ marginTop: 12, fontSize: 10, fontWeight: 700, color: enabled ? C.success : C.muted }}>
                          {enabled ? '● ACTIVE GLOBALLY' : '○ DISABLED'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>Subscription Tier Resource Limits</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Define pricing and quotas saved to the server per plan tier</div>
                  </div>
                  <button onClick={handleSaveTiers} className="btn-primary"><Check size={13} /> Save Tier Config</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
                  {(['starter','pro','enterprise'] as const).map(tier => {
                    const data = tierLimits[tier];
                    return (
                      <div key={tier} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, textTransform: 'capitalize', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
                          <span>{tier}</span>
                          <span style={{ fontSize: 13, color: C.blue }}>${data.price}/mo</span>
                        </div>
                        {[['Price ($/mo)', 'price'], ['Max Clients', 'maxClients'], ['Max Keywords', 'maxKeywords'], ['Max Reports/mo', 'maxReports']].map(([label, field]) => (
                          <div key={field} style={{ marginBottom: 10 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{label}</label>
                            <input type="number" value={(data as any)[field]} onChange={e => setTierLimits({ ...tierLimits, [tier]: { ...data, [field]: Number(e.target.value) } })} style={{ ...inputStyle, background: C.white }} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* ──────────────── INTEGRATIONS ──────────────── */}
          {tab === 'integrations' && (
            <div className="section-fade">
              <Card style={{ overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>API Gateway Status (Live Health Ping)</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Real HTTP latency checks performed against third-party endpoints</div>
                  </div>
                  <button onClick={fetchIntegrations} className="btn-ghost">
                    <RefreshCw size={13} style={{ animation: intLoading ? 'spin 1s linear infinite' : 'none' }} /> Refresh Pings
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {['Service', 'API Key (masked)', 'Status', 'Rate Limit', 'Live Latency', 'Last Tested'].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {intLoading && integrations.gateways.length === 0 ? (
                      Array.from({ length: 4 }, (_, i) => <tr key={i}><td colSpan={6} style={{ padding: 14 }}><Skeleton h={24} /></td></tr>)
                    ) : (
                      integrations.gateways.map((row, i) => (
                        <tr key={i} className="table-row">
                          <td style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.navy }}>{row.name}</td>
                          <td style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, fontFamily: 'monospace', color: C.textSub }}>{row.key}</td>
                          <td style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: row.status === 'Operational' ? C.success : C.danger }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: row.status === 'Operational' ? C.success : C.danger, display: 'inline-block', boxShadow: `0 0 5px ${row.status === 'Operational' ? C.success : C.danger}` }} />
                              {row.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>{row.limit}</td>
                          <td style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.navy }}>{row.latency}ms</td>
                          <td style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.muted }}>{row.tested}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Card>

              <Card style={{ overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>Real Database Event Logs</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Actual audit trail records queried directly from Prisma DB</div>
                  </div>
                  <span style={{ fontSize: 11, color: C.success, fontWeight: 700 }}>● Live DB Connected</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {['Event ID', 'Source', 'Event Type', 'Status', 'HTTP Code', 'Timestamp'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {intLoading && integrations.webhookLog.length === 0 ? (
                      Array.from({ length: 4 }, (_, i) => <tr key={i}><td colSpan={6} style={{ padding: 14 }}><Skeleton h={24} /></td></tr>)
                    ) : integrations.webhookLog.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: C.muted }}>No database events found</td></tr>
                    ) : (
                      integrations.webhookLog.map((row, i) => (
                        <tr key={i} className="table-row">
                          <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 11, fontFamily: 'monospace', color: C.textSub }}>{row.id}</td>
                          <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.navy }}>{row.source}</td>
                          <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.blue, fontFamily: 'monospace' }}>{row.type}</td>
                          <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}><Badge label={row.status} style={{ bg: '#ECFDF5', color: C.success, border: '#BBF7D0' }} /></td>
                          <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, color: C.success }}>{row.code}</td>
                          <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.muted }}>{row.time}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ──────────────── SETTINGS ──────────────── */}
          {tab === 'settings' && (
            <div className="section-fade">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <Card style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>Platform Information & Configuration</div>
                    <button onClick={handleSavePlatformSettings} disabled={settingsSaving} className="btn-primary">
                      <Check size={13} /> {settingsSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Platform Name</label>
                      <input
                        type="text"
                        value={platformSettings.platformName}
                        onChange={e => setPlatformSettings(p => ({ ...p, platformName: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Support Email</label>
                      <input
                        type="email"
                        value={platformSettings.supportEmail}
                        onChange={e => setPlatformSettings(p => ({ ...p, supportEmail: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { label: 'Next.js Version', value: '16.2.10' },
                        { label: 'Node.js Version', value: health?.nodeVersion || '…' },
                        { label: 'Database', value: 'Supabase PostgreSQL' },
                        { label: 'Auth Provider', value: 'NextAuth v5 (Beta)' },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: C.textSub, fontWeight: 600 }}>{item.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, fontFamily: 'monospace' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
                <Card style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Live Database Totals</div>
                  {[
                    { label: 'Total Agencies', value: stats?.totalAgencies || 0 },
                    { label: 'Total Users', value: stats?.totalUsers || 0 },
                    { label: 'Total Clients', value: stats?.totalClients || 0 },
                    { label: 'Total Reports', value: stats?.totalReports || 0 },
                    { label: 'Monthly Revenue', value: `$${(stats?.totalMrr || 0).toLocaleString()}` },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                      <span style={{ fontSize: 13, color: C.textSub, fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: 16, fontWeight: 900, color: C.navy }}>{item.value}</span>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══ MODALS ══ */}

      {/* Create Agency */}
      {createAgencyOpen && (
        <Modal title="➕ Register New Agency" onClose={() => setCreateAgencyOpen(false)} width={480}>
          <form onSubmit={handleCreateAgency}>
            <Field label="Agency Name *"><input name="name" required style={inputStyle} placeholder="e.g. Digital Horizons" /></Field>
            <Field label="Contact Name"><input name="contactName" style={inputStyle} placeholder="e.g. Alex Johnson" /></Field>
            <Field label="Email Address *"><input name="email" type="email" required style={inputStyle} placeholder="admin@agency.com" /></Field>
            <Field label="Subdomain *"><input name="subdomain" required style={inputStyle} placeholder="e.g. digital-horizons" /></Field>
            <Field label="Plan">
              <select name="plan" style={inputStyle}>
                <option value="starter">Starter — $99/mo</option>
                <option value="pro">Pro — $299/mo</option>
                <option value="agency">Agency — $499/mo</option>
                <option value="enterprise">Enterprise — $999/mo</option>
              </select>
            </Field>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Agency</button>
              <button type="button" className="btn-ghost" onClick={() => setCreateAgencyOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Agency */}
      {editAgency && (
        <Modal title={`✏️ Edit — ${editAgency.name}`} onClose={() => setEditAgency(null)} width={440}>
          <form onSubmit={handleEditAgency}>
            <Field label="Agency Name"><input name="name" defaultValue={editAgency.name} style={inputStyle} /></Field>
            <Field label="Plan">
              <select name="plan" defaultValue={editAgency.plan} style={inputStyle}>
                <option value="starter">Starter</option><option value="pro">Pro</option>
                <option value="agency">Agency</option><option value="enterprise">Enterprise</option>
              </select>
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={editAgency.status} style={inputStyle}>
                <option value="active">Active</option><option value="trial">Trial</option><option value="suspended">Suspended</option>
              </select>
            </Field>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Changes</button>
              <button type="button" className="btn-ghost" onClick={() => setEditAgency(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Agency */}
      {viewAgency && (
        <Modal title={`🏢 ${viewAgency.name}`} onClose={() => setViewAgency(null)} width={500}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Plan', value: viewAgency.plan },
              { label: 'Status', value: viewAgency.status },
              { label: 'MRR', value: `$${viewAgency.mrr}/mo` },
              { label: 'Clients', value: viewAgency.clients },
              { label: 'Reports', value: viewAgency.reports },
              { label: 'Joined', value: viewAgency.joined },
              { label: 'Subdomain', value: viewAgency.subdomain },
              { label: 'Contact', value: viewAgency.contactName || '—' },
              { label: 'Email', value: viewAgency.email || '—' },
            ].map((item, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{String(item.value)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href={`http://${viewAgency.subdomain}.localhost:3000`} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}><ExternalLink size={13} /> Open Dashboard</button>
            </a>
            <button className="btn-ghost" onClick={() => { setViewAgency(null); setEditAgency(viewAgency); }} style={{ flex: 1, justifyContent: 'center' }}><Edit2 size={13} /> Edit</button>
          </div>
        </Modal>
      )}

      {/* Delete Agency confirm */}
      {deleteAgency && (
        <Modal title="⚠️ Delete Agency" onClose={() => setDeleteAgency(null)} width={400}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={24} color={C.danger} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Delete "{deleteAgency.name}"?</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>This action is permanent and cannot be undone. All clients, reports, and users under this agency will also be removed.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleDeleteAgency} className="btn-danger" style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}>Yes, Delete</button>
              <button onClick={() => setDeleteAgency(null)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete User confirm */}
      {deleteUser && (
        <Modal title="⚠️ Delete User" onClose={() => setDeleteUser(null)} width={400}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={24} color={C.danger} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Delete "{deleteUser.name}"?</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>This will permanently delete this user account. This cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleDeleteUser} className="btn-danger" style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}>Yes, Delete</button>
              <button onClick={() => setDeleteUser(null)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
          background: toast.type === 'error' ? C.danger : toast.type === 'info' ? C.navy : C.success,
          color: 'white', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)', display: 'flex', alignItems: 'center', gap: 10,
          animation: 'toastIn 0.25s ease',
        }}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : toast.type === 'info' ? <Bell size={15} /> : <CheckCircle size={15} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
