'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Shield, Users, Building2, TrendingUp, DollarSign,
  Activity, AlertCircle, CheckCircle2, Server, Zap,
  RefreshCw, ChevronRight, ChevronLeft, Eye, MoreVertical, Globe,
  BarChart2, Lock, Settings, LogOut, Bell, Search,
  ArrowUpRight, ArrowDownRight, Database, Cpu,
  Download, X, Mail, Send, Check, UserPlus, ExternalLink,
  FileText, LayoutDashboard, CreditCard, Sliders, TrendingDown
} from 'lucide-react';

/* ─── Types ─── */
interface Agency {
  id: string;
  name: string;
  subdomain: string;
  plan: 'starter' | 'pro' | 'enterprise';
  clients: number;
  reports: number;
  status: 'active' | 'trial' | 'suspended';
  mrr: number;
  joined: string;
  email?: string;
  contactName?: string;
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  agency: string;
  role: 'superadmin' | 'admin' | 'member' | 'client';
  last: string;
  status: 'active' | 'inactive';
}

/* ─── Demo data ─── */
const mrrData = [
  { month: 'Jan', mrr: 12400 }, { month: 'Feb', mrr: 14800 },
  { month: 'Mar', mrr: 18200 }, { month: 'Apr', mrr: 16900 },
  { month: 'May', mrr: 21600 }, { month: 'Jun', mrr: 26800 },
];
const agencyGrowth = [
  { month: 'Jan', agencies: 8 }, { month: 'Feb', agencies: 11 },
  { month: 'Mar', agencies: 14 }, { month: 'Apr', agencies: 18 },
  { month: 'May', agencies: 23 }, { month: 'Jun', agencies: 29 },
];

const initialAgencies: Agency[] = [
  { id: '1', name: 'Digital Horizons', subdomain: 'demo', plan: 'pro', clients: 12, reports: 48, status: 'active', mrr: 299, joined: 'Jan 2024', email: 'admin@digitalhorizons.com', contactName: 'Alex Johnson' },
  { id: '2', name: 'GrowthPeak Agency', subdomain: 'growthpeak', plan: 'starter', clients: 4, reports: 14, status: 'active', mrr: 99, joined: 'Feb 2024', email: 'jake@growthpeak.com', contactName: 'Jake Andrews' },
  { id: '3', name: 'Nexus SEO', subdomain: 'nexusseo', plan: 'pro', clients: 21, reports: 87, status: 'active', mrr: 299, joined: 'Mar 2024', email: 'contact@nexusseo.com', contactName: 'Lisa Torres' },
  { id: '4', name: 'RankMaster Co', subdomain: 'rankmaster', plan: 'enterprise', clients: 63, reports: 248, status: 'active', mrr: 999, joined: 'Jan 2024', email: 'admin@rankmaster.co', contactName: 'David Park' },
  { id: '5', name: 'BlueOcean SEO', subdomain: 'blueocean', plan: 'starter', clients: 3, reports: 7, status: 'trial', mrr: 0, joined: 'Jun 2024', email: 'hello@blueocean.seo', contactName: 'Maria Chen' },
  { id: '6', name: 'VelocityRank', subdomain: 'velocityrank', plan: 'pro', clients: 9, reports: 33, status: 'suspended', mrr: 299, joined: 'Apr 2024', email: 'support@velocityrank.com', contactName: 'Tom Wilson' },
];

const initialUsers: PlatformUser[] = [
  { id: '1', name: 'Super Admin', email: 'superadmin@rankflow.app', agency: 'RankFlow Platform', role: 'superadmin', last: '2 min ago', status: 'active' },
  { id: '2', name: 'Demo Agency Admin', email: 'demo@rankflow.app', agency: 'Digital Horizons', role: 'admin', last: '1 hour ago', status: 'active' },
  { id: '3', name: 'Sarah Miller', email: 'client@acme.com', agency: 'Digital Horizons', role: 'client', last: '3 days ago', status: 'active' },
  { id: '4', name: 'Jake Andrews', email: 'jake@growthpeak.com', agency: 'GrowthPeak Agency', role: 'admin', last: '5 hours ago', status: 'active' },
  { id: '5', name: 'Lisa Torres', email: 'lisa@nexusseo.com', agency: 'Nexus SEO', role: 'member', last: '2 days ago', status: 'active' },
  { id: '6', name: 'David Park', email: 'admin@rankmaster.co', agency: 'RankMaster Co', role: 'admin', last: '30 min ago', status: 'active' },
  { id: '7', name: 'Maria Chen', email: 'hello@blueocean.seo', agency: 'BlueOcean SEO', role: 'admin', last: '1 day ago', status: 'active' },
];

/* ─── CSV Utility ─── */
function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ─── Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A2E', border: '1px solid rgba(79,142,247,0.3)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: '#6B7CA8', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, color: p.color ?? '#4F8EF7', fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('mrr') ? `$${p.value.toLocaleString()}` : p.value}
        </div>
      ))}
    </div>
  );
};

const planColors: Record<string, { bg: string; color: string }> = {
  starter: { bg: '#F1F5F9', color: '#64748B' },
  pro: { bg: '#EBF2FF', color: '#2563EB' },
  enterprise: { bg: '#F0FFF4', color: '#059669' },
};
const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: '#ECFDF5', color: '#059669' },
  trial: { bg: '#FFFBEB', color: '#D97706' },
  suspended: { bg: '#FEF2F2', color: '#DC2626' },
};

type Tab = 'overview' | 'agencies' | 'users' | 'system' | 'billing';

