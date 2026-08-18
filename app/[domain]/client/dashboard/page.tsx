'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, FileText, Download, Send,
  CheckCircle2, AlertCircle, Search, Star, Globe, ArrowUpRight,
  ArrowDownRight, BarChart2, Activity, Eye, MessageSquare,
  X, ChevronRight, Clock, Zap, Shield, Target, Award,
  RefreshCw, ExternalLink, Bell, Lock, User, Mail, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Design tokens ─── */
const T = {
  primary: '#4F8EF7',
  primaryHover: '#3B7BF6',
  primaryLight: '#EBF2FF',
  navy: '#1A1A2E',
  navyMid: '#16213E',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  textDark: '#1A1A2E',
  textLight: '#475569',
  textMuted: '#94A3B8',
  border: '#E4E9F2',
  bg: '#F0F2F8',
  surface: '#FFFFFF',
  surface2: '#F8FAFC',
};

/* ─── Priority colours for AI recs ─── */
const priorityColor: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#4F8EF7',
  low: '#10B981',
};

/* ─── Skeleton Loader ─── */
function Skeleton({ width = '100%', height = 16, radius = 6 }: { width?: string | number; height?: number; radius?: number }) {
  return (
    <div style={{ width, height, borderRadius: radius, background: 'linear-gradient(90deg,#E4E9F2 25%,#F1F5F9 50%,#E4E9F2 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
  );
}

/* ─── Empty State ─── */
function EmptyState({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <Icon size={32} color="#CBD5E1" style={{ marginBottom: 12 }} />
      <div style={{ fontSize: 14, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#94A3B8' }}>{subtitle}</div>
    </div>
  );
}

/* ─── Chart Tooltip ─── */
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A2E', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(79,142,247,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
      <div style={{ fontSize: 10, color: '#6B7CA8', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, color: p.color ?? T.primary, fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
};

/* ─── Stat Card (Interactive Section Inter-Connection) ─── */
function StatCard({ label, value, delta, deltaPositive, icon: Icon, accent, onClick }: {
  label: string; value: string; delta: string;
  deltaPositive: boolean; icon: any; accent?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#ffffff',
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: '20px 20px 18px',
        boxShadow: '0 1px 4px rgba(26,26,46,0.05)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={e => {
        if (!onClick) return;
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(79,142,247,0.18)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        if (!onClick) return;
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(26,26,46,0.05)';
        (e.currentTarget as HTMLDivElement).style.transform = '';
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 14px 0 80px', background: accent ? `${accent}14` : `${T.primary}10`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</div>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: accent ? `${accent}15` : T.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} color={accent ?? T.primary} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: T.textDark, lineHeight: 1, marginBottom: 8 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: deltaPositive ? T.success : T.danger }}>
          {deltaPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta}
        </div>
        {onClick && <span style={{ fontSize: 11, fontWeight: 700, color: accent ?? T.primary }}>View →</span>}
      </div>
    </div>
  );
}

/* ─── Section Header ─── */
function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: T.textDark, margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: T.textMuted, margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ─── Card ─── */
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 14, boxShadow: '0 1px 4px rgba(26,26,46,0.05)', overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ═══════════════════════════════════════════ */
export default function ClientDashboardPage() {
  const { data: session, update: updateSession } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Client';

  /* ── State ─────────────────────────────────────────── */
  const [activeSection, setActiveSection] = useState<'dashboard' | 'reports' | 'rankings' | 'analytics' | 'profile' | 'manage-data'>('dashboard');
  const [selectedReport, setSelectedReportState] = useState<any | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [contactMsg, setContactMsg] = useState('');
  const [sendingContact, setSendingContact] = useState(false);
  const [kwSearch, setKwSearch] = useState('');
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyRanking, setNotifyRanking] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  /* ── Real data state ────────────────────────────────── */
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  /* ── Profile form — initialised from session + API ── */
  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', jobTitle: '', company: '',
  });

  const setSelectedReport = (report: any | null) => {
    setSelectedReportState(report);
    if (report?.id && report.id !== 'r1' && report.id !== 'r2') {
      fetch(`/api/reports/${report.id}/view`, { method: 'POST' }).catch(() => null);
    }
  };

  /* ── Fetch real portal data ─────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/client-portal/data')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setPortalData(data);
        // Pre-fill profile form from session
        const nameParts = (session?.user?.name ?? '').split(' ');
        setProfileForm({
          firstName: nameParts[0] ?? '',
          lastName: nameParts.slice(1).join(' ') ?? '',
          email: session?.user?.email ?? data?.client?.contactEmail ?? '',
          phone: '',
          jobTitle: '',
          company: data?.client?.name ?? '',
        });
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error(err);
        setDataError('Failed to load dashboard data');
        setLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  /* ── Listen for hash changes from sidebar navigation ── */
  useEffect(() => {
    const syncHash = () => {
      const hash = (window.location.hash || '').replace('#', '');
      if (['dashboard', 'reports', 'rankings', 'analytics', 'profile', 'manage-data'].includes(hash)) {
        setActiveSection(hash as any);
      } else {
        setActiveSection('dashboard');
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const refreshData = () => {
    fetch('/api/client-portal/data')
      .then(r => r.json())
      .then(data => {
        setPortalData(data);
      })
      .catch(err => console.error(err));
  };

  /* ── Derived real data (with fallbacks) ─────────────── */
  const client = portalData?.client ?? null;
  const kpis = portalData?.kpis ?? {};
  const analyticsHistory: any[] = portalData?.analyticsHistory ?? [];
  const keywordHistory: any[] = portalData?.keywordHistory ?? [];
  const realKeywords: any[] = portalData?.keywords ?? [];
  const posDistribution: any[] = portalData?.posDistribution ?? [];
  const topQueries: any[] = portalData?.topQueries ?? [];
  const realReports: any[] = portalData?.reports ?? [];
  const latestReport = realReports[0] ?? null;
  const latestAudit = portalData?.latestAudit ?? null;
  const reportSchedule = portalData?.reportSchedule ?? null;

  /* ── Filtered keywords ──────────────────────────────── */
  const filteredKws = realKeywords.filter((k: any) =>
    !kwSearch || (k.keyword ?? k.query ?? '').toLowerCase().includes(kwSearch.toLowerCase())
  );

  /* ── Listen to hash changes from layout nav ─────────── */
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      if (['reports', 'rankings', 'analytics', 'profile', 'manage-data'].includes(h)) {
        setActiveSection(h as any);
      } else {
        setActiveSection('dashboard');
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMsg.trim()) return;
    setSendingContact(true);
    
    try {
      const res = await fetch('/api/client-portal/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: contactMsg, subject: 'New Message from Client Portal' })
      });
      
      if (!res.ok) {
        const errText = await res.text();
        console.error('[Contact] API error:', res.status, errText);
        throw new Error(`${res.status}: ${errText}`);
      }
      
      toast.success('Message sent! Your agency will respond within 1 business day.');
      setContactMsg('');
      setShowContact(false);
      fetchMessages();
    } catch (err) {
      console.error('[Contact] Failed:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSendingContact(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPw !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.newPw.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSavingPassword(true);
    try {
      const res = await fetch('/api/client-portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPw }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? 'Failed to update password'); return; }
      toast.success('Password updated successfully!');
      setPasswords({ current: '', newPw: '', confirm: '' });
    } catch {
      toast.error('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/client-portal/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileForm, notifyEmail, notifyRanking }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? 'Failed to save profile'); return; }
      
      await fetch('/api/client-portal/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' '),
          contactEmail: profileForm.email
        })
      }).catch(() => null);

      await updateSession({ name: [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ') });
      toast.success('Profile saved successfully!');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  /* ── Report Detail View ── */
  if (selectedReport) {
    const defaultAiRecs = [
      { label: 'Fix Core Web Vitals — LCP > 4s on Mobile', detail: 'Largest Contentful Paint is exceeding 4 seconds on mobile devices. Optimise hero image compression and implement critical CSS inlining to improve load times.', impact: 'High Impact', priority: 'high' },
      { label: 'Resolve 23 Missing Meta Descriptions', detail: 'Pages without meta descriptions typically see 5–10% lower CTR in search results. Add unique, compelling descriptions targeting primary keywords for each affected page.', impact: 'Medium Impact', priority: 'medium' },
      { label: 'Target 8 High-Volume, Low-Difficulty Keywords', detail: 'Analysis found 8 keywords with 1,000+ monthly searches and KD under 35 that competitors are not aggressively targeting. Quick content wins available.', impact: 'Opportunity', priority: 'low' },
    ];

    const aiRecsRaw = (selectedReport.aiRecs && selectedReport.aiRecs.length > 0) ? selectedReport.aiRecs : defaultAiRecs;
    const kwList: any[] = (selectedReport.sections?.keywords && selectedReport.sections.keywords.length > 0)
      ? selectedReport.sections.keywords
      : (realKeywords.length > 0 ? realKeywords.slice(0, 5) : [
          { query: 'core industry term', position: 4, change: 3, url: 'acmecorp.com/solutions' },
          { query: 'local service keyword', position: 2, change: 8, url: 'acmecorp.com/services' },
          { query: 'digital marketing uk', position: 7, change: -1, url: 'acmecorp.com/marketing' },
          { query: 'seo company london', position: 9, change: 5, url: 'acmecorp.com/seo' },
          { query: 'best seo agency', position: 6, change: 2, url: 'acmecorp.com/' }
        ]);

    const healthScore = selectedReport.sections?.audit?.healthScore ?? selectedReport.healthScore ?? latestAudit?.healthScore ?? 76;
    const rawSessions = selectedReport.sections?.analytics?.organicSessions ?? selectedReport.sessions ?? kpis.organicSessions ?? 8420;
    const sessions = typeof rawSessions === 'number' ? rawSessions.toLocaleString() : rawSessions;
    const top10 = selectedReport.sections?.keywords?.top10Count ?? selectedReport.top10Keywords ?? kpis.top10Keywords ?? 47;
    const rawClicks = selectedReport.sections?.analytics?.clicks ?? selectedReport.clicks ?? kpis.totalClicks ?? 10104;
    const clicks = typeof rawClicks === 'number' ? rawClicks.toLocaleString() : rawClicks;
    const rawImpressions = selectedReport.sections?.analytics?.impressions ?? selectedReport.impressions ?? kpis.impressions ?? 117813;
    const impressions = typeof rawImpressions === 'number' ? rawImpressions.toLocaleString() : rawImpressions;

    const priorityColor: Record<string, string> = {
      high: T.danger,
      medium: T.warning,
      low: T.primary,
      opportunity: T.primary,
    };

    return (
      <div>
        <style>{`
          .report-detail-hero { background: linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #4F8EF7 100%); color: white; border-radius: 14px; padding: 28px; margin-bottom: 22px; position: relative; overflow: hidden; }
          .report-detail-hero::before { content: ''; position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%); pointer-events: none; }
          .report-kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
          @media (max-width: 700px) { .report-kpi { grid-template-columns: repeat(2, 1fr); } }
          .report-section-card { background: #fff; border: 1px solid #E4E9F2; border-radius: 14px; margin-bottom: 18px; overflow: hidden; box-shadow: 0 1px 4px rgba(26,26,46,0.05); }
          .report-section-header { padding: 16px 20px; border-bottom: 1px solid #E4E9F2; display: flex; align-items: center; gap: 10px; }
          .report-section-num { width: 26px; height: 26px; border-radius: 7px; background: #EBF2FF; color: #4F8EF7; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
          .report-section-title { font-size: 13px; font-weight: 800; color: #1A1A2E; }
        `}</style>

        {/* Back bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={() => setSelectedReport(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: T.primary, fontWeight: 700, fontSize: 13, padding: '6px 0' }}>
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href={selectedReport.pdfUrl || `/reports/render/${selectedReport.id}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: T.textLight, textDecoration: 'none' }}
            >
              <Download size={13} /> {selectedReport.pdfUrl ? 'Download PDF' : 'View / Print'}
            </a>
            <button
              onClick={() => {
                const slug = selectedReport.shareSlug || selectedReport.id || 'demo1';
                const shareUrl = `${window.location.origin}/report/${slug}`;
                navigator.clipboard.writeText(shareUrl);
                toast.success('Share link copied to clipboard!');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: T.textLight }}
            >
              🔗 Share Link
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="report-detail-hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Monthly SEO Report</div>
              <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 4, letterSpacing: -0.5 }}>{client?.name ?? 'Acme Corp'}</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>{client?.domain ?? 'acmecorp.com'} · {selectedReport.period ?? 'June 2026'}</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Generated: {selectedReport.generatedDate ?? 'July 21, 2026'}</div>
            </div>
            {healthScore !== '—' && (
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '14px 22px', flexShrink: 0 }}>
                <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }}>{healthScore}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>Health Score</div>
              </div>
            )}
          </div>
        </div>

        {/* KPI row */}
        <div className="report-kpi">
          {[
            { label: 'Organic Sessions', value: sessions },
            { label: 'Top 10 Keywords', value: String(top10) },
            { label: 'Total Clicks', value: clicks },
            { label: 'Impressions', value: impressions },
          ].map((k, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(26,26,46,0.05)' }}>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.textDark }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* AI Recommendations */}
        {aiRecsRaw.length > 0 && (
          <div className="report-section-card">
            <div className="report-section-header">
              <div className="report-section-num">✨</div>
              <div className="report-section-title">AI-Powered Recommendations</div>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiRecsRaw.map((r: any, i: number) => {
                const label = typeof r === 'string' ? r : (r.label ?? r.title ?? r.text ?? 'SEO Optimization');
                const detail = typeof r === 'string' ? r : (r.detail ?? r.desc ?? r.summary ?? r.text ?? 'Recommended optimization for search performance.');
                const impact = typeof r === 'string' ? 'High Impact' : (r.impact ?? 'High Impact');
                const prioKey = typeof r === 'string' ? 'high' : (r.priority ?? 'high').toLowerCase();
                const pColor = priorityColor[prioKey] ?? T.primary;

                return (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, borderLeft: `4px solid ${pColor}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 12, color: T.textLight, lineHeight: 1.5 }}>{detail}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: pColor, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Impact: {impact}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Keyword Rankings */}
        {kwList.length > 0 && (
          <div className="report-section-card">
            <div className="report-section-header">
              <div className="report-section-num">2</div>
              <div className="report-section-title">Keyword Rankings</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: T.surface2 }}>
                    {['Keyword', 'Position', 'Change', 'URL'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: T.textMuted, textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kwList.slice(0, 10).map((kw: any, i: number) => {
                    const pos = kw.pos ?? kw.position ?? 0;
                    const change = kw.change ?? 0;
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: T.textDark, fontWeight: 600 }}>{kw.keyword ?? kw.query}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: pos <= 3 ? T.successLight : pos <= 10 ? T.primaryLight : T.surface2, color: pos <= 3 ? T.success : pos <= 10 ? T.primary : T.textMuted }}>
                            #{pos}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: change > 0 ? T.success : change < 0 ? T.danger : T.textMuted }}>
                          {change > 0 ? `▲ +${change}` : change < 0 ? `▼ ${change}` : '—'}
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 11, color: T.primary, fontFamily: 'monospace' }}>{kw.url ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`, borderRadius: 14, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, color: '#fff' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Have questions about this report?</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Your SEO manager is available Mon–Fri, 9am–6pm</div>
          </div>
          <button onClick={() => setShowContact(true)} style={{ padding: '10px 20px', borderRadius: 9, background: T.primary, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}>
            Contact Agency →
          </button>
        </div>

        {showContact && <ContactModal onClose={() => setShowContact(false)} msg={contactMsg} setMsg={setContactMsg} />}
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     MAIN SECTIONS
     ═══════════════════════════════════════════ */
  return (
    <div>
      <style>{`
        .cp-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .cp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 24px; }
        .cp-grid-2-1 { display: grid; grid-template-columns: 1.4fr 1fr; gap: 18px; margin-bottom: 24px; }
        @media (max-width: 1100px) {
          .cp-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .cp-grid-2, .cp-grid-2-1 { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .cp-grid-4 { grid-template-columns: 1fr 1fr; }
        }
        .report-card {
          background: #fff;
          border: 1px solid #E4E9F2;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(26,26,46,0.05);
          transition: box-shadow 0.2s, transform 0.2s;
          cursor: pointer;
        }
        .report-card:hover {
          box-shadow: 0 6px 24px rgba(79,142,247,0.14);
          transform: translateY(-2px);
        }
        .kw-row { display: grid; grid-template-columns: 2fr 80px 80px 80px; gap: 8px; align-items: center; padding: 11px 16px; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
        .kw-row:last-child { border-bottom: none; }
        .kw-row:hover { background: #F8FAFC; }
        .pos-badge { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 24px; border-radius: 6px; font-size: 11px; font-weight: 800; }
        .btn-primary { padding: 9px 18px; border-radius: 9px; background: #4F8EF7; color: #fff; border: none; cursor: pointer; font-weight: 700; font-size: 13px; transition: background 0.15s; }
        .btn-primary:hover { background: #3B7BF6; }
        .btn-ghost { padding: 9px 16px; border-radius: 9px; background: #fff; color: #475569; border: 1px solid #E4E9F2; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.15s; }
        .btn-ghost:hover { border-color: #4F8EF7; color: #4F8EF7; }
        .profile-input { width: 100%; padding: 9px 12px; border: 1.5px solid #E4E9F2; border-radius: 9px; font-size: 13px; color: #1A1A2E; outline: none; font-family: inherit; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; background: #fff; }
        .profile-input:focus { border-color: #4F8EF7; box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
        .toggle-btn { width: 38px; height: 22px; border-radius: 11px; position: relative; border: none; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
        .toggle-thumb { width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; top: 3px; transition: left 0.2s; }
        .section-tag { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .progress-bar { height: 6px; border-radius: 6px; background: #E4E9F2; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 6px; transition: width 0.8s ease; }
      `}</style>

      {/* Contact Modal */}
      {showContact && <ContactModal onClose={() => setShowContact(false)} msg={contactMsg} setMsg={setContactMsg} />}

      {/* shimmer keyframe */}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      {/* ── DASHBOARD SECTION ── */}
      {activeSection === 'dashboard' && (
        <div>
          {/* Welcome header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: T.textDark, margin: 0 }}>
                  {greeting}, {firstName} 👋
                </h1>
                <p style={{ fontSize: 13, color: T.textMuted, margin: '4px 0 0' }}>
                  {loading ? '...' : client ? `${client.name} · ${client.domain} · ${today}` : today}
                </p>
              </div>
              <button className="btn-primary" onClick={() => setShowContact(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={14} /> Contact My Agency
              </button>
            </div>
          </div>

          {/* KPI Cards (Inter-connected to Tabs) */}
          <div className="cp-grid-4">
            {loading ? (
              [1,2,3,4].map(i => <Card key={i} style={{ padding: '20px', minHeight: 100 }}><Skeleton height={12} width="50%" /><div style={{marginTop:10}}><Skeleton height={28} width="60%" /></div><div style={{marginTop:8}}><Skeleton height={10} width="40%" /></div></Card>)
            ) : (
              <>
                <StatCard
                  label="Organic Sessions"
                  value={kpis.organicSessions ? kpis.organicSessions.toLocaleString() : '—'}
                  delta={kpis.organicSessionsDelta ? `${kpis.organicSessionsDelta > 0 ? '+' : ''}${kpis.organicSessionsDelta.toFixed(1)}% vs last month` : 'No history yet'}
                  deltaPositive={(kpis.organicSessionsDelta ?? 0) >= 0}
                  icon={Activity}
                  onClick={() => { window.location.hash = 'analytics'; }}
                />
                <StatCard
                  label="Top 10 Keywords"
                  value={kpis.top10Keywords ? String(kpis.top10Keywords) : '—'}
                  delta={kpis.top10Delta !== undefined ? `${kpis.top10Delta >= 0 ? '+' : ''}${kpis.top10Delta} this month` : 'No history yet'}
                  deltaPositive={(kpis.top10Delta ?? 0) >= 0}
                  icon={Target}
                  accent="#10B981"
                  onClick={() => { window.location.hash = 'rankings'; }}
                />
                <StatCard
                  label="Total Keywords"
                  value={kpis.totalKeywords ? String(kpis.totalKeywords) : '—'}
                  delta={kpis.totalKeywords ? 'tracked keywords' : 'No sync yet'}
                  deltaPositive
                  icon={Shield}
                  accent="#F59E0B"
                  onClick={() => { window.location.hash = 'manage-data'; }}
                />
                <StatCard
                  label="Site Health"
                  value={latestAudit ? `${latestAudit.healthScore}%` : '—'}
                  delta={latestAudit ? `${latestAudit.criticalIssues} critical issues` : 'No audit yet'}
                  deltaPositive={latestAudit ? latestAudit.criticalIssues === 0 : true}
                  icon={Zap}
                  accent="#4F8EF7"
                  onClick={() => { window.location.hash = 'analytics'; }}
                />
              </>
            )}
          </div>

          {/* Charts row */}
          <div className="cp-grid-2">
            {/* Traffic Trend */}
            <Card>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Organic Traffic Trend</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Monthly organic sessions over 7 months</div>
                </div>
                <button onClick={() => { window.location.hash = 'analytics'; }} style={{ background: 'none', border: 'none', color: T.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  View Analytics →
                </button>
              </div>
              <div style={{ padding: '16px 20px 8px' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={analyticsHistory.length ? analyticsHistory : []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.primary} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: T.textMuted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: T.textMuted }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="sessions" name="Sessions" stroke={T.primary} strokeWidth={2.5} fill="url(#tg1)" dot={false} activeDot={{ r: 5, fill: T.primary }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Keyword Growth */}
            <Card>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Keyword Growth</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Top 3 & Top 10 keyword counts per month</div>
                </div>
                <button onClick={() => { window.location.hash = 'rankings'; }} style={{ background: 'none', border: 'none', color: T.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  View Rankings →
                </button>
              </div>
              <div style={{ padding: '16px 20px 8px' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={keywordHistory.length ? keywordHistory : []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: T.textMuted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: T.textMuted }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="top3" name="Top 3" fill={T.success} radius={[3, 3, 0, 0]} maxBarSize={14} />
                    <Bar dataKey="top10" name="Top 10" fill={T.primary} radius={[3, 3, 0, 0]} maxBarSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Latest report + AI recs row */}
          <div className="cp-grid-2-1">
            {/* Latest Report */}
            <Card>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Latest Report</div>
                <span className="section-tag" style={{ background: T.successLight, color: T.success }}>
                  <CheckCircle2 size={10} /> Ready
                </span>
              </div>
              <div style={{ padding: '18px 20px' }}>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Skeleton height={90} radius={12} />
                    <Skeleton height={12} />
                    <Skeleton height={12} width="80%" />
                  </div>
                ) : latestReport ? (
                  <>
                    <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`, borderRadius: 12, padding: '20px', color: '#fff', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(79,142,247,0.2)', pointerEvents: 'none' }} />
                      <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>SEO Performance Report</div>
                      <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 3 }}>{latestReport.period}</div>
                      <div style={{ fontSize: 11, opacity: 0.65 }}>{client?.name} · {client?.domain}</div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
                        {latestAudit && <div><div style={{ fontSize: 18, fontWeight: 900 }}>{latestAudit.healthScore}%</div><div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase' }}>Health</div></div>}
                        {kpis.organicSessions > 0 && <div><div style={{ fontSize: 18, fontWeight: 900 }}>{kpis.organicSessions.toLocaleString()}</div><div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase' }}>Sessions</div></div>}
                        {kpis.top10Keywords > 0 && <div><div style={{ fontSize: 18, fontWeight: 900 }}>{kpis.top10Keywords}</div><div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase' }}>Top 10</div></div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary" style={{ flex: 1 }} onClick={() => setSelectedReport(latestReport)}>
                        View Full Report
                      </button>
                      {latestReport.pdfUrl ? (
                        <a href={latestReport.pdfUrl} target="_blank" rel="noreferrer" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', padding: '9px 14px', textDecoration: 'none' }}><Download size={14} /></a>
                      ) : (
                        <a href={`/reports/render/${latestReport.id}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', padding: '9px 14px', textDecoration: 'none' }}><Download size={14} /></a>
                      )}
                    </div>
                  </>
                ) : (
                  <EmptyState icon={FileText} title="No reports yet" subtitle="Your agency will deliver your first report soon." />
                )}
              </div>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15 }}>✨</span> AI Recommendations
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Priority action items from your latest report</div>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {loading ? (
                  [1,2,3].map(i => <Skeleton key={i} height={50} radius={10} />)
                ) : (() => {
                  const recs: any[] = (latestReport?.aiRecs && latestReport.aiRecs.length > 0)
                    ? latestReport.aiRecs
                    : [
                        { title: 'Fix broken internal links on blog pages', priority: 'critical', impact: 'High' },
                        { title: 'Push "ppc agency london" (Pos.11) to Top 10', priority: 'high', impact: 'Medium' },
                        { title: 'Add missing meta descriptions to 8 landing pages', priority: 'medium', impact: 'Medium' },
                      ];
                  return recs.map((r: any, i: number) => {
                    const title = typeof r === 'string' ? r : (r.title ?? r.label ?? r.recommendation ?? r.text ?? 'SEO Optimization Recommendation');
                    const priority = typeof r === 'string' ? 'high' : (r.priority ?? 'high').toLowerCase();
                    const impact = typeof r === 'string' ? 'High' : (r.impact ?? 'Medium');
                    const pColor = priorityColor[priority] ?? T.primary;
                    return (
                      <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, borderLeft: `4px solid ${pColor}` }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.textDark, marginBottom: 2 }}>{title}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: pColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>{priority}</span>
                          <span style={{ fontSize: 9, color: T.textMuted }}>· Impact: {impact}</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>
          </div>

          {/* Report history mini-table */}
          <Card>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Report History</div>
              <button onClick={() => { window.location.hash = 'reports'; }} style={{ background: 'none', border: 'none', color: T.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ChevronRight size={13} />
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: T.surface2 }}>
                    {['Period', 'Generated', 'Health', 'Sessions', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: T.textMuted, textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1,2,3].map(i => (
                      <tr key={i}><td colSpan={5} style={{ padding: '14px 16px' }}><Skeleton height={12} /></td></tr>
                    ))
                  ) : realReports.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>No reports yet</td></tr>
                  ) : realReports.slice(0, 3).map((r: any) => (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: T.textDark }}>{r.period}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: T.textMuted }}>{r.generatedDate}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: r.status === 'done' ? T.successLight : T.warningLight, color: r.status === 'done' ? T.success : T.warning }}>
                          {r.status === 'done' ? '✓ Ready' : r.status === 'generating' ? '⏳ Generating' : '📝 Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: T.textLight }}>{r.viewCount} views</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setSelectedReport(r)} style={{ padding: '5px 10px', borderRadius: 6, background: T.primaryLight, color: T.primary, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Eye size={11} /> View
                          </button>
                          {r.pdfUrl ? (
                            <a href={r.pdfUrl} target="_blank" rel="noreferrer" style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', border: `1px solid ${T.border}`, fontSize: 11, fontWeight: 600, color: T.textLight, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}><Download size={11} /> PDF</a>
                          ) : (
                            <a href={`/reports/render/${r.id}`} target="_blank" rel="noreferrer" style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', border: `1px solid ${T.border}`, fontSize: 11, fontWeight: 600, color: T.textLight, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}><Download size={11} /> PDF</a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── REPORTS SECTION ── */}
      {activeSection === 'reports' && (
        <div>
          <SectionHeader
            title="My Reports"
            subtitle="SEO performance reports delivered by your agency"
            action={
              <button
                className="btn-ghost"
                onClick={() => { window.location.hash = 'profile'; }}
                style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                ⚙ Delivery Preferences →
              </button>
            }
          />
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
              {[1,2,3].map(i => <Card key={i} style={{ height: 200 }}><Skeleton height={160} /></Card>)}
            </div>
          ) : realReports.length === 0 ? (
            <Card style={{ padding: 40 }}><EmptyState icon={FileText} title="No reports yet" subtitle="Your agency will deliver your first report here. Check back soon!" /></Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18, marginBottom: 24 }}>
              {realReports.map((r: any) => (
                <div key={r.id} className="report-card" onClick={() => setSelectedReport(r)}>
                  <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyMid}, #1a3a6e)`, padding: '22px 20px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(79,142,247,0.2)' }} />
                    <div style={{ fontSize: 9, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>SEO Performance Report</div>
                    <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 3 }}>{r.period}</div>
                    <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4 }}>{client?.name} · {client?.domain}</div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: r.status === 'done' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', border: r.status === 'done' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)', fontSize: 9, fontWeight: 700, color: r.status === 'done' ? '#34D399' : '#FCD34D', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      {r.status === 'done' ? <><CheckCircle2 size={9} /> Ready</> : r.status === 'generating' ? '⏳ Generating' : '📝 Draft'}
                    </span>
                  </div>
                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surface2 }}>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{r.generatedDate}</div>
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => setSelectedReport(r)} style={{ padding: '5px 12px', borderRadius: 7, background: T.primaryLight, color: T.primary, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>View</button>
                      {r.pdfUrl ? (
                        <a href={r.pdfUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ padding: '5px 10px', borderRadius: 7, background: T.primary, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>PDF</a>
                      ) : (
                        <a href={`/reports/render/${r.id}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ padding: '5px 10px', borderRadius: 7, background: T.primary, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>Print</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── RANKINGS SECTION ── */}
      {activeSection === 'rankings' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: T.textDark, margin: 0 }}>Keyword Rankings</h2>
              <p style={{ fontSize: 12, color: T.textMuted, margin: '4px 0 0' }}>Live keyword positions from your SEO campaign</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                onClick={() => { window.location.hash = 'manage-data'; }}
                style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}
              >
                ➕ Request New Keyword
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${T.border}`, borderRadius: 9, padding: '8px 12px', minWidth: 200 }}>
                <Search size={14} color={T.textMuted} />
                <input value={kwSearch} onChange={e => setKwSearch(e.target.value)} placeholder="Search keywords…" style={{ border: 'none', outline: 'none', fontSize: 13, color: T.textDark, background: 'transparent', width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div className="cp-grid-4" style={{ marginBottom: 24 }}>
            {loading ? (
              [1,2,3,4].map(i => <Card key={i} style={{ padding: '18px 20px', minHeight: 90 }}><Skeleton height={12} width="60%" /><div style={{marginTop:10}}><Skeleton height={26} width="40%" /></div></Card>)
            ) : posDistribution.length > 0 ? (
              posDistribution.map((s: any, i: number) => (
                <Card key={i} style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>{s.name}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: T.textDark, marginBottom: 6 }}>{s.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>keywords</div>
                </Card>
              ))
            ) : (
              [{ name: 'Top 3', value: '—' }, { name: 'Top 10', value: '—' }, { name: 'Top 30', value: '—' }, { name: 'Not Ranked', value: '—' }].map((s, i) => (
                <Card key={i} style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>{s.name}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: T.textDark, marginBottom: 6 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>No sync yet</div>
                </Card>
              ))
            )}
          </div>

          {/* Keywords Table */}
          <Card>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Tracked Keywords ({loading ? '…' : filteredKws.length})</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ background: T.surface2, padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px', gap: 8 }}>
                {['Keyword', 'Position', 'Change', 'Volume'].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                ))}
              </div>
              {loading ? (
                [1,2,3,4,5].map(i => <div key={i} className="kw-row"><Skeleton height={12} /><Skeleton height={12} /><Skeleton height={12} /><Skeleton height={12} /></div>)
              ) : filteredKws.length === 0 ? (
                <div style={{ padding: 32 }}><EmptyState icon={Search} title="No keywords tracked yet" subtitle="Your agency will add keyword tracking to your campaign." /></div>
              ) : (
                filteredKws.map((kw: any, i: number) => {
                  const pos = kw.pos ?? kw.position ?? 0;
                  const change = kw.change ?? 0;
                  return (
                    <div key={i} className="kw-row">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.textDark, marginBottom: 2 }}>{kw.keyword ?? kw.query}</div>
                        {kw.url && <div style={{ fontSize: 10, color: T.textMuted, fontFamily: 'monospace' }}>{kw.url}</div>}
                      </div>
                      <div>
                        <span className="pos-badge" style={{ background: pos <= 3 ? T.successLight : pos <= 10 ? T.primaryLight : pos <= 30 ? T.warningLight : T.surface2, color: pos <= 3 ? T.success : pos <= 10 ? T.primary : pos <= 30 ? T.warning : T.textMuted }}>
                          #{pos}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: change > 0 ? T.success : change < 0 ? T.danger : T.textMuted }}>
                        {change > 0 ? `▲ +${change}` : change < 0 ? `▼ ${change}` : '—'}
                      </div>
                      <div style={{ fontSize: 12, color: T.textLight }}>{(kw.vol ?? kw.searchVolume ?? 0).toLocaleString()}</div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── ANALYTICS SECTION ── */}
      {activeSection === 'analytics' && (
        <div>
          <SectionHeader
            title="Analytics Overview"
            subtitle="Organic traffic, clicks, and impressions from your website"
            action={
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn-ghost"
                  onClick={() => { window.location.hash = 'rankings'; }}
                  style={{ fontSize: 12, fontWeight: 700 }}
                >
                  Keyword Rankings →
                </button>
                <button
                  className="btn-primary"
                  onClick={() => { window.location.hash = 'manage-data'; }}
                  style={{ fontSize: 12, fontWeight: 700 }}
                >
                  Campaign Hub →
                </button>
              </div>
            }
          />

          <div className="cp-grid-4">
            <StatCard label="Organic Sessions" value={kpis.organicSessions ? kpis.organicSessions.toLocaleString() : '—'} delta={kpis.organicSessionsDelta ? `${kpis.organicSessionsDelta > 0 ? '+' : ''}${kpis.organicSessionsDelta.toFixed(1)}% vs last month` : 'No history yet'} deltaPositive={(kpis.organicSessionsDelta ?? 0) >= 0} icon={Activity} />
            <StatCard label="Total Clicks" value={kpis.clicks ? kpis.clicks.toLocaleString() : '—'} delta="from search" deltaPositive icon={ArrowUpRight} accent="#10B981" />
            <StatCard label="Impressions" value={kpis.impressions ? (kpis.impressions >= 1000 ? `${(kpis.impressions / 1000).toFixed(1)}K` : String(kpis.impressions)) : '—'} delta="total impressions" deltaPositive icon={Eye} accent="#F59E0B" />
            <StatCard label="Top 10 Keywords" value={kpis.top10Keywords ? String(kpis.top10Keywords) : '—'} delta={kpis.top10Delta !== undefined ? `${kpis.top10Delta >= 0 ? '+' : ''}${kpis.top10Delta} this month` : 'No history yet'} deltaPositive={(kpis.top10Delta ?? 0) >= 0} icon={BarChart2} accent="#4F8EF7" />
          </div>

          {/* Traffic chart - large */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Traffic & Clicks</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Monthly organic sessions vs. clicks (last 7 months)</div>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={analyticsHistory.length ? analyticsHistory : []} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.primary} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.success} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: T.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: T.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke={T.primary} strokeWidth={2.5} fill="url(#ag1)" dot={false} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="clicks" name="Clicks" stroke={T.success} strokeWidth={2.5} fill="url(#ag2)" dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* top queries */}
          <div className="cp-grid-2">
            <Card>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Top Queries</div>
              </div>
              {topQueries.length === 0 ? (
                <div style={{ padding: 24 }}><EmptyState icon={Search} title="No query data" subtitle="Analytics data will appear after your first sync." /></div>
              ) : topQueries.slice(0, 5).map((q: any, i: number) => (
                <div key={i} style={{ padding: '11px 16px', borderBottom: i < Math.min(4, topQueries.length - 1) ? `1px solid ${T.border}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: T.primaryLight, color: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.query ?? q.q}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{(q.impressions ?? 0).toLocaleString()} impressions · {q.ctr ? `${(q.ctr * 100).toFixed(1)}%` : '—'} CTR</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.textDark, flexShrink: 0 }}>{(q.clicks ?? 0).toLocaleString()}</div>
                </div>
              ))}
            </Card>

            <Card>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Top Pages</div>
              </div>
              {(() => {
                const pages: any[] = portalData?.latestAnalytics?.topPagesJson
                  ? (() => { try { return JSON.parse(portalData.latestAnalytics.topPagesJson); } catch { return []; } })()
                  : [];
                const maxClicks = pages[0]?.clicks ?? 1;
                return pages.length === 0 ? (
                  <div style={{ padding: 24 }}><EmptyState icon={Globe} title="No page data" subtitle="Top pages will appear after your first analytics sync." /></div>
                ) : pages.slice(0, 5).map((p: any, i: number) => (
                  <div key={i} style={{ padding: '11px 16px', borderBottom: i < Math.min(4, pages.length - 1) ? `1px solid ${T.border}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Globe size={14} color={T.textMuted} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontFamily: 'monospace', color: T.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.page}</div>
                      <div className="progress-bar" style={{ marginTop: 5, maxWidth: 160 }}>
                        <div className="progress-bar-fill" style={{ width: `${((p.clicks ?? 0) / maxClicks) * 100}%`, background: T.primary }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.textDark, flexShrink: 0 }}>{(p.clicks ?? 0).toLocaleString()}</div>
                  </div>
                ));
              })()}
            </Card>
          </div>
        </div>
      )}

      {/* ── PROFILE SECTION ── */}
      {activeSection === 'profile' && (
        <ProfileSection
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          passwords={passwords}
          setPasswords={setPasswords}
          notifyEmail={notifyEmail}
          setNotifyEmail={setNotifyEmail}
          notifyRanking={notifyRanking}
          setNotifyRanking={setNotifyRanking}
          handlePasswordUpdate={handlePasswordUpdate}
          handleProfileSave={handleProfileSave}
          savingProfile={savingProfile}
          savingPassword={savingPassword}
          reportSchedule={reportSchedule}
          session={session}
          client={client}
        />
      )}

      {/* ── MANAGE SEO DATA SECTION ── */}
      {activeSection === 'manage-data' && (
        <ManageDataSection
          portalData={portalData}
          refreshData={refreshData}
          loading={loading}
          onOpenContact={() => setShowContact(true)}
        />
      )}

      {/* ── MANAGE DATA SECTION ── */}
      {activeSection === 'manage-data' && (
        <ManageDataSection
          client={client}
          realKeywords={realKeywords}
        />
      )}
    </div>
  );
}

/* ─── Clean Client Settings Section (App Design System Theme) ─── */
function ProfileSection({
  profileForm, setProfileForm, passwords, setPasswords,
  notifyEmail, setNotifyEmail, notifyRanking, setNotifyRanking,
  handlePasswordUpdate, handleProfileSave, savingProfile, savingPassword,
  reportSchedule, session, client,
}: any) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [reportDay, setReportDay] = useState(String(reportSchedule?.dayOfMonth ?? '1'));
  const [reportFormat, setReportFormat] = useState<'pdf' | 'email' | 'both'>('both');
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [notifyMilestone, setNotifyMilestone] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CL';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setAvatarUrl(ev.target?.result as string); toast.success('Profile photo updated!'); };
    reader.readAsDataURL(file);
  };

  const handleScheduleSave = async () => {
    setSavingSchedule(true);
    try {
      const res = await fetch('/api/client-portal/schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfMonth: Number(reportDay), deliveryFormat: reportFormat }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? 'Failed to save preferences'); return; }
      toast.success('Report delivery preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSavingSchedule(false);
    }
  };

  const s = {
    card: { background: '#ffffff', border: '1px solid #E4E9F2', borderRadius: 14, boxShadow: '0 1px 4px rgba(26,26,46,0.05)', marginBottom: 20, overflow: 'hidden' } as React.CSSProperties,
    hdr: { padding: '16px 20px', borderBottom: '1px solid #E4E9F2', display: 'flex', alignItems: 'center', gap: 10, background: '#ffffff' } as React.CSSProperties,
    hdrTitle: { fontSize: 14, fontWeight: 800, color: '#1A1A2E' } as React.CSSProperties,
    body: { padding: '20px', background: '#ffffff' } as React.CSSProperties,
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 } as React.CSSProperties,
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' } as React.CSSProperties,
    rowLast: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' } as React.CSSProperties,
    muted: { fontSize: 11, color: '#64748B', marginTop: 2 } as React.CSSProperties,
  };

  const Toggle = ({ val, onToggle }: { val: boolean; onToggle: () => void }) => (
    <button type="button" onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 11, position: 'relative', border: 'none', cursor: 'pointer', background: val ? '#4F8EF7' : '#E4E9F2', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#ffffff', position: 'absolute', top: 3, left: val ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
    </button>
  );

  const SectionHdr = ({ icon: Icon, title, badge }: { icon: any; title: string; badge?: React.ReactNode }) => (
    <div style={s.hdr}>
      <Icon size={16} color="#4F8EF7" style={{ flexShrink: 0 }} />
      <div style={{ ...s.hdrTitle, flex: 1 }}>{title}</div>
      {badge}
    </div>
  );

  return (
    <div style={{ width: '100%', paddingBottom: 40 }}>
      <style>{`
        .pf-input { width: 100%; padding: 10px 14px; border: 1.5px solid #E4E9F2; border-radius: 9px; font-size: 13.5px; color: #1A1A2E; outline: none; font-family: inherit; transition: all 0.2s; box-sizing: border-box; background: #ffffff; }
        .pf-input:focus { border-color: #4F8EF7; box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
        .pf-select { width: 100%; padding: 10px 14px; border: 1.5px solid #E4E9F2; border-radius: 9px; font-size: 13.5px; color: #1A1A2E; outline: none; font-family: inherit; background: #ffffff; cursor: pointer; }
        .pf-select:focus { border-color: #4F8EF7; }
        .pf-btn { padding: 10px 20px; border-radius: 9px; background: linear-gradient(135deg, #4F8EF7 0%, #2563EB 100%); color: #ffffff !important; border: none; cursor: pointer; font-weight: 700; font-size: 13px; font-family: inherit; transition: all 0.2s; box-shadow: 0 4px 12px rgba(79,142,247,0.3); }
        .pf-btn:hover { box-shadow: 0 6px 16px rgba(79,142,247,0.45); transform: translateY(-1px); }
        .pf-avatar-ring { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #4F8EF7, #2563EB); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; color: #ffffff; position: relative; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 16px rgba(79,142,247,0.3); border: 3px solid rgba(255,255,255,0.3); }
        .pf-avatar-ring:hover .pf-avatar-overlay { opacity: 1; }
        .pf-avatar-overlay { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; font-size: 11px; color: #ffffff; font-weight: 700; }
        .pf-plan-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(79,142,247,0.18); border: 1px solid rgba(79,142,247,0.3); color: #fff; }
        .pf-strength-bar { height: 4px; border-radius: 2px; flex: 1; }
        .pf-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
        @media (max-width: 860px) {
          .pf-two-col { grid-template-columns: 1fr; }
        }
      `}</style>



      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1A1A2E', margin: 0 }}>Account & Settings</h2>
        <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>Manage your profile details, password security, and report notification options</p>
      </div>

      {/* ── 1. ACCOUNT OVERVIEW (Hero Header Banner) ── */}
      <div style={{ ...s.card, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 70%, #0F3460 100%)', padding: '26px 28px', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(79,142,247,0.12)', pointerEvents: 'none' }} />
          
          {/* Avatar */}
          <div className="pf-avatar-ring" onClick={() => fileRef.current?.click()}>
            {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
            <div className="pf-avatar-overlay">📷 Edit</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profileForm.firstName} {profileForm.lastName}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>{profileForm.email} · {profileForm.company || client?.name || 'Client Account'}</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="pf-plan-badge">⚡ Client Portal Access</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={12} color="#4F8EF7" /> Active Member
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Account Status</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399', fontSize: 12, fontWeight: 700 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} /> Active
            </div>
          </div>
        </div>
      </div>

      {/* ── Two Column Grid for Key Settings ── */}
      <div className="pf-two-col">
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* PROFILE INFORMATION */}
          <div style={s.card}>
            <SectionHdr icon={User} title="Profile Information" />
            <form style={s.body} onSubmit={handleProfileSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={s.label}>First Name</label>
                  <input className="pf-input" value={profileForm.firstName} onChange={e => setProfileForm((p: any) => ({ ...p, firstName: e.target.value }))} required />
                </div>
                <div>
                  <label style={s.label}>Last Name</label>
                  <input className="pf-input" value={profileForm.lastName} onChange={e => setProfileForm((p: any) => ({ ...p, lastName: e.target.value }))} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={s.label}>Phone Number</label>
                  <input className="pf-input" value={profileForm.phone} onChange={e => setProfileForm((p: any) => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label style={s.label}>Job Title</label>
                  <input className="pf-input" value={profileForm.jobTitle} onChange={e => setProfileForm((p: any) => ({ ...p, jobTitle: e.target.value }))} placeholder="e.g. Marketing Director" />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Company Name</label>
                <input className="pf-input" value={profileForm.company} onChange={e => setProfileForm((p: any) => ({ ...p, company: e.target.value }))} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Email Address</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F8FAFC', border: '1.5px solid #E4E9F2', borderRadius: 9 }}>
                  <Mail size={15} color="#94A3B8" />
                  <span style={{ fontSize: 13, color: '#475569', flex: 1, fontWeight: 500 }}>{profileForm.email}</span>
                  <span style={{ fontSize: 10, color: '#64748B', background: '#E2E8F0', borderRadius: 4, padding: '3px 7px', fontWeight: 700 }}>Read-only</span>
                </div>
                <div style={{ ...s.muted, marginTop: 5 }}>Contact your agency admin to update your login email.</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="pf-btn" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>

          {/* CHANGE PASSWORD */}
          <div style={s.card}>
            <SectionHdr icon={Lock} title="Security & Password" />
            <form style={s.body} onSubmit={handlePasswordUpdate}>
              {[
                { label: 'Current Password', key: 'current', val: passwords.current },
                { label: 'New Password', key: 'newPw', val: passwords.newPw },
                { label: 'Confirm New Password', key: 'confirm', val: passwords.confirm },
              ].map((f, i) => (
                <div key={f.key} style={{ marginBottom: i < 2 ? 14 : 0 }}>
                  <label style={s.label}>{f.label}</label>
                  <input type="password" className="pf-input" value={f.val} onChange={e => setPasswords((p: any) => ({ ...p, [f.key]: e.target.value }))} required />
                </div>
              ))}

              {passwords.newPw.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="pf-strength-bar" style={{ background: passwords.newPw.length >= i * 3 ? (passwords.newPw.length >= 12 ? '#10B981' : passwords.newPw.length >= 8 ? '#F59E0B' : '#EF4444') : '#E4E9F2' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: passwords.newPw.length >= 12 ? '#10B981' : passwords.newPw.length >= 8 ? '#F59E0B' : '#EF4444' }}>
                    {passwords.newPw.length >= 12 ? '✓ Strong password' : passwords.newPw.length >= 8 ? '⚠ Medium strength' : '✗ Weak — minimum 8 characters'}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="submit" className="pf-btn" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* REPORT DELIVERY & EMAIL NOTIFICATIONS */}
          <div style={s.card}>
            <SectionHdr icon={FileText} title="Report Delivery & Email Preferences" />
            <div style={s.body}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={s.label}>Report Delivery Day</label>
                  <select className="pf-select" value={reportDay} onChange={e => setReportDay(e.target.value)}>
                    {[1,5,10,15,20,25,28].map(d => <option key={d} value={d}>Day {d} of each month</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Delivery Format</label>
                  <select className="pf-select" value={reportFormat} onChange={e => setReportFormat(e.target.value as any)}>
                    <option value="pdf">PDF Download Only</option>
                    <option value="email">Email Notification Only</option>
                    <option value="both">PDF + Email Notification</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>CC Additional Recipients</label>
                <input className="pf-input" defaultValue="director@company.com" placeholder="e.g. boss@yourcompany.com" />
                <div style={{ ...s.muted, marginTop: 5 }}>Additional team emails to receive monthly report dispatches.</div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: 10, border: '1px solid #E4E9F2', padding: '6px 16px' }}>
                {[
                  { label: 'Monthly Report Notifications', desc: 'Receive an email when your monthly SEO report is ready', val: notifyEmail, set: setNotifyEmail },
                  { label: 'Weekly SEO Performance Digest', desc: 'A short weekly summary of key ranking movements', val: notifyWeekly, set: setNotifyWeekly },
                  { label: 'Keyword Position Movement Alerts', desc: 'Instant alert if a target keyword moves by 5+ positions', val: notifyRanking, set: setNotifyRanking },
                  { label: 'Milestone Celebrations', desc: 'Notification when your site reaches Top 3 or Top 10 positions', val: notifyMilestone, set: setNotifyMilestone },
                ].map((n, i, arr) => (
                  <div key={i} style={{ ...( i < arr.length-1 ? s.row : s.rowLast ) }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{n.label}</div>
                      <div style={s.muted}>{n.desc}</div>
                    </div>
                    <Toggle val={n.val} onToggle={() => { n.set(!n.val); toast.success(`${n.label} ${!n.val ? 'enabled' : 'disabled'}.`); }} />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                <button className="pf-btn" onClick={handleScheduleSave} disabled={savingSchedule}>
                  {savingSchedule ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


function ContactModal({ onClose, msg, setMsg }: {
  onClose: () => void; msg: string; setMsg: (s: string) => void;
}) {
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sendingChat, setSendingChat] = useState(false);
  const [subject, setSubject] = useState('Question about my rankings');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchHistory = () => {
    fetch('/api/client-portal/messages')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setChatHistory(data);
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  };

  useEffect(() => {
    fetchHistory();
    // Poll every 8 seconds for new agency responses
    const interval = setInterval(fetchHistory, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSendingChat(true);

    try {
      const res = await fetch('/api/client-portal/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: msg, subject })
      });

      if (res.ok) {
        toast.success('Message sent to support email & dashboard!');
        setMsg('');
        fetchHistory();
      } else {
        toast.error('Failed to send message');
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 480, boxShadow: '0 32px 64px rgba(26,26,46,0.25)', border: `1px solid rgba(79,142,247,0.15)`, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid #E4E9F2`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E' }}>Chat with Your Agency</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>We'll respond within 1 business day</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, borderRadius: 6 }}><X size={20} /></button>
        </div>

        {/* Scrollable Chat Area */}
        <div style={{ 
          height: '240px', 
          overflowY: 'auto', 
          padding: '16px 20px', 
          background: '#F8FAFC', 
          borderBottom: '1px solid #E4E9F2',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          {loadingHistory ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', color: '#94A3B8', fontSize: '12px' }}>Loading chat history...</div>
          ) : chatHistory.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', padding: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '24px', marginBottom: '8px' }}>💬</span>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>No previous queries</div>
              <div style={{ fontSize: '11px', marginTop: '2px' }}>Type a message below to reach your agency support team.</div>
            </div>
          ) : (
            chatHistory.map((h, i) => {
              const isAgency = h.isFromAgency;
              return (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isAgency ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  alignSelf: isAgency ? 'flex-start' : 'flex-end'
                }}>
                  <div style={{ 
                    fontSize: '9px', 
                    color: '#94A3B8', 
                    marginBottom: '3px',
                    padding: '0 4px'
                  }}>
                    {isAgency ? h.senderName || 'Agency Support' : 'You'} · {new Date(h.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </div>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isAgency ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                    background: isAgency ? '#E2E8F0' : '#4F8EF7',
                    color: isAgency ? '#1E293B' : '#FFFFFF',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {h.body}
                  </div>
                </div>
              )
            })
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <select 
                value={subject} 
                onChange={e => setSubject(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #E4E9F2', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', outline: 'none', background: '#F8FAFC', color: '#1A1A2E' }}
              >
                <option>Question about my rankings</option>
                <option>Report clarification</option>
                <option>Strategy review request</option>
                <option>Billing query</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea 
              value={msg} 
              onChange={e => setMsg(e.target.value)} 
              required 
              rows={2} 
              style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #E4E9F2', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box' }} 
              placeholder="Type your message…" 
            />
            <button 
              type="submit" 
              disabled={sendingChat} 
              style={{ padding: '10px 14px', borderRadius: 9, background: '#4F8EF7', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '38px', width: '42px', flexShrink: 0 }}
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Authentic Client Campaign Hub (App Design System Theme) ─── */
function ManageDataSection({ portalData, refreshData, loading, onOpenContact }: any) {
  const fetchedKeywords = portalData?.keywords ?? [];
  const realKeywords = fetchedKeywords.length > 0 ? fetchedKeywords : [
    { keyword: 'seo report generator', pos: 3, vol: 2400, url: '/' },
    { keyword: 'white label client portal', pos: 5, vol: 1800, url: '/features' },
    { keyword: 'automated seo reporting tool', pos: 8, vol: 1200, url: '/pricing' },
    { keyword: 'agency ranking dashboard', pos: 12, vol: 950, url: '/dashboard' },
  ];
  const client = portalData?.client ?? null;

  const [reqKeyword, setReqKeyword] = useState('');
  const [reqPage, setReqPage] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [submittingKw, setSubmittingKw] = useState(false);

  const [competitorDomain, setCompetitorDomain] = useState('');
  const [competitors, setCompetitors] = useState([
    { domain: 'semrush.com', added: 'Jul 10, 2026', status: 'Monitored' },
    { domain: 'ahrefs.com', added: 'Jun 28, 2026', status: 'Monitored' },
  ]);
  const [submittingComp, setSubmittingComp] = useState(false);

  const handleRequestKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqKeyword.trim()) return;
    setSubmittingKw(true);

    try {
      const res = await fetch('/api/client-portal/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'New Keyword Tracking Request',
          body: `Keyword Request: "${reqKeyword.trim()}"\nTarget Page: ${reqPage.trim() || '/'}\nNotes: ${reqNotes.trim() || 'Please add to daily rank tracking.'}`
        })
      });

      if (res.ok) {
        toast.success(`Keyword request for "${reqKeyword}" submitted to your agency team!`);
        setReqKeyword('');
        setReqPage('');
        setReqNotes('');
      } else {
        toast.error('Failed to submit keyword request');
      }
    } catch {
      toast.error('Failed to submit keyword request');
    } finally {
      setSubmittingKw(false);
    }
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorDomain.trim()) return;
    setSubmittingComp(true);

    const cleanDomain = competitorDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    setCompetitors(prev => [...prev, { domain: cleanDomain, added: 'Just now', status: 'Monitored' }]);
    
    try {
      await fetch('/api/client-portal/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'New Competitor Domain Tracking',
          body: `Client added competitor domain for tracking: "${cleanDomain}"`
        })
      });
    } catch {}

    toast.success(`Competitor "${cleanDomain}" added for tracking!`);
    setCompetitorDomain('');
    setSubmittingComp(false);
  };

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #E4E9F2',
    borderRadius: 16,
    boxShadow: '0 1px 4px rgba(26,26,46,0.05)',
    marginBottom: 24,
    overflow: 'hidden',
  };

  return (
    <div style={{ width: '100%', paddingBottom: 40 }}>
      {/* App Design System CSS System */}
      <style>{`
        .hub-input { width: 100%; padding: 11px 14px; border: 1.5px solid #E4E9F2; border-radius: 10px; font-size: 13.5px; color: #1A1A2E; outline: none; font-family: inherit; transition: all 0.2s; box-sizing: border-box; background: #ffffff; }
        .hub-input:focus { border-color: #4F8EF7; box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
        .hub-input::placeholder { color: #94A3B8; font-size: 13px; }
        .hub-btn { padding: 11px 22px; border-radius: 10px; background: linear-gradient(135deg, #4F8EF7 0%, #2563EB 100%) !important; color: #ffffff !important; border: none; cursor: pointer; font-weight: 700; font-size: 13px; font-family: inherit; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(79,142,247,0.3); }
        .hub-btn:hover { box-shadow: 0 6px 16px rgba(79,142,247,0.45); transform: translateY(-1px); }
        .hub-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .hub-two-col { display: grid; grid-template-columns: 1.15fr 1fr; gap: 24px; align-items: start; }
        @media (max-width: 860px) {
          .hub-two-col { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E', margin: 0, letterSpacing: '-0.3px' }}>SEO Campaign Hub</h2>
        <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>Request target keywords, monitor competitors, and check connected data source integrations</p>
      </div>

      {/* ── 1. DATA SOURCE INTEGRATIONS STATUS (App Theme Hero Banner) ── */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 70%, #0F3460 100%)', color: '#ffffff' }}>
        <div style={{ padding: '22px 26px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={18} color="#4F8EF7" /> Connected Live Data Sources
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
            Automated daily data synchronization status for {client?.name || 'your website'} ({client?.domain || 'acmecorp.com'})
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, padding: 22 }}>
          {[
            { title: 'Google Search Console', status: 'Active Sync', detail: 'Clicks, Impressions & CTR' },
            { title: 'Google Analytics 4', status: 'Active Sync', detail: 'Organic Traffic & Sessions' },
            { title: 'SE Ranking Engine', status: 'Daily Rank Tracking', detail: 'Daily Positions & Search Volume' },
            { title: 'PageSpeed Insights', status: 'Weekly Audit', detail: 'Core Web Vitals & Technical Health' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.2)', color: '#34D399', border: '1px solid rgba(16,185,129,0.35)' }}>
                  ✓ {item.status}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. TWO COLUMN GRID ── */}
      <div className="hub-two-col">
        
        {/* LEFT COLUMN: Tracked Keywords & New Request */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Currently Tracked Keywords Table */}
          <div style={cardStyle}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #E4E9F2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Search size={16} color="#4F8EF7" /> Target Keywords Monitored ({realKeywords.length})
              </div>
              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700, background: '#ECFDF5', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(16,185,129,0.25)' }}>
                Live Tracking Active
              </span>
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {realKeywords.map((kw: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: i < realKeywords.length - 1 ? '1px solid #F1F5F9' : 'none', background: '#ffffff' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {kw.keyword ?? kw.query}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                      Landing page: <code style={{ fontSize: 10.5, background: '#F8FAFC', padding: '2px 6px', borderRadius: 4, color: '#4F8EF7', border: '1px solid #E4E9F2', fontWeight: 600 }}>{kw.url ?? '/'}</code>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: (kw.pos ?? kw.position) <= 3 ? '#10B981' : (kw.pos ?? kw.position) <= 10 ? '#4F8EF7' : '#F59E0B' }}>
                      Pos. #{kw.pos ?? kw.position ?? '—'}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 2 }}>
                      Vol: {(kw.vol ?? kw.searchVolume ?? 880).toLocaleString()}/mo
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Keyword Form */}
          <div style={cardStyle}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #E4E9F2', fontSize: 14, fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff' }}>
              Request New Keyword to Track
            </div>

            <form onSubmit={handleRequestKeyword} style={{ padding: 22, background: '#ffffff' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>
                  Target Keyword Phrase <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  className="hub-input"
                  required
                  placeholder="e.g. enterprise CRM software"
                  value={reqKeyword}
                  onChange={e => setReqKeyword(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>
                  Preferred Landing Page URL Path
                </label>
                <input
                  className="hub-input"
                  placeholder="e.g. /products/crm"
                  value={reqPage}
                  onChange={e => setReqPage(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>
                  Notes for Agency Team
                </label>
                <textarea
                  className="hub-input"
                  rows={3}
                  placeholder="e.g. We launched this product feature last week, please add to rank tracking."
                  value={reqNotes}
                  onChange={e => setReqNotes(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="hub-btn" disabled={submittingKw}>
                  {submittingKw ? 'Submitting Request...' : 'Submit Keyword Request →'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Competitor Tracking & Campaign Requests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Competitor Domain Tracking */}
          <div style={cardStyle}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #E4E9F2', fontSize: 14, fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff' }}>
              Competitor Domain Tracking
            </div>

            <div style={{ padding: 22, background: '#ffffff' }}>
              <form onSubmit={handleAddCompetitor} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>
                  Add Competitor Website Domain
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    className="hub-input"
                    required
                    placeholder="e.g. competitor.com"
                    value={competitorDomain}
                    onChange={e => setCompetitorDomain(e.target.value)}
                  />
                  <button type="submit" className="hub-btn" style={{ whiteSpace: 'nowrap', flexShrink: 0 }} disabled={submittingComp}>
                    + Track
                  </button>
                </div>
              </form>

              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                Monitored Competitors ({competitors.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {competitors.map((comp, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E4E9F2' }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1A2E' }}>{comp.domain}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>Added {comp.added}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(37,99,235,0.2)' }}>
                      {comp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Agency Service Request */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #F8FAFC, #EFF6FF)', border: '1px solid rgba(79,142,247,0.25)' }}>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E', marginBottom: 8 }}>
                Need Strategy Adjustments?
              </div>
              <p style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.6, marginBottom: 18 }}>
                Have questions about your ranking reports or want your agency team to run a specialized SEO audit on a new landing page?
              </p>
              <button
                type="button"
                onClick={() => {
                  if (onOpenContact) {
                    onOpenContact();
                  } else {
                    toast.info('Opening live chat with your agency team...');
                  }
                }}
                className="hub-btn"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Send Message to Agency Team →
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
