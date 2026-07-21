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

/* ─── Stat Card ─── */
function StatCard({ label, value, delta, deltaPositive, icon: Icon, accent }: {
  label: string; value: string; delta: string;
  deltaPositive: boolean; icon: any; accent?: string;
}) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px 20px 18px', boxShadow: '0 1px 4px rgba(26,26,46,0.05)', position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(79,142,247,0.13)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(26,26,46,0.05)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 14px 0 80px', background: accent ? `${accent}14` : `${T.primary}10`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</div>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: accent ? `${accent}15` : T.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} color={accent ?? T.primary} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: T.textDark, lineHeight: 1, marginBottom: 8 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: deltaPositive ? T.success : T.danger }}>
        {deltaPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {delta}
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
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
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

          {/* KPI Cards */}
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
                />
                <StatCard
                  label="Top 10 Keywords"
                  value={kpis.top10Keywords ? String(kpis.top10Keywords) : '—'}
                  delta={kpis.top10Delta !== undefined ? `${kpis.top10Delta >= 0 ? '+' : ''}${kpis.top10Delta} this month` : 'No history yet'}
                  deltaPositive={(kpis.top10Delta ?? 0) >= 0}
                  icon={Target}
                  accent="#10B981"
                />
                <StatCard
                  label="Total Keywords"
                  value={kpis.totalKeywords ? String(kpis.totalKeywords) : '—'}
                  delta={kpis.totalKeywords ? 'tracked keywords' : 'No sync yet'}
                  deltaPositive
                  icon={Shield}
                  accent="#F59E0B"
                />
                <StatCard
                  label="Site Health"
                  value={latestAudit ? `${latestAudit.healthScore}%` : '—'}
                  delta={latestAudit ? `${latestAudit.criticalIssues} critical issues` : 'No audit yet'}
                  deltaPositive={latestAudit ? latestAudit.criticalIssues === 0 : true}
                  icon={Zap}
                  accent="#4F8EF7"
                />
              </>
            )}
          </div>

          {/* Charts row */}
          <div className="cp-grid-2">
            {/* Traffic Trend */}
            <Card>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Organic Traffic Trend</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Monthly organic sessions over 7 months</div>
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
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Keyword Growth</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Top 3 & Top 10 keyword counts per month</div>
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
                ) : (latestReport?.aiRecs ?? []).length > 0 ? (
                  (latestReport.aiRecs as any[]).map((r: any, i: number) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, borderLeft: `4px solid ${priorityColor[r.priority] ?? T.primary}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.textDark, marginBottom: 2 }}>{r.label}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: priorityColor[r.priority] ?? T.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{r.priority}</span>
                        {r.impact && <span style={{ fontSize: 9, color: T.textMuted }}>· Impact: {r.impact}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={Star} title="No recommendations yet" subtitle="AI recommendations appear after your first report." />
                )}
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
                            <a href={`/reports/render/${r.id}`} target="_blank" rel="noreferrer" style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', border: `1px solid ${T.border}`, fontSize: 11, fontWeight: 600, color: T.textLight, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}><Download size={11} /> View</a>
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
          <SectionHeader title="My Reports" subtitle="SEO performance reports delivered by your agency" />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${T.border}`, borderRadius: 9, padding: '8px 12px', minWidth: 220 }}>
              <Search size={14} color={T.textMuted} />
              <input value={kwSearch} onChange={e => setKwSearch(e.target.value)} placeholder="Search keywords…" style={{ border: 'none', outline: 'none', fontSize: 13, color: T.textDark, background: 'transparent', width: '100%' }} />
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
          <SectionHeader title="Analytics Overview" subtitle="Organic traffic, clicks, and impressions from your website" />

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
        />
      )}
    </div>
  );
}