/* ─── Modal Component ─── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,10,20,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: 18, boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        maxWidth: 540, width: '100%', overflow: 'hidden', animation: 'modalIn 0.2s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E4E9F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E' }}>{title}</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #E4E9F2', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94A3B8' }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Agency Detail Modal ─── */
function AgencyDetailModal({ agency, onClose, onVisitDashboard }: { agency: Agency; onClose: () => void; onVisitDashboard: () => void }) {
  return (
    <Modal title="Agency Details" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#1A1A2E,#4F8EF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white' }}>
          {agency.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A2E' }}>{agency.name}</div>
          <div style={{ fontSize: 12, color: '#94A3B8' }}>{agency.subdomain}.rankflow.app</div>
        </div>
        <span style={{ ...statusColors[agency.status], padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginLeft: 'auto' }}>
          {agency.status.charAt(0).toUpperCase() + agency.status.slice(1)}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
        {[
          { label: 'Plan', value: agency.plan.charAt(0).toUpperCase() + agency.plan.slice(1) },
          { label: 'MRR', value: agency.mrr > 0 ? `$${agency.mrr}/mo` : 'Trial' },
          { label: 'Total Clients', value: agency.clients },
          { label: 'Reports Generated', value: agency.reports },
          { label: 'Contact', value: agency.contactName || '—' },
          { label: 'Email', value: agency.email || '—' },
          { label: 'Joined', value: agency.joined },
          { label: 'Subdomain', value: agency.subdomain },
        ].map((item, i) => (
          <div key={i} style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px 14px', border: '1px solid #E4E9F2' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E' }}>{String(item.value)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => { onClose(); onVisitDashboard(); }}
          style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'linear-gradient(135deg,#1A1A2E,#2563EB)', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <LayoutDashboard size={13} /> Visit Dashboard
        </button>
        <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#F1F5F9', color: '#64748B', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Close
        </button>
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════
   REPORT PREVIEW MODAL
══════════════════════════════════════════════════════ */
interface ReportData {
  id: string;
  title: string;
  client: string;
  created: string;
  type: string;
  views: number;
}

function ReportPreviewModal({ report, agencyName, onClose }: {
  report: ReportData;
  agencyName: string;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Deterministic per-report mock data based on report id
  const seed = parseInt(report.id) || 1;
  const keywords = [
    { kw: 'digital marketing agency', pos: seed % 3 + 1, prev: seed % 3 + 3, vol: 12400, trend: 'up' },
    { kw: 'seo services ' + report.client.toLowerCase().split(' ')[0], pos: seed + 2, prev: seed + 5, vol: 8800, trend: 'up' },
    { kw: 'best seo company', pos: seed * 2 + 3, prev: seed * 2 + 2, vol: 22100, trend: 'down' },
    { kw: 'local seo optimization', pos: seed + 6, prev: seed + 9, vol: 5400, trend: 'up' },
    { kw: 'seo audit tool', pos: seed * 3 + 1, prev: seed * 3 + 4, vol: 9900, trend: 'up' },
    { kw: 'keyword ranking tracker', pos: seed + 11, prev: seed + 10, vol: 3200, trend: 'down' },
    { kw: report.client.toLowerCase().replace(' ', '-') + ' review', pos: seed, prev: seed + 1, vol: 1800, trend: 'up' },
  ];

  const trafficData = [
    { month: 'Feb', organic: Math.round(seed * 810), paid: Math.round(seed * 120) },
    { month: 'Mar', organic: Math.round(seed * 920), paid: Math.round(seed * 95) },
    { month: 'Apr', organic: Math.round(seed * 1080), paid: Math.round(seed * 140) },
    { month: 'May', organic: Math.round(seed * 990), paid: Math.round(seed * 110) },
    { month: 'Jun', organic: Math.round(seed * 1240), paid: Math.round(seed * 160) },
    { month: 'Jul', organic: Math.round(seed * 1480), paid: Math.round(seed * 130) },
  ];

  const techIssues = [
    { issue: 'Missing meta descriptions', severity: 'medium', count: seed * 3 },
    { issue: 'Slow page load (>3s)', severity: 'high', count: seed },
    { issue: 'Broken internal links', severity: 'low', count: seed + 2 },
    { issue: 'Images missing alt text', severity: 'medium', count: seed * 2 + 1 },
    { issue: 'Duplicate title tags', severity: 'high', count: seed - 1 > 0 ? seed - 1 : 1 },
  ];

  const topPages = [
    { url: '/', sessions: seed * 320, bounce: '42%', conversions: seed * 8 },
    { url: '/services', sessions: seed * 210, bounce: '55%', conversions: seed * 5 },
    { url: '/about', sessions: seed * 180, bounce: '61%', conversions: seed * 2 },
    { url: '/blog/' + (seed % 3 === 0 ? 'seo-tips' : 'marketing-guide'), sessions: seed * 140, bounce: '38%', conversions: seed * 3 },
    { url: '/contact', sessions: seed * 95, bounce: '28%', conversions: seed * 12 },
  ];

  const severityStyle: Record<string, { bg: string; color: string }> = {
    high: { bg: '#FEF2F2', color: '#DC2626' },
    medium: { bg: '#FFFBEB', color: '#D97706' },
    low: { bg: '#ECFDF5', color: '#059669' },
  };

  const totalOrganic = trafficData[trafficData.length - 1].organic;
  const prevOrganic = trafficData[trafficData.length - 2].organic;
  const organicGrowth = (((totalOrganic - prevOrganic) / prevOrganic) * 100).toFixed(1);
  const top3Keywords = keywords.filter(k => k.pos <= 3).length;
  const avgPosition = (keywords.reduce((s, k) => s + k.pos, 0) / keywords.length).toFixed(1);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 9999, padding: '20px', overflowY: 'auto',
    }} onClick={onClose}>
      <div style={{
        background: '#F8FAFC', borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        maxWidth: 900, width: '100%', overflow: 'hidden',
        animation: 'modalIn 0.22s ease', marginTop: 10, marginBottom: 10,
      }} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)',
          padding: '22px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="#059669" />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>{report.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{agencyName} · {report.client}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                {[
                  { label: 'Created', value: report.created },
                  { label: 'Type', value: report.type },
                  { label: 'Views', value: String(report.views) },
                  { label: 'Organic Traffic', value: totalOrganic.toLocaleString() },
                ].map((m, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 1 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: report.type === 'PDF' ? '#FEF3C7' : '#EBF2FF', color: report.type === 'PDF' ? '#92400E' : '#2563EB' }}>
                {report.type}
              </span>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
                <X size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI Summary Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, borderBottom: '1px solid #E4E9F2' }}>
          {[
            { label: 'Organic Traffic', value: totalOrganic.toLocaleString(), change: `+${organicGrowth}%`, good: true, icon: <TrendingUp size={16} /> },
            { label: 'Keywords Top 3', value: String(top3Keywords), change: `of ${keywords.length} tracked`, good: true, icon: <BarChart2 size={16} /> },
            { label: 'Avg Position', value: avgPosition, change: 'this month', good: parseFloat(avgPosition) < 10, icon: <ArrowUpRight size={16} /> },
            { label: 'Backlinks', value: (seed * 243).toLocaleString(), change: `+${seed * 12} new`, good: true, icon: <Globe size={16} /> },
          ].map((k, i) => (
            <div key={i} style={{ padding: '16px 20px', background: 'white', borderRight: i < 3 ? '1px solid #E4E9F2' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ color: '#4F8EF7' }}>{k.icon}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.5px' }}>{k.value}</div>
              <div style={{ fontSize: 11, color: k.good ? '#10B981' : '#EF4444', fontWeight: 600, marginTop: 3 }}>{k.change}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Traffic Chart + Keyword Rankings ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Traffic chart */}
            <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 13, padding: '18px 18px 8px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A2E', marginBottom: 12 }}>Organic Traffic Trend</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={trafficData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`rg-${report.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="organic" name="Organic" stroke="#10B981" strokeWidth={2} fill={`url(#rg-${report.id})`} dot={false} activeDot={{ r: 4, fill: '#10B981' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Keyword Rankings */}
            <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 13, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', fontSize: 13, fontWeight: 800, color: '#1A1A2E' }}>Keyword Rankings</div>
              <div style={{ maxHeight: 210, overflowY: 'auto' }}>
                {keywords.map((k, i) => (
                  <div key={i} style={{ padding: '9px 16px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: k.pos <= 3 ? '#ECFDF5' : k.pos <= 10 ? '#EBF2FF' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: k.pos <= 3 ? '#059669' : k.pos <= 10 ? '#2563EB' : '#94A3B8', flexShrink: 0 }}>
                      {k.pos}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.kw}</div>
                      <div style={{ fontSize: 10, color: '#94A3B8' }}>Vol: {k.vol.toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: k.trend === 'up' ? '#10B981' : '#EF4444', flexShrink: 0 }}>
                      {k.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(k.prev - k.pos)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Top Pages + Tech Issues ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Top Pages */}
            <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 13, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', fontSize: 13, fontWeight: 800, color: '#1A1A2E' }}>Top Pages</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['URL', 'Sessions', 'Bounce', 'Conv.'].map(h => (
                      <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <code style={{ fontSize: 11, color: '#4F8EF7', background: '#EBF2FF', padding: '1px 6px', borderRadius: 4 }}>{p.url}</code>
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>{p.sessions.toLocaleString()}</td>
                      <td style={{ padding: '8px 12px', fontSize: 12, color: '#64748B' }}>{p.bounce}</td>
                      <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#059669' }}>{p.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Technical Issues */}
            <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 13, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', fontSize: 13, fontWeight: 800, color: '#1A1A2E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Technical Issues
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: '#FEF2F2', color: '#DC2626' }}>
                  {techIssues.length} found
                </span>
              </div>
              <div>
                {techIssues.map((t, i) => (
                  <div key={i} style={{ padding: '10px 16px', borderBottom: i < techIssues.length - 1 ? '1px solid #F8FAFC' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: severityStyle[t.severity].color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#1A1A2E' }}>{t.issue}</span>
                    </div>
                    <span style={{ ...severityStyle[t.severity], padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
                      {t.count} pages
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              disabled={downloading}
              onClick={() => {
                setDownloading(true);

                // Build a full-page HTML document styled for PDF printing
                const printWindow = window.open('', '_blank', 'width=900,height=700');
                if (!printWindow) { setDownloading(false); return; }

                const totalOrganicVal = trafficData[trafficData.length - 1].organic;
                const prevOrganicVal = trafficData[trafficData.length - 2].organic;
                const growthVal = (((totalOrganicVal - prevOrganicVal) / prevOrganicVal) * 100).toFixed(1);
                const top3Val = keywords.filter(k => k.pos <= 3).length;
                const avgPosVal = (keywords.reduce((s, k) => s + k.pos, 0) / keywords.length).toFixed(1);
                const seed = parseInt(report.id) || 1;

                printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${report.title} — ${report.client}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Plus Jakarta Sans', sans-serif; 
      background: white; 
      color: #0F172A; 
      font-size: 13px; 
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page { 
      size: A4;
      margin: 12mm 15mm; 
    }
    @media print {
      html, body {
        background-color: #ffffff;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }

    /* ─ Advanced Header ─ */
    .rpt-header { 
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); 
      color: white; 
      padding: 36px 40px; 
      border-radius: 16px; 
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.15);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .rpt-header::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.15);
      filter: blur(30px);
    }
    .rpt-header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 16px;
    }
    .rpt-header-title { 
      font-family: 'Outfit', sans-serif;
      font-size: 24px; 
      font-weight: 800; 
      letter-spacing: -0.5px; 
      color: #FFFFFF;
    }
    .rpt-header-sub { 
      font-size: 13px; 
      color: #94A3B8; 
      font-weight: 500;
      margin-top: 4px;
    }
    .brand-pill {
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #A5B4FC;
      padding: 4px 12px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .rpt-meta { 
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px; 
    }
    .rpt-meta-item { 
      background: rgba(255, 255, 255, 0.05); 
      border: 1px solid rgba(255, 255, 255, 0.08); 
      padding: 10px 16px; 
      border-radius: 12px; 
    }
    .rpt-meta-label { 
      font-size: 9px; 
      color: #64748B; 
      text-transform: uppercase; 
      letter-spacing: 1px; 
      font-weight: 700;
    }
    .rpt-meta-val { 
      font-size: 13px; 
      font-weight: 700; 
      color: #F1F5F9; 
      margin-top: 4px; 
    }

    /* ─ KPI Bar ─ */
    .kpi-bar { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      margin-bottom: 28px;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .kpi-cell { 
      padding: 20px; 
      border-right: 1px solid #E2E8F0; 
    }
    .kpi-cell:last-child { border-right: none; }
    .kpi-label { 
      font-size: 10px; 
      font-weight: 700; 
      color: #64748B; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
      margin-bottom: 6px; 
    }
    .kpi-val { 
      font-family: 'Outfit', sans-serif;
      font-size: 24px; 
      font-weight: 700; 
      color: #0F172A; 
      letter-spacing: -0.5px; 
    }
    .kpi-change { 
      font-size: 11px; 
      font-weight: 600; 
      color: #10B981; 
      margin-top: 4px; 
      display: flex;
      align-items: center;
      gap: 3px;
    }

    /* ─ Body & Sections ─ */
    .body { padding: 0 4px; }
    .section { 
      margin-bottom: 28px; 
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-title { 
      font-family: 'Outfit', sans-serif;
      font-size: 15px; 
      font-weight: 700; 
      color: #0F172A; 
      margin-bottom: 14px;
      padding-bottom: 6px; 
      border-bottom: 2px solid #6366F1; 
      letter-spacing: -0.3px;
    }

    /* ─ Tables ─ */
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #F8FAFC; }
    th { 
      padding: 10px 14px; 
      text-align: left; 
      font-size: 10px; 
      font-weight: 700; 
      text-transform: uppercase;
      letter-spacing: 0.5px; 
      color: #64748B; 
      border-bottom: 1.5px solid #E2E8F0; 
    }
    td { 
      padding: 11px 14px; 
      font-size: 12.5px; 
      color: #334155; 
      border-bottom: 1px solid #E2E8F0; 
    }
    tr:last-child td { border-bottom: none; }
    
    .badge { display: inline-block; padding: 3px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
    .badge-green { background: #DCFCE7; color: #166534; }
    .badge-blue { background: #DBEAFE; color: #1E40AF; }
    .badge-red { background: #FEE2E2; color: #991B1B; }
    .badge-yellow { background: #FEF3C7; color: #92400E; }
    
    .pos-top3 { background: #DCFCE7; color: #166534; padding: 2px 8px; border-radius: 6px; font-weight: 800; }
    .pos-top10 { background: #DBEAFE; color: #1E40AF; padding: 2px 8px; border-radius: 6px; font-weight: 800; }
    .pos-other { background: #F1F5F9; color: #475569; padding: 2px 8px; border-radius: 6px; font-weight: 800; }
    
    .trend-up { color: #166534; font-weight: 700; }
    .trend-down { color: #991B1B; font-weight: 700; }

    /* ─ Grid Layouts ─ */
    .grid-2 { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 24px; 
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .card { 
      border: 1px solid #E2E8F0; 
      border-radius: 12px; 
      overflow: hidden; 
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .card-header { 
      padding: 12px 16px; 
      border-bottom: 1px solid #E2E8F0; 
      font-size: 12px; 
      font-weight: 700; 
      color: #334155;
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      background: #F8FAFC; 
    }

    /* ─ Advanced Footer ─ */
    .rpt-footer { 
      margin-top: 40px; 
      padding: 20px 0; 
      border-top: 1px solid #E2E8F0;
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      font-size: 11px; 
      color: #64748B; 
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .rpt-footer-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .confidential-tag {
      background: #F1F5F9;
      color: #475569;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>

  <!-- Premium Header -->
  <div class="rpt-header">
    <div class="rpt-header-top">
      <div>
        <h1 class="rpt-header-title">${report.title}</h1>
        <p class="rpt-header-sub">Professional Performance Report &middot; Prepared for ${report.client}</p>
      </div>
      <span class="brand-pill">${agencyName}</span>
    </div>
    <div class="rpt-meta">
      <div class="rpt-meta-item"><div class="rpt-meta-label">Date Generated</div><div class="rpt-meta-val">${report.created}</div></div>
      <div class="rpt-meta-item"><div class="rpt-meta-label">Traffic Channel</div><div class="rpt-meta-val">Organic Search</div></div>
      <div class="rpt-meta-item"><div class="rpt-meta-label">Format Type</div><div class="rpt-meta-val">${report.type} View</div></div>
      <div class="rpt-meta-item"><div class="rpt-meta-label">Reference ID</div><div class="rpt-meta-val">#RPT-${report.id.padStart(5,'0')}</div></div>
    </div>
  </div>

  <!-- KPI Overview Grid -->
  <div class="kpi-bar">
    <div class="kpi-cell">
      <div class="kpi-label">Organic Sessions</div>
      <div class="kpi-val">${totalOrganicVal.toLocaleString()}</div>
      <div class="kpi-change">&uarr; +${growthVal}% MoM growth</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">Top 3 Keywords</div>
      <div class="kpi-val">${top3Val}</div>
      <div class="kpi-change">out of ${keywords.length} tracked</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">Avg. SERP Rank</div>
      <div class="kpi-val">${avgPosVal}</div>
      <div class="kpi-change">healthy index position</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">Total Backlinks</div>
      <div class="kpi-val">${(seed*243).toLocaleString()}</div>
      <div class="kpi-change">&uarr; +${seed*12} new links</div>
    </div>
  </div>

  <div class="body">

    <!-- Keyword Rankings -->
    <div class="section">
      <div class="section-title">SERP Rank Tracking</div>
      <div class="card">
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">Rank</th>
              <th>Target Keyword</th>
              <th>Monthly Volume</th>
              <th>SERP Position</th>
              <th>Previous Rank</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            ${keywords.map((k, i) => `
              <tr>
                <td>#${i + 1}</td>
                <td><strong>${k.kw}</strong></td>
                <td>${k.vol.toLocaleString()} / mo</td>
                <td><span class="${k.pos <= 3 ? 'pos-top3' : k.pos <= 10 ? 'pos-top10' : 'pos-other'}">${k.pos}</span></td>
                <td>${k.prev}</td>
                <td class="${k.trend === 'up' ? 'trend-up' : 'trend-down'}">
                  ${k.trend === 'up' ? '&uarr; +' : '&darr; -'}${Math.abs(k.prev - k.pos)} positions
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Double Column Cards -->
    <div class="grid-2">
      <!-- Top Pages -->
      <div class="section">
        <div class="section-title">Top organic entry points</div>
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>Target Landing Page</th>
                <th>Sessions</th>
                <th>Bounce</th>
                <th style="text-align: right;">Conversions</th>
              </tr>
            </thead>
            <tbody>
              ${topPages.map(p => `
                <tr>
                  <td><code>${p.url}</code></td>
                  <td><strong>${p.sessions.toLocaleString()}</strong></td>
                  <td>${p.bounce}</td>
                  <td style="color:#166534; font-weight:700; text-align: right;">${p.conversions}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Technical Health Audit -->
      <div class="section">
        <div class="section-title">Technical Index Issues</div>
        <div class="card">
          <div class="card-header">
            <span>Core Web Vitals & Audits</span>
            <span class="badge badge-red">${techIssues.length} alerts</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Audit Checkpoint</th>
                <th>Severity</th>
                <th style="text-align: right;">Pages Affected</th>
              </tr>
            </thead>
            <tbody>
              ${techIssues.map(t => `
                <tr>
                  <td>${t.issue}</td>
                  <td><span class="badge ${t.severity === 'high' ? 'badge-red' : t.severity === 'medium' ? 'badge-yellow' : 'badge-green'}">${t.severity.toUpperCase()}</span></td>
                  <td style="text-align: right; font-weight: 600;">${t.count} urls</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Monthly Trend Sheet -->
    <div class="section">
      <div class="section-title">Historical Search Traffic Sheet</div>
      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Reporting Period</th>
              <th>Organic Traffic</th>
              <th>Paid Traffic</th>
              <th>Total Traffic</th>
              <th style="text-align: right;">Monthly MoM Growth</th>
            </tr>
          </thead>
          <tbody>
            ${trafficData.map((d, i) => {
              const prev = i > 0 ? trafficData[i-1].organic : d.organic;
              const change = i > 0 ? (((d.organic - prev) / prev) * 100).toFixed(1) : '0.0';
              return `
                <tr>
                  <td><strong>${d.month} 2026</strong></td>
                  <td>${d.organic.toLocaleString()} sessions</td>
                  <td>${d.paid.toLocaleString()} sessions</td>
                  <td><strong>${(d.organic + d.paid).toLocaleString()} sessions</strong></td>
                  <td class="${parseFloat(change) >= 0 ? 'trend-up' : 'trend-down'}" style="text-align: right;">
                    ${parseFloat(change) >= 0 ? '&uarr; +' : '&darr; '}${change}%
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <!-- Advanced Footer -->
  <div class="rpt-footer">
    <div class="rpt-footer-left">
      <span class="confidential-tag">Confidential</span>
      <span>&copy; ${new Date().getFullYear()} ${agencyName}. All rights reserved.</span>
    </div>
    <div>
      <span>Document ID: #RPT-${report.id.padStart(5,'0')} &middot; Page 1 of 1</span>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 500);
    };
  </script>
</body>
</html>`);
                printWindow.document.close();
                setTimeout(() => setDownloading(false), 2000);
              }}
              style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: downloading ? '#94A3B8' : 'linear-gradient(135deg,#1A1A2E,#2563EB)', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.2s' }}>
              <Download size={13} /> {downloading ? 'Opening PDF...' : 'Download PDF'}
            </button>
            <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#F1F5F9', color: '#64748B', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   AGENCY DASHBOARD VIEW — Full inline panel
══════════════════════════════════════════════════════ */
type AgencyTab = 'overview' | 'settings';

function AgencyDashboardView({ agency, onBack, onToggleSuspend }: {
  agency: Agency;
  onBack: () => void;
  onToggleSuspend: (id: string) => void;
}) {
  const [tab, setTab] = useState<AgencyTab>('overview');
  const [previewReport, setPreviewReport] = useState<ReportData | null>(null);

  // Per-agency mock data (scaled from real agency fields)
  const agencyClients = Array.from({ length: Math.min(agency.clients, 8) }, (_, i) => ({
    id: String(i + 1),
    name: ['Acme Corp', 'TechStart Inc', 'BrightMark', 'Solaris Digital', 'PinPoint Co', 'FutureLabs', 'OakBridge SEO', 'Zenith Media'][i % 8],
    domain: ['acme.com', 'techstart.io', 'brightmark.co', 'solarisdigital.com', 'pinpoint.co', 'futurelabs.dev', 'oakbridge.seo', 'zenithmedia.com'][i % 8],
    reports: Math.floor(agency.reports / Math.max(agency.clients, 1)) + Math.floor(Math.random() * 5),
    keywords: [142, 87, 203, 56, 318, 94, 170, 61][i % 8],
    status: i === 2 ? 'inactive' : 'active',
    lastReport: ['2 days ago', 'Today', '1 week ago', '3 days ago', 'Today', '5 days ago', '2 days ago', '1 day ago'][i % 8],
  }));

  const agencyReports = Array.from({ length: Math.min(agency.reports, 10) }, (_, i) => ({
    id: String(i + 1),
    title: `${['Monthly SEO', 'Keyword Rankings', 'Backlink Analysis', 'Site Audit', 'Competitor Analysis', 'Traffic Overview', 'Technical SEO', 'Local SEO'][i % 8]} Report`,
    client: agencyClients[i % Math.max(agencyClients.length, 1)]?.name || 'Acme Corp',
    created: ['Jul 15, 2026', 'Jul 12, 2026', 'Jul 10, 2026', 'Jul 8, 2026', 'Jul 5, 2026', 'Jul 1, 2026', 'Jun 28, 2026', 'Jun 25, 2026', 'Jun 22, 2026', 'Jun 18, 2026'][i % 10],
    type: ['PDF', 'Live', 'PDF', 'Live', 'PDF'][i % 5],
    views: [24, 8, 31, 5, 18, 42, 11, 7, 29, 15][i % 10],
  }));

  const mrrHistory = [
    { month: 'Feb', mrr: agency.mrr * 0.7 },
    { month: 'Mar', mrr: agency.mrr * 0.8 },
    { month: 'Apr', mrr: agency.mrr * 0.85 },
    { month: 'May', mrr: agency.mrr * 0.92 },
    { month: 'Jun', mrr: agency.mrr },
    { month: 'Jul', mrr: agency.mrr },
  ];

  const tabs: { id: AgencyTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={14} /> },
    { id: 'settings', label: 'Settings & Control', icon: <Sliders size={14} /> },
  ];

  const planLimits: Record<string, { clients: number; reports: number; users: number }> = {
    starter: { clients: 5, reports: 50, users: 3 },
    pro: { clients: 25, reports: 250, users: 10 },
    enterprise: { clients: 999, reports: 9999, users: 999 },
  };
  const limits = planLimits[agency.plan];

  const UsageBar = ({ label, used, max, color = '#4F8EF7' }: { label: string; used: number; max: number; color?: string }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>{used} / {max === 999 ? '∞' : max}</span>
      </div>
      <div style={{ height: 6, background: '#E4E9F2', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min((used / max) * 100, 100)}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'slideInRight 0.25s ease' }}>
      {/* ── Breadcrumb Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: 'white', border: '1px solid #E4E9F2', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            <ChevronLeft size={14} /> Back to Agencies
          </button>
          <span style={{ color: '#CBD5E1', fontSize: 16 }}>›</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#1A1A2E,#4F8EF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white' }}>
              {agency.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E' }}>{agency.name}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>{agency.subdomain}.rankflow.app</div>
            </div>
          </div>
          <span style={{ ...statusColors[agency.status], padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            {agency.status.charAt(0).toUpperCase() + agency.status.slice(1)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {agency.status === 'active' ? (
            <button onClick={() => onToggleSuspend(agency.id)} style={{ padding: '7px 14px', borderRadius: 9, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Suspend Agency
            </button>
          ) : agency.status === 'suspended' ? (
            <button onClick={() => onToggleSuspend(agency.id)} style={{ padding: '7px 14px', borderRadius: 9, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Restore Agency
            </button>
          ) : null}
          <a href={`http://${agency.subdomain}.rankflow.app`} target="_blank" rel="noreferrer"
            style={{ padding: '7px 14px', borderRadius: 9, background: '#EBF2FF', color: '#2563EB', border: '1px solid #BFDBFE', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            <ExternalLink size={12} /> Open Live Site
          </a>
        </div>
      </div>

      {/* ── Inner Tab Bar ── */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E4E9F2', padding: '0 16px', display: 'flex', gap: 0, marginBottom: 22, boxShadow: '0 1px 3px rgba(26,26,46,0.05)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '13px 16px', fontSize: 13, fontWeight: 600,
              border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: tab === t.id ? '2px solid #4F8EF7' : '2px solid transparent',
              color: tab === t.id ? '#4F8EF7' : '#6B7CA8',
              marginBottom: -1, transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ════ OVERVIEW ════ */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
            {[
              { label: 'Active Clients', value: agency.clients, icon: <Users size={18} />, color: '#4F8EF7', bg: '#EBF2FF', sub: `of ${limits.clients === 999 ? '∞' : limits.clients} plan limit` },
              { label: 'Reports Generated', value: agency.reports, icon: <FileText size={18} />, color: '#10B981', bg: '#ECFDF5', sub: 'total to date' },
              { label: 'Monthly Revenue', value: agency.mrr > 0 ? `$${agency.mrr}` : 'Trial', icon: <DollarSign size={18} />, color: '#2563EB', bg: '#EBF2FF', sub: agency.mrr > 0 ? `$${agency.mrr * 12}/yr` : 'No billing yet' },
              { label: 'Member Since', value: agency.joined, icon: <Activity size={18} />, color: '#8B5CF6', bg: '#F5F3FF', sub: 'account age' },
            ].map((k, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 13, padding: '18px', boxShadow: '0 1px 3px rgba(26,26,46,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.color, borderRadius: '13px 13px 0 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{k.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.5px' }}>{k.value}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 5 }}>{k.sub}</div>
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
            {/* Activity Chart */}
            <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 13, padding: 20, boxShadow: '0 1px 3px rgba(26,26,46,0.05)' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Revenue History</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>MRR trend for this agency</div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={mrrHistory} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${agency.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="mrr" name="MRR" stroke="#4F8EF7" strokeWidth={2.5} fill={`url(#grad-${agency.id})`} dot={false} activeDot={{ r: 5, fill: '#4F8EF7' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Plan & Usage */}
            <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 13, padding: 20, boxShadow: '0 1px 3px rgba(26,26,46,0.05)' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Plan Usage</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ ...planColors[agency.plan], padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {agency.plan.charAt(0).toUpperCase() + agency.plan.slice(1)}
                  </span>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>{agency.mrr > 0 ? `$${agency.mrr}/mo` : 'Free Trial'}</span>
                </div>
              </div>
              <UsageBar label="Clients" used={agency.clients} max={limits.clients} color="#4F8EF7" />
              <UsageBar label="Reports" used={agency.reports} max={limits.reports} color="#10B981" />
              <UsageBar label="Team Members" used={Math.min(3, limits.users)} max={limits.users} color="#8B5CF6" />
              <div style={{ marginTop: 16, padding: '12px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E4E9F2' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Next Billing Date</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{agency.mrr > 0 ? 'Aug 1, 2026' : 'N/A — Trial'}</div>
              </div>
            </div>
          </div>
        </>
      )}



      {/* ════ SETTINGS ════ */}
      {tab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Account Info */}
          <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(26,26,46,0.03)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFD', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={16} color="#4F8EF7" />
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Agency Information</div>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              {[
                { label: 'Agency Name', value: agency.name },
                { label: 'Subdomain Prefix', value: agency.subdomain },
                { label: 'Portal Address', value: `${agency.subdomain}.rankflow.app` },
                { label: 'Contact Name', value: agency.contactName || '—' },
                { label: 'Contact Email', value: agency.email || '—' },
                { label: 'Account Created', value: agency.joined },
                { label: 'System Identifier', value: `AGY-${String(agency.id).padStart(6,'0')}` },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 6 ? '1px solid #F1F5F9' : 'none' }}>
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Plan & Permissions */}
            <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(26,26,46,0.03)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFD', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} color="#10B981" />
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Plan & Permissions</div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px dashed #E2E8F0' }}>
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Current Active Level</span>
                  <span style={{ ...planColors[agency.plan], padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {agency.plan}
                  </span>
                </div>
                {[
                  { label: 'White-label branding options', enabled: agency.plan !== 'starter' },
                  { label: 'Custom domain linkage', enabled: agency.plan === 'enterprise' },
                  { label: 'Full API gateway access', enabled: agency.plan !== 'starter' },
                  { label: 'Priority agent support line', enabled: agency.plan === 'enterprise' },
                  { label: 'Scheduled automated reports', enabled: true },
                  { label: 'PDF format export module', enabled: true },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 5 ? '1px solid #F8FAFC' : 'none' }}>
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{f.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: f.enabled ? '#059669' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {f.enabled ? (
                        <span style={{ color: '#059669', background: '#DCFCE7', padding: '2px 8px', borderRadius: 20 }}>Enabled</span>
                      ) : (
                        <span style={{ color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: 20 }}>Unavailable</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{ background: 'white', border: '1px solid #FECACA', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(239,68,68,0.03)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #FEE2E2', background: '#FEF2F2', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} color="#DC2626" />
                <div style={{ fontSize: 14, fontWeight: 800, color: '#991B1B' }}>Danger Zone Actions</div>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>Suspend / Restore Agency Access</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Temporarily lock or unlock the agency login and subdomains</div>
                  </div>
                  <button
                    onClick={() => onToggleSuspend(agency.id)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: 8, 
                      background: agency.status === 'suspended' ? '#ECFDF5' : '#FEF2F2', 
                      color: agency.status === 'suspended' ? '#059669' : '#DC2626', 
                      border: `1.5px solid ${agency.status === 'suspended' ? '#A7F3D0' : '#FECACA'}`, 
                      fontSize: 12, 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}>
                    {agency.status === 'suspended' ? 'Restore Agency' : 'Suspend Agency'}
                  </button>
                </div>
                
                <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>Permanently Delete Account</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Irreversibly wipe all metrics, clients, and report templates</div>
                  </div>
                  <button style={{ padding: '8px 16px', borderRadius: 8, background: '#F3F4F6', color: '#94A3B8', border: '1.5px solid #E5E7EB', fontSize: 12, fontWeight: 700, cursor: 'not-allowed' }}>
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {previewReport && (
        <ReportPreviewModal
          report={previewReport}
          agencyName={agency.name}
          onClose={() => setPreviewReport(null)}
        />
      )}
    </div>
  );
}

/* ─── Invite Agency Modal ─── */
function InviteAgencyModal({ onClose, onInvite }: { onClose: () => void; onInvite: (data: { name: string; email: string; plan: string }) => void }) {
  const [form, setForm] = useState({ name: '', email: '', plan: 'starter', contactName: '', subdomain: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Agency name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.subdomain.trim()) e.subdomain = 'Subdomain is required';
    else if (!/^[a-z0-9-]+$/.test(form.subdomain)) e.subdomain = 'Only lowercase letters, numbers, and hyphens';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1400));
    setSending(false);
    setSent(true);
    onInvite({ name: form.name, email: form.email, plan: form.plan });
    setTimeout(onClose, 1800);
  };

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); }}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 13, fontFamily: 'inherit',
          border: `1.5px solid ${errors[key] ? '#FCA5A5' : '#E4E9F2'}`, outline: 'none', background: errors[key] ? '#FFF5F5' : '#F8FAFC', color: '#1A1A2E', boxSizing: 'border-box',
        }}
      />
      {errors[key] && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 3 }}>{errors[key]}</div>}
    </div>
  );

  if (sent) return (
    <Modal title="Invite Sent!" onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Check size={28} color="#10B981" />
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E', marginBottom: 8 }}>Invitation Sent!</div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>An invite email has been sent to <strong style={{ color: '#1A1A2E' }}>{form.email}</strong></div>
      </div>
    </Modal>
  );

  return (
    <Modal title="Invite New Agency" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <div>{field('name', 'Agency Name', 'text', 'e.g. Digital Horizons')}</div>
        <div>{field('contactName', 'Contact Name', 'text', 'e.g. John Doe')}</div>
      </div>
      {field('email', 'Contact Email', 'email', 'admin@agency.com')}
      {field('subdomain', 'Subdomain', 'text', 'my-agency')}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>Plan</label>
        <select
          value={form.plan}
          onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', border: '1.5px solid #E4E9F2', outline: 'none', background: '#F8FAFC', color: '#1A1A2E', cursor: 'pointer' }}
        >
          <option value="starter">Starter — $99/mo (up to 5 clients)</option>
          <option value="pro">Pro — $299/mo (up to 25 clients)</option>
          <option value="enterprise">Enterprise — $999/mo (unlimited)</option>
        </select>
      </div>
      <div style={{ padding: '12px 14px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FDE68A', fontSize: 12, color: '#92400E', marginBottom: 18 }}>
        <strong>Note:</strong> The agency will receive an email with a magic link to set up their account. They'll have 7 days to accept the invitation.
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: '#F1F5F9', color: '#64748B', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={sending} style={{ flex: 2, padding: '11px 0', borderRadius: 10, background: sending ? '#93C5FD' : '#4F8EF7', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
          {sending ? <><RefreshCw size={13} className="spinner" /> Sending…</> : <><Send size={13} /> Send Invitation</>}
        </button>
      </div>
    </Modal>
  );
}

/* ─── Toast Notification ─── */
function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
      background: type === 'success' ? '#1A1A2E' : '#FEF2F2',
      color: type === 'success' ? 'white' : '#DC2626',
      padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600,
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'slideUp 0.25s ease',
      border: type === 'success' ? 'none' : '1px solid #FECACA',
    }}>
      {type === 'success' ? <CheckCircle2 size={16} color="#10B981" /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dropdown States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'New Agency Signup', desc: 'VelocityRank requested a trial account.', time: '5 mins ago', read: false },
    { id: '2', title: 'System Backup Complete', desc: 'Global server snapshot successfully stored.', time: '1 hour ago', read: false },
    { id: '3', title: 'Billing Transaction Alert', desc: 'Digital Horizons pro subscription renewed.', time: '3 hours ago', read: true },
    { id: '4', title: 'API Threshold Exceeded', desc: 'Nexus SEO reached 80% keyword request limit.', time: '1 day ago', read: true },
  ]);

  // Data state
  const [agencies, setAgencies] = useState<Agency[]>(initialAgencies);
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);

  // Modals
  const [viewAgency, setViewAgency] = useState<Agency | null>(null);
  const [agencyDashView, setAgencyDashView] = useState<Agency | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [activeSystemModal, setActiveSystemModal] = useState<'security' | 'settings' | 'audit' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const refresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Dashboard metrics re-synchronized.');
    }, 1500);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Computed
  const totalMRR = agencies.reduce((s, a) => s + a.mrr, 0);
  const totalAgencies = agencies.length;
  const totalClients = agencies.reduce((s, a) => s + a.clients, 0);
  const totalReports = agencies.reduce((s, a) => s + a.reports, 0);

  const filteredAgencies = agencies.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.name.toLowerCase().includes(q) || a.subdomain.toLowerCase().includes(q);
    const matchPlan = planFilter === 'all' || a.plan === planFilter;
    return matchSearch && matchPlan;
  });

  /* ─── Actions ─── */
  const toggleSuspend = (id: string) => {
    setAgencies(prev => prev.map(a => {
      if (a.id !== id) return a;
      const next = a.status === 'active' ? 'suspended' : 'active';
      showToast(`${a.name} has been ${next === 'suspended' ? 'suspended' : 'restored'}.`);
      return { ...a, status: next };
    }));
  };

  const handleInvite = (data: { name: string; email: string; plan: string }) => {
    const newAgency: Agency = {
      id: String(Date.now()),
      name: data.name,
      subdomain: data.name.toLowerCase().replace(/\s+/g, '-'),
      plan: data.plan as Agency['plan'],
      clients: 0,
      reports: 0,
      status: 'trial',
      mrr: 0,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      email: data.email,
    };
    setAgencies(prev => [newAgency, ...prev]);
    showToast(`Invitation sent to ${data.email}`);
  };

  /* ─── CSV Exports ─── */
  const exportAgenciesCSV = () => {
    const headers = ['ID', 'Agency Name', 'Subdomain', 'Plan', 'Clients', 'Reports', 'MRR ($/mo)', 'Status', 'Joined', 'Contact Email'];
    const rows = filteredAgencies.map(a => [
      a.id, a.name, `${a.subdomain}.rankflow.app`, a.plan,
      String(a.clients), String(a.reports), String(a.mrr),
      a.status, a.joined, a.email || '',
    ]);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(`agencies-export-${date}.csv`, headers, rows);
    showToast(`Exported ${filteredAgencies.length} agencies to CSV`);
  };

  const exportUsersCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Agency', 'Role', 'Last Login', 'Status'];
    const rows = users.map(u => [u.id, u.name, u.email, u.agency, u.role, u.last, u.status]);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(`users-export-${date}.csv`, headers, rows);
    showToast(`Exported ${users.length} users to CSV`);
  };

  const exportBillingCSV = () => {
    const headers = ['Agency', 'Plan', 'MRR ($/mo)', 'Annual Value ($)', 'Status', 'Next Billing'];
    const rows = agencies.map(a => [
      a.name, a.plan, String(a.mrr), String(a.mrr * 12), a.status, 'Aug 1, 2026',
    ]);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(`billing-export-${date}.csv`, headers, rows);
    showToast(`Exported billing data to CSV`);
  };

  const exportOverviewCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total MRR', `$${totalMRR}`],
      ['Annual Run Rate', `$${totalMRR * 12}`],
      ['Total Agencies', String(totalAgencies)],
      ['Active Agencies', String(agencies.filter(a => a.status === 'active').length)],
      ['Trial Agencies', String(agencies.filter(a => a.status === 'trial').length)],
      ['Suspended Agencies', String(agencies.filter(a => a.status === 'suspended').length)],
      ['Total Clients', String(totalClients)],
      ['Total Reports', String(totalReports)],
      ['Avg MRR per Agency', `$${Math.round(totalMRR / totalAgencies)}`],
      ['Exported At', new Date().toLocaleString()],
    ];
    downloadCSV(`overview-export-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    showToast('Overview data exported to CSV');
  };

  /* ─── Styles ─── */
  const btnPrimary = {
    padding: '9px 18px', borderRadius: 9, background: '#4F8EF7', color: 'white',
    border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 7, transition: 'background 0.2s',
  } as React.CSSProperties;

  const btnSecondary = {
    padding: '9px 16px', borderRadius: 9, background: '#EBF2FF', color: '#2563EB',
    border: '1.5px solid #BFDBFE', fontSize: 13, fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s',
  } as React.CSSProperties;

  return (
    <>
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; display: inline-block; }
        button:hover { filter: brightness(0.96); }
        input:focus { border-color: #93C5FD !important; }
        select:focus { border-color: #93C5FD !important; }
        .header-icon-btn {
          width: 34, height: 34;
          border-radius: 9px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #94A3B8;
          transition: all 0.2s ease;
        }
        .header-icon-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #FFFFFF;
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        .header-icon-btn:active {
          transform: translateY(0);
        }
      `}</style>
      
      <div style={{ minHeight: '100vh', background: '#F4F6FB', fontFamily: 'Inter, sans-serif' }}>
        {/* ── Top Navigation ── */}
        <header style={{
          background: '#1A1A2E', borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '0 28px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4F8EF7 0%, #2563EB 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: 'white',
              boxShadow: '0 4px 12px rgba(79,142,247,0.45)',
            }}>RF</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>RankFlow</div>
              <div style={{ fontSize: 10, color: '#6B7CA8', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Super Admin Console</div>
            </div>
            <div style={{ marginLeft: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 10, color: '#FCA5A5', fontWeight: 700 }}>
              <Shield size={10} style={{ display: 'inline', marginRight: 4 }} />ADMIN
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            <button 
              onClick={() => { setShowNotifications(prev => !prev); setShowProfileMenu(false); }} 
              className="header-icon-btn" 
              style={{ width: 34, height: 34, position: 'relative' }}
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', border: '1.5px solid #1A1A2E' }} />
              )}
            </button>
            
            {/* ── Notifications Dropdown ── */}
            {showNotifications && (
              <div 
                style={{ 
                  position: 'absolute', top: 46, right: 180, width: 320, 
                  background: 'white', border: '1px solid #E4E9F2', borderRadius: 12, 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 1000, overflow: 'hidden',
                  animation: 'modalIn 0.18s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#1A1A2E' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead} 
                      style={{ border: 'none', background: 'none', color: '#4F8EF7', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>No alerts found</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                          setShowNotifications(false);
                          showToast(`Opened notification: ${n.title}`);
                        }}
                        style={{ 
                          padding: '12px 16px', borderBottom: '1px solid #F8FAFC', cursor: 'pointer',
                          background: n.read ? 'white' : 'rgba(79,142,247,0.04)',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={e => e.currentTarget.style.background = n.read ? 'white' : 'rgba(79,142,247,0.04)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: n.read ? 600 : 800, color: '#1A1A2E' }}>{n.title}</span>
                          <span style={{ fontSize: 10, color: '#94A3B8' }}>{n.time}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>{n.desc}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div 
              onClick={() => { setShowProfileMenu(prev => !prev); setShowNotifications(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 10, background: showProfileMenu ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #4F8EF7, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>SA</div>
              <div style={{ userSelect: 'none' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>Super Admin</div>
                <div style={{ fontSize: 10, color: '#6B7CA8' }}>superadmin@rankflow.app</div>
              </div>
            </div>

            {/* ── Profile Menu Dropdown ── */}
            {showProfileMenu && (
              <div 
                style={{ 
                  position: 'absolute', top: 46, right: 0, width: 200, 
                  background: 'white', border: '1px solid #E4E9F2', borderRadius: 12, 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)', zIndex: 1000, overflow: 'hidden',
                  animation: 'modalIn 0.18s ease'
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#1A1A2E' }}>System Operator</div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1 }}>Level: Global Root</div>
                </div>
                <div style={{ padding: '6px 0' }}>
                  {[
                    { label: 'Security & Keys', action: () => { setActiveSystemModal('security'); setShowProfileMenu(false); } },
                    { label: 'System Settings', action: () => { setActiveSystemModal('settings'); setShowProfileMenu(false); } },
                    { label: 'Audit Logs', action: () => { setActiveSystemModal('audit'); setShowProfileMenu(false); } },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      style={{ 
                        width: '100%', padding: '10px 16px', border: 'none', background: 'none',
                        textAlign: 'left', fontSize: 12, color: '#475569', fontWeight: 600,
                        cursor: 'pointer', display: 'block', transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid #F1F5F9', marginTop: 6, paddingTop: 6 }}>
                    <button
                      onClick={async () => {
                        setShowProfileMenu(false);
                        await signOut({ callbackUrl: '/login' });
                      }}
                      style={{ 
                        width: '100%', padding: '10px 16px', border: 'none', background: 'none',
                        textAlign: 'left', fontSize: 12, color: '#EF4444', fontWeight: 700,
                        cursor: 'pointer', display: 'block'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Tab Navigation ── */}
        <div style={{ background: 'white', borderBottom: '1px solid #E4E9F2', padding: '0 28px', display: 'flex', gap: 0 }}>
          {([
            { id: 'overview', label: 'Overview', icon: <BarChart2 size={14} /> },
            { id: 'agencies', label: 'Agencies', icon: <Building2 size={14} /> },
            { id: 'users', label: 'Users', icon: <Users size={14} /> },
            { id: 'system', label: 'System Health', icon: <Server size={14} /> },
            { id: 'billing', label: 'Billing', icon: <DollarSign size={14} /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '14px 18px', fontSize: 13, fontWeight: 600,
                border: 'none', background: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #4F8EF7' : '2px solid transparent',
                color: activeTab === tab.id ? '#4F8EF7' : '#6B7CA8',
                marginBottom: -1, transition: 'all 0.15s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '28px', maxWidth: 1400, margin: '0 auto' }}>

          {/* ═══ AGENCY DASHBOARD VIEW ═══ */}
          {agencyDashView ? (
            <AgencyDashboardView
              agency={agencies.find(a => a.id === agencyDashView.id) ?? agencyDashView}
              onBack={() => setAgencyDashView(null)}
              onToggleSuspend={(id) => { toggleSuspend(id); }}
            />
          ) : (<>

          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.4px' }}>Platform Overview</h1>
                  <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>Real-time metrics across all agencies</p>
                </div>
                <button onClick={exportOverviewCSV} style={btnSecondary}>
                  <Download size={13} /> Export Overview CSV
                </button>
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
                {[
                  { label: 'Monthly Revenue', value: `$${totalMRR.toLocaleString()}`, sub: '+18% vs last month', dir: 'up', icon: <DollarSign size={20} />, color: '#4F8EF7', bg: '#EBF2FF' },
                  { label: 'Total Agencies', value: totalAgencies, sub: '3 joined this month', dir: 'up', icon: <Building2 size={20} />, color: '#10B981', bg: '#ECFDF5' },
                  { label: 'Total Clients', value: totalClients, sub: 'across all agencies', dir: 'up', icon: <Users size={20} />, color: '#4F8EF7', bg: '#EBF2FF' },
                  { label: 'Reports Generated', value: totalReports, sub: '34 this week', dir: 'up', icon: <Activity size={20} />, color: '#10B981', bg: '#ECFDF5' },
                ].map((k, i) => (
                  <div key={i} style={{
                    background: 'white', border: '1px solid #E4E9F2', borderRadius: 14,
                    padding: '20px', boxShadow: '0 1px 3px rgba(26,26,46,0.06)', position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${k.color}, ${k.color}88)` }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>{k.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.8px', lineHeight: 1 }}>{k.value}</div>
                        <div style={{ fontSize: 12, marginTop: 8, color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ArrowUpRight size={13} /> {k.sub}
                        </div>
                      </div>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {k.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, padding: 22, boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Monthly Recurring Revenue</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>Platform MRR growth (last 6 months)</div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={mrrData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="mrr" name="MRR" stroke="#4F8EF7" strokeWidth={2.5} fill="url(#mrrGrad)" dot={false} activeDot={{ r: 5, fill: '#4F8EF7' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, padding: 22, boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Agency Growth</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>New agencies onboarded monthly</div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={agencyGrowth} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F2" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="agencies" name="Agencies" fill="#1A1A2E" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Agencies + System Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
                <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E4E9F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Recent Agencies</div>
                    <button onClick={() => setActiveTab('agencies')} style={{ fontSize: 12, color: '#4F8EF7', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        {['Agency', 'Plan', 'Clients', 'MRR', 'Status'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8', borderBottom: '1px solid #E4E9F2' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {agencies.slice(0, 5).map(a => (
                        <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: '#94A3B8' }}>{a.subdomain}.rankflow.app</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ ...planColors[a.plan], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                              {a.plan.charAt(0).toUpperCase() + a.plan.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.clients}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>${a.mrr}/mo</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ ...statusColors[a.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                              {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* System Status */}
                <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E4E9F2' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>System Status</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>All systems operational</div>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    {[
                      { label: 'API Gateway', status: 'operational', latency: '18ms' },
                      { label: 'Database', status: 'operational', latency: '4ms' },
                      { label: 'SE Ranking Proxy', status: 'operational', latency: '240ms' },
                      { label: 'PDF Generator', status: 'degraded', latency: '1.8s' },
                      { label: 'Email Service', status: 'operational', latency: '—' },
                    ].map((svc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid #F1F5F9' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: svc.status === 'operational' ? '#10B981' : '#F59E0B' }} />
                          <span style={{ fontSize: 13, color: '#1A1A2E', fontWeight: 500 }}>{svc.label}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: svc.status === 'operational' ? '#10B981' : '#F59E0B', fontWeight: 700 }}>{svc.status === 'operational' ? 'Operational' : 'Degraded'}</div>
                          <div style={{ fontSize: 10, color: '#94A3B8' }}>{svc.latency}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #E4E9F2', fontSize: 11, color: '#94A3B8', borderRadius: '0 0 14px 14px' }}>
                    Last checked: Just now · <a href="#" style={{ color: '#4F8EF7' }}>View Incidents</a>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ AGENCIES TAB ═══ */}
          {activeTab === 'agencies' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', letterSpacing: '-0.4px' }}>All Agencies</h1>
                  <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                    {agencies.filter(a => a.status === 'active').length} active · {agencies.filter(a => a.status === 'trial').length} trial · {agencies.filter(a => a.status === 'suspended').length} suspended
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={exportAgenciesCSV} style={btnSecondary}>
                    <Download size={13} /> Export CSV
                  </button>
                  <button onClick={() => setShowInvite(true)} style={btnPrimary}>
                    <UserPlus size={13} /> + Invite Agency
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 12, padding: '14px 18px', marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #E4E9F2', borderRadius: 8, fontSize: 13, outline: 'none', background: '#F8FAFC', color: '#1A1A2E', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    placeholder="Search agencies…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                {(['all', 'starter', 'pro', 'enterprise'] as const).map(p => (
                  <button key={p} onClick={() => setPlanFilter(p)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s', background: planFilter === p ? '#1A1A2E' : 'white', borderColor: planFilter === p ? '#1A1A2E' : '#E4E9F2', color: planFilter === p ? 'white' : '#6B7CA8' }}>
                    {p === 'all' ? 'All Plans' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>

              <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E4E9F2' }}>
                      {['Agency', 'Subdomain', 'Plan', 'Clients', 'Reports', 'MRR', 'Joined', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgencies.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ padding: '40px 16px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                          No agencies match your filters.
                        </td>
                      </tr>
                    ) : filteredAgencies.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1A1A2E, #4F8EF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                              {a.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.name}</div>
                              <div style={{ fontSize: 11, color: '#94A3B8' }}>{a.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <code style={{ fontSize: 12, background: '#F8FAFC', padding: '2px 8px', borderRadius: 6, color: '#475569', border: '1px solid #E4E9F2' }}>{a.subdomain}</code>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ ...planColors[a.plan], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {a.plan.charAt(0).toUpperCase() + a.plan.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.clients}</td>
                        <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.reports}</td>
                        <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 800, color: a.mrr > 0 ? '#2563EB' : '#94A3B8' }}>{a.mrr > 0 ? `$${a.mrr}/mo` : 'Trial'}</td>
                        <td style={{ padding: '13px 16px', fontSize: 12, color: '#94A3B8' }}>{a.joined}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ ...statusColors[a.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => setViewAgency(a)}
                              style={{ padding: '5px 10px', border: '1px solid #E4E9F2', borderRadius: 7, background: 'white', cursor: 'pointer', fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Eye size={12} /> View
                            </button>
                            {a.status === 'active' && (
                              <button
                                onClick={() => toggleSuspend(a.id)}
                                style={{ padding: '5px 10px', border: '1px solid #FECACA', borderRadius: 7, background: '#FEF2F2', cursor: 'pointer', fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
                                Suspend
                              </button>
                            )}
                            {a.status === 'suspended' && (
                              <button
                                onClick={() => toggleSuspend(a.id)}
                                style={{ padding: '5px 10px', border: '1px solid #A7F3D0', borderRadius: 7, background: '#ECFDF5', cursor: 'pointer', fontSize: 12, color: '#059669', fontWeight: 600 }}>
                                Restore
                              </button>
                            )}
                            {a.status === 'trial' && (
                              <span style={{ padding: '5px 10px', fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>Trial</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderTop: '1px solid #E4E9F2', fontSize: 12, color: '#94A3B8', borderRadius: '0 0 14px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{filteredAgencies.length} of {agencies.length} agencies</span>
                  <span>Total MRR from filtered: <strong style={{ color: '#2563EB' }}>${filteredAgencies.reduce((s, a) => s + a.mrr, 0).toLocaleString()}/mo</strong></span>
                </div>
              </div>
            </>
          )}

          {/* ═══ USERS TAB ═══ */}
          {activeTab === 'users' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>Platform Users</h1>
                  <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>{users.length} users across all agencies</p>
                </div>
                <button onClick={exportUsersCSV} style={btnSecondary}>
                  <Download size={13} /> Export CSV
                </button>
              </div>
              <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E4E9F2' }}>
                      {['User', 'Email', 'Agency', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: u.role === 'superadmin' ? 'linear-gradient(135deg,#EF4444,#DC2626)' : u.role === 'client' ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#4F8EF7,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                              {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: 12, color: '#64748B' }}>{u.email}</td>
                        <td style={{ padding: '13px 16px', fontSize: 12, color: '#64748B' }}>{u.agency}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: u.role === 'superadmin' ? '#FEF2F2' : u.role === 'client' ? '#ECFDF5' : '#EBF2FF', color: u.role === 'superadmin' ? '#DC2626' : u.role === 'client' ? '#059669' : '#2563EB' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: 12, color: '#94A3B8' }}>{u.last}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: u.status === 'active' ? '#ECFDF5' : '#F1F5F9', color: u.status === 'active' ? '#059669' : '#94A3B8' }}>
                            {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => showToast(`Manage panel for ${u.name} coming soon`)}
                              style={{ padding: '5px 12px', border: '1px solid #E4E9F2', borderRadius: 7, background: 'white', cursor: 'pointer', fontSize: 12, color: '#475569' }}>
                              Manage
                            </button>
                            {u.role !== 'superadmin' && (
                              <button
                                onClick={() => { setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' } : x)); showToast(`User ${u.status === 'active' ? 'deactivated' : 'reactivated'}`); }}
                                style={{ padding: '5px 10px', border: `1px solid ${u.status === 'active' ? '#FECACA' : '#A7F3D0'}`, borderRadius: 7, background: u.status === 'active' ? '#FEF2F2' : '#ECFDF5', cursor: 'pointer', fontSize: 12, color: u.status === 'active' ? '#DC2626' : '#059669', fontWeight: 600 }}>
                                {u.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderTop: '1px solid #E4E9F2', fontSize: 12, color: '#94A3B8', borderRadius: '0 0 14px 14px' }}>
                  {users.filter(u => u.status === 'active').length} active · {users.filter(u => u.status === 'inactive').length} inactive
                </div>
              </div>
            </>
          )}

          {/* ═══ SYSTEM HEALTH TAB ═══ */}
          {activeTab === 'system' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>System Health</h1>
                <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Real-time platform monitoring & diagnostics</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
                {[
                  { label: 'API Uptime', value: '99.97%', icon: <Globe size={20} />, color: '#10B981', bg: '#ECFDF5', trend: 'Last 30 days' },
                  { label: 'Avg Response', value: '42ms', icon: <Zap size={20} />, color: '#4F8EF7', bg: '#EBF2FF', trend: '↓ 8ms from yesterday' },
                  { label: 'DB Queries/min', value: '2,847', icon: <Database size={20} />, color: '#1A1A2E', bg: '#F1F5F9', trend: 'Peak: 4,200' },
                  { label: 'Error Rate', value: '0.03%', icon: <AlertCircle size={20} />, color: '#F59E0B', bg: '#FFFBEB', trend: 'Well within threshold' },
                ].map((k, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</span>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#1A1A2E', marginBottom: 6 }}>{k.value}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{k.trend}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  { title: 'API Services', items: [
                    { name: 'Authentication API', status: 'operational', uptime: '99.99%' },
                    { name: 'Reports API', status: 'operational', uptime: '99.95%' },
                    { name: 'SE Ranking Proxy', status: 'operational', uptime: '99.81%' },
                    { name: 'PDF Generation', status: 'degraded', uptime: '98.2%' },
                    { name: 'Webhook Dispatcher', status: 'operational', uptime: '99.97%' },
                  ]},
                  { title: 'Infrastructure', items: [
                    { name: 'Primary Database', status: 'operational', uptime: '100%' },
                    { name: 'Read Replica', status: 'operational', uptime: '100%' },
                    { name: 'CDN Edge', status: 'operational', uptime: '99.99%' },
                    { name: 'Object Storage', status: 'operational', uptime: '100%' },
                    { name: 'Email Gateway', status: 'operational', uptime: '99.93%' },
                  ]},
                ].map((section, si) => (
                  <div key={si} style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid #E4E9F2', fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>{section.title}</div>
                    {section.items.map((item, i) => (
                      <div key={i} style={{ padding: '12px 18px', borderBottom: i < section.items.length - 1 ? '1px solid #F1F5F9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.status === 'operational' ? '#10B981' : '#F59E0B' }} />
                          <span style={{ fontSize: 13, color: '#1A1A2E' }}>{item.name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: item.status === 'operational' ? '#10B981' : '#F59E0B' }}>{item.status === 'operational' ? '● Operational' : '◐ Degraded'}</span>
                          <div style={{ fontSize: 10, color: '#94A3B8' }}>{item.uptime} uptime</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═══ BILLING TAB ═══ */}
          {activeTab === 'billing' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E' }}>Billing & Revenue</h1>
                  <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Platform revenue, subscriptions, and invoices</p>
                </div>
                <button onClick={exportBillingCSV} style={btnSecondary}>
                  <Download size={13} /> Export Billing CSV
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 24 }}>
                {[
                  { label: 'Current MRR', value: `$${totalMRR.toLocaleString()}`, sub: '+18% MoM', color: '#4F8EF7' },
                  { label: 'Annual Run Rate', value: `$${(totalMRR * 12).toLocaleString()}`, sub: 'Projected ARR', color: '#10B981' },
                  { label: 'Avg Revenue / Agency', value: `$${Math.round(totalMRR / totalAgencies)}`, sub: 'Per agency per month', color: '#1A1A2E' },
                ].map((k, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, padding: 22, boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>{k.label}</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: k.color, letterSpacing: '-1px' }}>{k.value}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>{k.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'white', border: '1px solid #E4E9F2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E4E9F2', fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Revenue by Agency</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E4E9F2' }}>
                      {['Agency', 'Plan', 'MRR', 'Annual Value', 'Next Billing', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agencies.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ ...planColors[a.plan], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {a.plan.charAt(0).toUpperCase() + a.plan.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: a.mrr > 0 ? '#2563EB' : '#94A3B8' }}>{a.mrr > 0 ? `$${a.mrr}/mo` : 'Trial'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{a.mrr > 0 ? `$${(a.mrr * 12).toLocaleString()}` : '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#94A3B8' }}>{a.mrr > 0 ? 'Aug 1, 2026' : '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ ...statusColors[a.status], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderTop: '1px solid #E4E9F2', fontSize: 12, color: '#94A3B8', borderRadius: '0 0 14px 14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{agencies.length} agencies</span>
                  <span>Total MRR: <strong style={{ color: '#2563EB' }}>${totalMRR.toLocaleString()}/mo</strong> · ARR: <strong style={{ color: '#10B981' }}>${(totalMRR * 12).toLocaleString()}</strong></span>
                </div>
              </div>
            </>
          )}

          </>)}
        </div>
      </div>

      {/* ─── Modals ─── */}
      {viewAgency && <AgencyDetailModal agency={viewAgency} onClose={() => setViewAgency(null)} onVisitDashboard={() => { setAgencyDashView(viewAgency); setActiveTab('agencies'); }} />}
      {showInvite && <InviteAgencyModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />}
      {activeSystemModal === 'security' && <SecurityModal onClose={() => setActiveSystemModal(null)} showToast={showToast} />}
      {activeSystemModal === 'settings' && <SettingsModal onClose={() => setActiveSystemModal(null)} showToast={showToast} />}
      {activeSystemModal === 'audit' && <AuditLogsModal onClose={() => setActiveSystemModal(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   SECURITY & KEYS MODAL
══════════════════════════════════════════════════════ */
function SecurityModal({ onClose, showToast }: { onClose: () => void; showToast: (msg: string) => void }) {
  const [keys, setKeys] = useState([
    { name: 'SE Ranking Main API Gateway', key: 'ser_live_948f2j48dfh4982dh29d287dh91', created: 'Jan 2024', status: 'active' },
    { name: 'OpenAI GPT-4 Integration Key', key: 'sk-proj-498dh28hd92hd92dh28dhd28h2d', created: 'Mar 2024', status: 'active' },
    { name: 'Resend System Mailer API', key: 're_498dh28h_92hd28hd92hd92dh', created: 'Jan 2024', status: 'active' },
    { name: 'Google Search Console Verification', key: 'gsc_ver_92hd92hd92dh92dh298dh', created: 'Jun 2024', status: 'inactive' },
  ]);
  const [newKeyName, setNewKeyName] = useState('');

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    showToast('API Key copied to clipboard.');
  };

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    const newKey = {
      name: newKeyName,
      key: `key_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      created: 'Today',
      status: 'active',
    };
    setKeys(prev => [newKey, ...prev]);
    setNewKeyName('');
    showToast(`Key "${newKeyName}" generated successfully.`);
  };

  return (
    <Modal title="API Security & Gateway Keys" onClose={onClose}>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>Generate New API Key</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="e.g. OpenAI Backup Integration"
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            style={{ flex: 1, padding: '9px 12px', borderRadius: 9, fontSize: 13, border: '1.5px solid #E4E9F2', outline: 'none', background: '#F8FAFC', color: '#1A1A2E' }}
          />
          <button
            onClick={handleCreate}
            style={{ padding: '0 18px', borderRadius: 9, background: 'linear-gradient(135deg,#1A1A2E,#2563EB)', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Generate Key
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
        {keys.map((k, idx) => (
          <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E4E9F2', borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{k.name}</span>
              <span style={{ 
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                background: k.status === 'active' ? '#ECFDF5' : '#F1F5F9',
                color: k.status === 'active' ? '#059669' : '#64748B'
              }}>
                {k.status.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '6px 10px', borderRadius: 8 }}>
              <code style={{ flex: 1, fontSize: 11, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {k.key}
              </code>
              <button 
                onClick={() => handleCopy(k.key)}
                style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
              >
                Copy
              </button>
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 6 }}>Created: {k.created}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, background: '#F1F5F9', color: '#64748B', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Done
        </button>
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════
   SYSTEM CONFIGURATION MODAL
══════════════════════════════════════════════════════ */
function SettingsModal({ onClose, showToast }: { onClose: () => void; showToast: (msg: string) => void }) {
  const [cfg, setCfg] = useState({
    maintenance: false,
    signups: true,
    verifyEmail: true,
    supportEmail: 'support@rankflow.app',
    systemDomain: 'rankflow.app',
    rateLimit: '120',
  });

  const handleToggle = (key: 'maintenance' | 'signups' | 'verifyEmail') => {
    setCfg(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    showToast('System settings saved successfully.');
    onClose();
  };

  return (
    <Modal title="Global System Settings" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Signups Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E4E9F2', borderRadius: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>Public Agency Registrations</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Allow new agencies to sign up for trials publicly</div>
          </div>
          <button 
            onClick={() => handleToggle('signups')}
            style={{ 
              padding: '6px 14px', borderRadius: 8, 
              background: cfg.signups ? '#ECFDF5' : '#FEF2F2', 
              color: cfg.signups ? '#059669' : '#DC2626', 
              border: `1.5px solid ${cfg.signups ? '#A7F3D0' : '#FECACA'}`,
              fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }}
          >
            {cfg.signups ? 'Signups Allowed' : 'Signups Paused'}
          </button>
        </div>

        {/* Email Verification Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E4E9F2', borderRadius: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>Enforce Email Verification</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Requires agencies to verify emails before portal access</div>
          </div>
          <button 
            onClick={() => handleToggle('verifyEmail')}
            style={{ 
              padding: '6px 14px', borderRadius: 8, 
              background: cfg.verifyEmail ? '#ECFDF5' : '#F1F5F9', 
              color: cfg.verifyEmail ? '#059669' : '#64748B', 
              border: `1.5px solid ${cfg.verifyEmail ? '#A7F3D0' : '#E2E8F0'}`,
              fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }}
          >
            {cfg.verifyEmail ? 'Enforced' : 'Off'}
          </button>
        </div>

        {/* Maintenance Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E4E9F2', borderRadius: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>Global Maintenance Mode</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Locks the system for scheduled platform upgrades</div>
          </div>
          <button 
            onClick={() => handleToggle('maintenance')}
            style={{ 
              padding: '6px 14px', borderRadius: 8, 
              background: cfg.maintenance ? '#FEF2F2' : '#F1F5F9', 
              color: cfg.maintenance ? '#DC2626' : '#64748B', 
              border: `1.5px solid ${cfg.maintenance ? '#FECACA' : '#E2E8F0'}`,
              fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }}
          >
            {cfg.maintenance ? 'Offline Enabled' : 'Live Mode'}
          </button>
        </div>

        {/* Text Input Configurations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>Operator Email Address</label>
            <input
              type="email"
              value={cfg.supportEmail}
              onChange={e => setCfg(prev => ({ ...prev, supportEmail: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 13, border: '1.5px solid #E4E9F2', outline: 'none', background: '#F8FAFC', color: '#1A1A2E' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>Base Portal Domain</label>
            <input
              type="text"
              value={cfg.systemDomain}
              onChange={e => setCfg(prev => ({ ...prev, systemDomain: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 13, border: '1.5px solid #E4E9F2', outline: 'none', background: '#F8FAFC', color: '#1A1A2E' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 5 }}>API Global Rate Limit (requests / min)</label>
          <input
            type="number"
            value={cfg.rateLimit}
            onChange={e => setCfg(prev => ({ ...prev, rateLimit: e.target.value }))}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 13, border: '1.5px solid #E4E9F2', outline: 'none', background: '#F8FAFC', color: '#1A1A2E' }}
          />
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
        <button onClick={handleSave} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'linear-gradient(135deg,#1A1A2E,#2563EB)', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Save Configuration
        </button>
        <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: '#F1F5F9', color: '#64748B', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════
   SYSTEM AUDIT TRAILS MODAL
══════════════════════════════════════════════════════ */
function AuditLogsModal({ onClose }: { onClose: () => void }) {
  const [filterQuery, setFilterQuery] = useState('');
  
  const rawLogs = [
    { op: 'Suspended agency account', target: 'VelocityRank', user: 'Super Admin', ip: '192.168.1.42', time: 'Jul 17, 13:22' },
    { op: 'Generated PDF export report', target: '#RPT-00001 (Acme Corp)', user: 'Super Admin', ip: '192.168.1.42', time: 'Jul 17, 13:21' },
    { op: 'Modified portal configurations', target: 'Email Verify Option', user: 'Super Admin', ip: '192.168.1.42', time: 'Jul 17, 13:18' },
    { op: 'Invited new agency', target: 'BlueOcean SEO (trial)', user: 'Super Admin', ip: '192.168.1.42', time: 'Jul 17, 09:44' },
    { op: 'API key regenerated', target: 'SE Ranking Main API Gateway', user: 'Super Admin', ip: '10.0.8.12', time: 'Jul 16, 21:04' },
    { op: 'Restored suspended account', target: 'RankMaster Co', user: 'Super Admin', ip: '192.168.1.42', time: 'Jul 15, 14:15' },
    { op: 'Operator login success', target: 'Session Handshake', user: 'Super Admin', ip: '192.168.1.42', time: 'Jul 15, 08:30' },
  ];

  const filteredLogs = rawLogs.filter(l => 
    l.op.toLowerCase().includes(filterQuery.toLowerCase()) || 
    l.target.toLowerCase().includes(filterQuery.toLowerCase()) ||
    l.ip.includes(filterQuery)
  );

  return (
    <Modal title="Operator Audit & Security Log" onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Filter logs by operation, target, or IP..."
          value={filterQuery}
          onChange={e => setFilterQuery(e.target.value)}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 13, border: '1.5px solid #E4E9F2', outline: 'none', background: '#F8FAFC', color: '#1A1A2E' }}
        />
      </div>

      <div style={{ border: '1px solid #E4E9F2', borderRadius: 12, overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E4E9F2' }}>
              <th style={{ padding: '8px 12px', fontSize: 10, color: '#64748B', textAlign: 'left' }}>Operation</th>
              <th style={{ padding: '8px 12px', fontSize: 10, color: '#64748B', textAlign: 'left' }}>Target</th>
              <th style={{ padding: '8px 12px', fontSize: 10, color: '#64748B', textAlign: 'left' }}>IP Address</th>
              <th style={{ padding: '8px 12px', fontSize: 10, color: '#64748B', textAlign: 'left' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>No logs match filter</td></tr>
            ) : (
              filteredLogs.map((l, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#1F2937' }}>{l.op}</td>
                  <td style={{ padding: '10px 12px', fontSize: 11, color: '#4B5563' }}>{l.target}</td>
                  <td style={{ padding: '10px 12px', fontSize: 11, color: '#6B7280' }}><code>{l.ip}</code></td>
                  <td style={{ padding: '10px 12px', fontSize: 11, color: '#9CA3AF' }}>{l.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 10, background: '#F1F5F9', color: '#64748B', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Close Logs
        </button>
      </div>
    </Modal>
  );
}