/* ─── Advanced Profile Section ─── */
function ProfileSection({
  profileForm, setProfileForm, passwords, setPasswords,
  notifyEmail, setNotifyEmail, notifyRanking, setNotifyRanking,
  handlePasswordUpdate, handleProfileSave, savingProfile, savingPassword,
  reportSchedule, session, client,
}: any) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [reportDay, setReportDay] = useState(String(reportSchedule?.dayOfMonth ?? '1'));
  const [reportFormat, setReportFormat] = useState<'pdf' | 'email' | 'both'>('both');
  const [timezone, setTimezone] = useState('Europe/London');
  const [language, setLanguage] = useState('en-GB');
  const [apiTokenVisible, setApiTokenVisible] = useState(false);
  const [apiToken] = useState('ck_live_x9aK3mQpL7vNdRt8WzJ2bYsCfUeHgOi1');
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [notifyMilestone, setNotifyMilestone] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CL';

  const memberSince = 'January 2026';
  const plan = 'Pro SEO';

  const loginHistory = [
    { device: 'Chrome on Windows', ip: '82.45.212.11', location: 'London, UK', time: 'Today at 3:27 PM', current: true },
    { device: 'Safari on iPhone 15', ip: '82.45.212.11', location: 'London, UK', time: 'Yesterday at 9:14 AM', current: false },
    { device: 'Chrome on MacBook', ip: '194.3.16.78', location: 'Manchester, UK', time: 'Jul 17 at 11:51 AM', current: false },
    { device: 'Firefox on Windows', ip: '82.45.212.11', location: 'London, UK', time: 'Jul 15 at 4:03 PM', current: false },
  ];

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
      toast.success('Report preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSavingSchedule(false);
    }
  };

  const s = {
    card: { background: '#fff', border: '1px solid #E4E9F2', borderRadius: 14, boxShadow: '0 1px 4px rgba(26,26,46,0.05)', marginBottom: 18, overflow: 'hidden' } as React.CSSProperties,
    hdr: { padding: '18px 20px', borderBottom: '1px solid #E4E9F2', display: 'flex', alignItems: 'center', gap: 10 } as React.CSSProperties,
    hdrTitle: { fontSize: 14, fontWeight: 800, color: '#1A1A2E' } as React.CSSProperties,
    body: { padding: '18px 20px' } as React.CSSProperties,
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 } as React.CSSProperties,
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #F1F5F9' } as React.CSSProperties,
    rowLast: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0' } as React.CSSProperties,
    muted: { fontSize: 11, color: '#94A3B8', marginTop: 2 } as React.CSSProperties,
  };

  const Toggle = ({ val, onToggle }: { val: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 11, position: 'relative', border: 'none', cursor: 'pointer', background: val ? '#4F8EF7' : '#E4E9F2', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: val ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
    </button>
  );

  const SectionHdr = ({ icon: Icon, title, badge }: { icon: any; title: string; badge?: React.ReactNode }) => (
    <div style={s.hdr}>
      <Icon size={15} color="#4F8EF7" style={{ flexShrink: 0 }} />
      <div style={{ ...s.hdrTitle, flex: 1 }}>{title}</div>
      {badge}
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .pf-input { width: 100%; padding: 9px 12px; border: 1.5px solid #E4E9F2; border-radius: 9px; font-size: 13px; color: #1A1A2E; outline: none; font-family: inherit; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; background: #fff; }
        .pf-input:focus { border-color: #4F8EF7; box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
        .pf-select { width: 100%; padding: 9px 12px; border: 1.5px solid #E4E9F2; border-radius: 9px; font-size: 13px; color: #1A1A2E; outline: none; font-family: inherit; background: #fff; cursor: pointer; }
        .pf-select:focus { border-color: #4F8EF7; }
        .pf-btn { padding: 9px 18px; border-radius: 9px; background: #4F8EF7; color: #fff; border: none; cursor: pointer; font-weight: 700; font-size: 13px; font-family: inherit; }
        .pf-btn:hover { background: #3B7BF6; }
        .pf-btn-ghost { padding: 9px 16px; border-radius: 9px; background: #fff; color: #475569; border: 1px solid #E4E9F2; cursor: pointer; font-weight: 600; font-size: 13px; font-family: inherit; }
        .pf-btn-ghost:hover { border-color: #4F8EF7; color: #4F8EF7; }
        .pf-btn-danger { padding: 9px 18px; border-radius: 9px; background: transparent; border: 1.5px solid #EF4444; color: #EF4444; cursor: pointer; font-weight: 700; font-size: 13px; font-family: inherit; }
        .pf-btn-danger:hover { background: #FEF2F2; }
        .pf-token { font-family: 'Courier New', monospace; font-size: 12px; background: #F8FAFC; border: 1px solid #E4E9F2; border-radius: 8px; padding: 10px 12px; flex: 1; color: #1A1A2E; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pf-avatar-ring { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #4F8EF7, #2563EB); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 900; color: white; position: relative; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 16px rgba(79,142,247,0.3); }
        .pf-avatar-ring:hover .pf-avatar-overlay { opacity: 1; }
        .pf-avatar-overlay { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; font-size: 11px; color: white; font-weight: 700; }
        .pf-plan-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: linear-gradient(135deg, rgba(79,142,247,0.15), rgba(37,99,235,0.08)); border: 1px solid rgba(79,142,247,0.25); color: #4F8EF7; }
        .pf-activity-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F1F5F9; }
        .pf-activity-row:last-child { border-bottom: none; }
        .pf-device-icon { width: 36px; height: 36px; border-radius: 9px; background: #EBF2FF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pf-qr-box { display: flex; flex-direction: column; align-items: center; padding: 20px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E4E9F2; }
        .pf-qr-grid { display: grid; grid-template-columns: repeat(9, 8px); grid-template-rows: repeat(9, 8px); gap: 2px; }
        .pf-strength-bar { height: 4px; border-radius: 2px; flex: 1; }
        .pf-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
        @media (max-width: 1024px) {
          .pf-two-col { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1A1A2E', margin: 0 }}>Account Center</h2>
        <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>Manage your profile, security, preferences and account data</p>
      </div>

      {/* ── 1. ACCOUNT OVERVIEW (Spans Full Width at Top) ── */}
      <div style={s.card}>
        <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 70%, #0F3460 100%)', padding: '24px 22px', display: 'flex', alignItems: 'center', gap: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(79,142,247,0.12)', pointerEvents: 'none' }} />
          {/* Avatar */}
          <div className="pf-avatar-ring" onClick={() => fileRef.current?.click()}>
            {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
            <div className="pf-avatar-overlay">📷 Edit</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 3 }}>{profileForm.firstName} {profileForm.lastName}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>{profileForm.email} · {profileForm.company}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="pf-plan-badge">⚡ {plan}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={11} /> Member since {memberSince}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Account Status</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399', fontSize: 11, fontWeight: 700 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} /> Active
            </div>
          </div>
        </div>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #E4E9F2' }}>
          {[
            { label: 'Reports Received', value: '4' },
            { label: 'Keywords Tracked', value: '325' },
            { label: 'Avg. Health Score', value: '66%' },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '14px 16px', textAlign: 'center', borderRight: i < 2 ? '1px solid #E4E9F2' : 'none' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#1A1A2E' }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two Column Grid below Account Overview ── */}
      <div className="pf-two-col">
        
        {/* LEFT COLUMN */}
        <div>
          {/* ── 2. PROFILE INFORMATION ── */}
          <div style={s.card}>
            <SectionHdr icon={User} title="Profile Information" />
            <form style={s.body} onSubmit={handleProfileSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={s.label}>First Name</label>
                  <input className="pf-input" value={profileForm.firstName} onChange={e => setProfileForm((p: any) => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div>
                  <label style={s.label}>Last Name</label>
                  <input className="pf-input" value={profileForm.lastName} onChange={e => setProfileForm((p: any) => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={s.label}>Phone Number</label>
                  <input className="pf-input" value={profileForm.phone} onChange={e => setProfileForm((p: any) => ({ ...p, phone: e.target.value }))} placeholder="+44 7700 900000" />
                </div>
                <div>
                  <label style={s.label}>Job Title</label>
                  <input className="pf-input" value={profileForm.jobTitle} onChange={e => setProfileForm((p: any) => ({ ...p, jobTitle: e.target.value }))} placeholder="e.g. Marketing Manager" />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={s.label}>Company Name</label>
                <input className="pf-input" value={profileForm.company} onChange={e => setProfileForm((p: any) => ({ ...p, company: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>Email Address</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#F8FAFC', border: '1.5px solid #E4E9F2', borderRadius: 9 }}>
                  <Mail size={13} color="#94A3B8" />
                  <span style={{ fontSize: 13, color: '#94A3B8', flex: 1 }}>{profileForm.email}</span>
                  <span style={{ fontSize: 10, color: '#94A3B8', background: '#F1F5F9', borderRadius: 5, padding: '2px 6px' }}>Read-only</span>
                </div>
                <div style={s.muted}>Contact your account manager to change your email address.</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="pf-btn" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* ── 3. CHANGE PASSWORD ── */}
          <div style={s.card}>
            <SectionHdr icon={Lock} title="Change Password" />
            <form style={s.body} onSubmit={handlePasswordUpdate}>
              {[
                { label: 'Current Password', key: 'current', val: passwords.current },
                { label: 'New Password', key: 'newPw', val: passwords.newPw },
                { label: 'Confirm New Password', key: 'confirm', val: passwords.confirm },
              ].map((f, i) => (
                <div key={f.key} style={{ marginBottom: i < 2 ? 12 : 0 }}>
                  <label style={s.label}>{f.label}</label>
                  <input type="password" className="pf-input" value={f.val} onChange={e => setPasswords((p: any) => ({ ...p, [f.key]: e.target.value }))} required />
                </div>
              ))}
              {/* Password strength indicator */}
              {passwords.newPw.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="pf-strength-bar" style={{ background: passwords.newPw.length >= i * 3 ? (passwords.newPw.length >= 12 ? '#10B981' : passwords.newPw.length >= 8 ? '#F59E0B' : '#EF4444') : '#E4E9F2' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: passwords.newPw.length >= 12 ? '#10B981' : passwords.newPw.length >= 8 ? '#F59E0B' : '#EF4444' }}>
                    {passwords.newPw.length >= 12 ? '✓ Strong password' : passwords.newPw.length >= 8 ? '⚠ Medium — add numbers & symbols' : '✗ Weak — minimum 8 characters'}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="submit" className="pf-btn" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* ── 7. LANGUAGE & TIMEZONE ── */}
          <div style={s.card}>
            <SectionHdr icon={Globe} title="Language & Region" />
            <div style={s.body}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={s.label}>Language</label>
                  <select className="pf-select" value={language} onChange={e => setLanguage(e.target.value)}>
                    <option value="en-GB">English (UK)</option>
                    <option value="en-US">English (US)</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                    <option value="it">Italiano</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>Timezone</label>
                  <select className="pf-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
                    <option value="Europe/London">Europe/London (GMT+1)</option>
                    <option value="Europe/Paris">Europe/Paris (GMT+2)</option>
                    <option value="America/New_York">America/New York (EST)</option>
                    <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST+4)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST+5:30)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={s.label}>Date Format</label>
                <select className="pf-select" defaultValue="DD/MM/YYYY">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="pf-btn" onClick={() => toast.success('Region settings saved!')}>Save Settings</button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* ── 4. TWO-FACTOR AUTHENTICATION ── */}
          <div style={s.card}>
            <SectionHdr icon={Shield}  title="Two-Factor Authentication"
              badge={<span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: twoFaEnabled ? '#ECFDF5' : '#FEF2F2', color: twoFaEnabled ? '#10B981' : '#EF4444', border: `1px solid ${twoFaEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>{twoFaEnabled ? 'Enabled' : 'Disabled'}</span>}
            />
            <div style={s.body}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginBottom: 4 }}>Authenticator App (TOTP)</div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, marginBottom: 12 }}>
                    Use an authenticator app like Google Authenticator or Authy to generate one-time codes.
                  </div>
                  {!twoFaEnabled ? (
                    <button className="pf-btn" onClick={() => { setShowQr(true); }}>Set Up 2FA</button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="pf-btn-ghost" onClick={() => { setShowQr(true); }}>View Recovery Codes</button>
                      <button className="pf-btn-danger" onClick={() => { setTwoFaEnabled(false); setShowQr(false); toast.success('2FA disabled.'); }}>Disable 2FA</button>
                    </div>
                  )}
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: twoFaEnabled ? '#ECFDF5' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={22} color={twoFaEnabled ? '#10B981' : '#EF4444'} />
                </div>
              </div>

              {showQr && !twoFaEnabled && (
                <div style={{ marginTop: 18, padding: 20, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E4E9F2' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>Scan with Authenticator</div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ background: '#fff', padding: 8, borderRadius: 10, border: '1px solid #E4E9F2', display: 'inline-block' }}>
                      <svg width="80" height="80" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="white"/>
                        <rect x="5" y="5" width="28" height="28" fill="#1A1A2E" rx="3"/>
                        <rect x="9" y="9" width="20" height="20" fill="white" rx="2"/>
                        <rect x="12" y="12" width="14" height="14" fill="#1A1A2E" rx="1"/>
                        <rect x="67" y="5" width="28" height="28" fill="#1A1A2E" rx="3"/>
                        <rect x="71" y="9" width="20" height="20" fill="white" rx="2"/>
                        <rect x="74" y="12" width="14" height="14" fill="#1A1A2E" rx="1"/>
                        <rect x="5" y="67" width="28" height="28" fill="#1A1A2E" rx="3"/>
                        <rect x="9" y="71" width="20" height="20" fill="white" rx="2"/>
                        <rect x="12" y="74" width="14" height="14" fill="#1A1A2E" rx="1"/>
                        {[40,44,48,52,56,60,64].map((x,i) => [40,44,48,52,56,60].map((y,j) => (
                          (i+j)%2===0 ? <rect key={`${i}-${j}`} x={x} y={y} width="3" height="3" fill="#1A1A2E"/> : null
                        )))}
                        <circle cx="50" cy="50" r="8" fill="#4F8EF7" opacity="0.9"/>
                        <text x="50" y="54" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">RF</text>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, background: '#fff', border: '1px solid #E4E9F2', borderRadius: 6, padding: '6px 10px', letterSpacing: 1, color: '#1A1A2E', marginBottom: 10 }}>JBSW Y3DP EHO G6S3</div>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                        {[0,1,2,3,4,5].map(i => (
                          <input key={i} maxLength={1} style={{ width: 28, height: 32, textAlign: 'center', border: '1.5px solid #E4E9F2', borderRadius: 6, fontSize: 14, fontWeight: 700, outline: 'none' }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="pf-btn" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => { setTwoFaEnabled(true); setShowQr(false); toast.success('2FA enabled!'); }}>Verify</button>
                        <button className="pf-btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setShowQr(false)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 5. LOGIN ACTIVITY ── */}
          <div style={s.card}>
            <SectionHdr icon={Activity} title="Recent Login Activity" />
            <div style={{ padding: '8px 20px 12px' }}>
              {loginHistory.map((item, i) => (
                <div key={i} className="pf-activity-row">
                  <div className="pf-device-icon">
                    <span style={{ fontSize: 16 }}>{item.device.includes('iPhone') ? '📱' : item.device.includes('MacBook') ? '💻' : '🖥️'}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{item.device}</span>
                      {item.current && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#ECFDF5', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>Current Session</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                      {item.location} · {item.ip}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0, textAlign: 'right' }}>
                    {item.time}
                    {!item.current && (
                      <div>
                        <button onClick={() => toast.success('Session revoked.')} style={{ fontSize: 10, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, marginTop: 3, padding: 0 }}>Revoke</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: 10 }}>
                <button className="pf-btn-ghost" onClick={() => toast.success('All other sessions signed out.')} style={{ fontSize: 12 }}>Sign Out All Other Sessions</button>
              </div>
            </div>
          </div>

          {/* ── 6. REPORT DELIVERY PREFERENCES ── */}
          <div style={s.card}>
            <SectionHdr icon={FileText} title="Report Delivery Preferences" />
            <div style={s.body}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
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
                    <option value="email">Email Only</option>
                    <option value="both">PDF + Email</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>CC Additional Recipients</label>
                <input className="pf-input" defaultValue="director@acmecorp.com" placeholder="e.g. boss@yourcompany.com" />
                <div style={s.muted}>Comma-separated email addresses that also receive the report.</div>
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: 10, border: '1px solid #E4E9F2', padding: '4px 14px' }}>
                {[
                  { label: 'Monthly report ready', desc: 'Email when your report is generated', val: notifyEmail, set: setNotifyEmail },
                  { label: 'Weekly SEO digest', desc: 'Short weekly summary of ranking changes', val: notifyWeekly, set: setNotifyWeekly },
                  { label: 'Ranking alerts', desc: 'Alert when a keyword drops 5+ positions', val: notifyRanking, set: setNotifyRanking },
                  { label: 'Milestone notifications', desc: 'Celebrate reaching Top 3 or Top 10', val: notifyMilestone, set: setNotifyMilestone },
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="pf-btn" onClick={handleScheduleSave} disabled={savingSchedule}>
                  {savingSchedule ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>

          {/* ── 8. API ACCESS TOKEN ── */}
          <div style={s.card}>
            <SectionHdr icon={Zap} title="API Access Token"
              badge={<span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#ECFDF5', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>Read-Only</span>}
            />
            <div style={s.body}>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, marginBottom: 14 }}>
                Use this token to access your SEO data programmatically. Keep it private.
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <div className="pf-token">{apiTokenVisible ? apiToken : '•'.repeat(36)}</div>
                <button className="pf-btn-ghost" onClick={() => setApiTokenVisible(!apiTokenVisible)} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  {apiTokenVisible ? '🙈 Hide' : '👁 Show'}
                </button>
                <button className="pf-btn-ghost" onClick={() => { navigator.clipboard.writeText(apiToken); toast.success('Token copied!'); }} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                  📋 Copy
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFBEB', borderRadius: 9, padding: '10px 14px', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ fontSize: 11, color: '#92400E' }}>⚠️ Regenerating invalidates current token.</div>
                <button className="pf-btn-ghost" onClick={() => toast.success('API token regenerated!')} style={{ fontSize: 11, flexShrink: 0 }}>Regenerate</button>
              </div>
            </div>
          </div>

          {/* ── 9. DANGER ZONE ── */}
          <div style={{ ...s.card, border: '1px solid rgba(239,68,68,0.25)' }}>
            <div style={{ ...s.hdr, borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0 }} />
              <div style={{ ...s.hdrTitle, color: '#EF4444' }}>Danger Zone</div>
            </div>
            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                {
                  title: 'Export My Data',
                  desc: 'Download a ZIP of all report files and campaign logs.',
                  action: () => toast.success('Data export requested. You\'ll receive a link shortly.'),
                  label: 'Export Data',
                  danger: false,
                },
                {
                  title: 'Sign Out of All Devices',
                  desc: 'Revoke session states on all other browsers.',
                  action: () => toast.success('Signed out of other devices.'),
                  label: 'Sign Out All',
                  danger: false,
                },
                {
                  title: 'Request Account Deletion',
                  desc: 'Permanently remove your white-label profile access.',
                  action: () => { if (confirm('Are you sure? This action is irreversible.')) toast.error('Deactivation requested.'); },
                  label: 'Delete Account',
                  danger: true,
                },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: i < arr.length-1 ? '1px solid #FEF2F2' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.danger ? '#EF4444' : '#1A1A2E' }}>{item.title}</div>
                    <div style={s.muted}>{item.desc}</div>
                  </div>
                  <button
                    onClick={item.action}
                    style={{ padding: '6px 12px', borderRadius: 8, background: 'transparent', border: `1.5px solid ${item.danger ? '#EF4444' : '#E4E9F2'}`, color: item.danger ? '#EF4444' : '#475569', cursor: 'pointer', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}
                  >{item.label}</button>
                </div>
              ))}
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

function ManageDataSection({ portalData, refreshData, loading }: any) {
  const kpis = portalData?.kpis ?? {};
  const latestAudit = portalData?.latestAudit ?? null;
  const latestBl = portalData?.latestBacklinks ?? null;
  const realKeywords = portalData?.keywords ?? [];
  const client = portalData?.client ?? null;

  const [metrics, setMetrics] = useState({
    organicSessions: '',
    clicks: '',
    impressions: '',
    top10Count: '',
    totalKeywords: '',
    healthScore: '',
    domainTrust: '',
    totalBacklinks: '',
  });

  const [newKw, setNewKw] = useState({ keyword: '', pos: '10', vol: '100', url: '/' });
  const [savingMetrics, setSavingMetrics] = useState(false);
  const [addingKw, setAddingKw] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (portalData) {
      setMetrics({
        organicSessions: String(kpis.organicSessions ?? ''),
        clicks: String(kpis.clicks ?? ''),
        impressions: String(kpis.impressions ?? ''),
        top10Count: String(kpis.top10Keywords ?? ''),
        totalKeywords: String(kpis.totalKeywords ?? ''),
        healthScore: String(latestAudit?.healthScore ?? ''),
        domainTrust: String(latestBl?.domainTrust ?? ''),
        totalBacklinks: String(latestBl?.totalBacklinks ?? ''),
      });
    }
  }, [portalData, kpis, latestAudit, latestBl]);

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMetrics(true);
    try {
      const res = await fetch('/api/client-portal/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
      });
      if (!res.ok) throw new Error();
      toast.success('SEO performance metrics updated successfully!');
      refreshData();
    } catch {
      toast.error('Failed to update metrics');
    } finally {
      setSavingMetrics(false);
    }
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKw.keyword.trim()) return;
    setAddingKw(true);
    try {
      const res = await fetch('/api/client-portal/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newKeyword: newKw }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Keyword "${newKw.keyword}" added!`);
      setNewKw({ keyword: '', pos: '10', vol: '100', url: '/' });
      refreshData();
    } catch {
      toast.error('Failed to add keyword');
    } finally {
      setAddingKw(false);
    }
  };

  const handleDeleteKeyword = async (kwText: string) => {
    if (!confirm(`Are you sure you want to stop tracking "${kwText}"?`)) return;
    try {
      const res = await fetch('/api/client-portal/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteKeyword: kwText }),
      });
      if (!res.ok) throw new Error();
      toast.success('Keyword removed');
      refreshData();
    } catch {
      toast.error('Failed to remove keyword');
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch('/api/client-portal/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateReport: true }),
      });
      if (!res.ok) throw new Error();
      toast.success('New report generated successfully!');
      refreshData();
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #E4E9F2',
    borderRadius: 14,
    boxShadow: '0 1px 4px rgba(26,26,46,0.05)',
    marginBottom: 20,
    overflow: 'hidden',
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1A1A2E', margin: 0 }}>SEO Campaign Manager</h2>
        <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>Manually add, edit, and refresh your campaign data</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }} className="pf-two-col">
        {/* Left Column: Metrics Update & Report Generator */}
        <div>
          <div style={cardStyle}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #E4E9F2', fontWeight: 800, color: '#1A1A2E' }}>
              📈 Edit Performance Metrics
            </div>
            <form onSubmit={handleSaveMetrics} style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Organic Sessions</label>
                  <input className="profile-input" type="number" value={metrics.organicSessions} onChange={e => setMetrics({ ...metrics, organicSessions: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Organic Clicks</label>
                  <input className="profile-input" type="number" value={metrics.clicks} onChange={e => setMetrics({ ...metrics, clicks: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Impressions</label>
                  <input className="profile-input" type="number" value={metrics.impressions} onChange={e => setMetrics({ ...metrics, impressions: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Health Score (%)</label>
                  <input className="profile-input" type="number" min="0" max="100" value={metrics.healthScore} onChange={e => setMetrics({ ...metrics, healthScore: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Domain Trust Score</label>
                  <input className="profile-input" type="number" min="0" max="100" value={metrics.domainTrust} onChange={e => setMetrics({ ...metrics, domainTrust: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Total Backlinks</label>
                  <input className="profile-input" type="number" value={metrics.totalBacklinks} onChange={e => setMetrics({ ...metrics, totalBacklinks: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Total Keywords Tracked</label>
                  <input className="profile-input" type="number" value={metrics.totalKeywords} onChange={e => setMetrics({ ...metrics, totalKeywords: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Top 10 Keywords Count</label>
                  <input className="profile-input" type="number" value={metrics.top10Count} onChange={e => setMetrics({ ...metrics, top10Count: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" disabled={savingMetrics}>
                  {savingMetrics ? 'Saving Metrics…' : 'Save Performance Data'}
                </button>
              </div>
            </form>
          </div>

          {/* Report Generator */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #1A1A2E, #16213E)', color: '#fff' }}>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>📄 Self-Serve Report Builder</div>
              <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.6, marginBottom: 20 }}>
                Generate or refresh a monthly report card based on your updated metrics. 
                This will update the PDF and shared links instantly.
              </div>
              <button 
                onClick={handleGenerateReport} 
                disabled={generatingReport} 
                style={{ 
                  background: '#4F8EF7', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '11px 20px', 
                  borderRadius: 9, 
                  fontWeight: 700, 
                  fontSize: 13, 
                  cursor: 'pointer' 
                }}
              >
                {generatingReport ? '⏳ Building Report…' : '🚀 Generate Monthly Report Card'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Keyword Manager */}
        <div>
          {/* Add Keyword Card */}
          <div style={cardStyle}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #E4E9F2', fontWeight: 800, color: '#1A1A2E' }}>
              🔑 Add Tracked Keyword
            </div>
            <form onSubmit={handleAddKeyword} style={{ padding: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Keyword Phrase</label>
                <input className="profile-input" required placeholder="e.g. best seo tools" value={newKw.keyword} onChange={e => setNewKw({ ...newKw, keyword: e.target.value })} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Position (#)</label>
                  <input className="profile-input" type="number" min="1" max="100" value={newKw.pos} onChange={e => setNewKw({ ...newKw, pos: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Search Volume</label>
                  <input className="profile-input" type="number" min="0" value={newKw.vol} onChange={e => setNewKw({ ...newKw, vol: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Landing Page Path</label>
                <input className="profile-input" placeholder="e.g. /features" value={newKw.url} onChange={e => setNewKw({ ...newKw, url: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" disabled={addingKw}>
                  {addingKw ? 'Adding…' : 'Add Keyword'}
                </button>
              </div>
            </form>
          </div>

          {/* Keyword list with deletes */}
          <div style={cardStyle}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #E4E9F2', fontWeight: 800, color: '#1A1A2E' }}>
              📋 Tracked Keyword List ({realKeywords.length})
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {realKeywords.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>No keywords added yet.</div>
              ) : (
                realKeywords.map((kw: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < realKeywords.length-1 ? '1px solid #F1F5F9' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{kw.keyword ?? kw.query}</div>
                      <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1 }}>Pos: #{kw.pos ?? kw.position} · Vol: {kw.vol ?? kw.searchVolume}</div>
                    </div>
                    <button 
                      onClick={() => handleDeleteKeyword(kw.keyword ?? kw.query)} 
                      style={{ 
                        background: '#FEF2F2', 
                        color: '#EF4444', 
                        border: 'none', 
                        padding: '4px 10px', 
                        borderRadius: 6, 
                        fontSize: 10, 
                        fontWeight: 700, 
                        cursor: 'pointer' 
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
