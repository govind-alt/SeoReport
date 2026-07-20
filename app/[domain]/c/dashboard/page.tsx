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

/* ─── Demo Data ─── */
const trafficData = [
  { month: 'Nov', sessions: 4100, clicks: 3200 },
  { month: 'Dec', sessions: 4800, clicks: 3700 },
  { month: 'Jan', sessions: 5200, clicks: 4100 },
  { month: 'Feb', sessions: 6100, clicks: 4900 },
  { month: 'Mar', sessions: 7400, clicks: 5800 },
  { month: 'Apr', sessions: 6900, clicks: 5400 },
  { month: 'May', sessions: 8420, clicks: 6700 },
];

const keywordData = [
  { month: 'Nov', top3: 14, top10: 32 },
  { month: 'Dec', top3: 18, top10: 38 },
  { month: 'Jan', top3: 22, top10: 43 },
  { month: 'Feb', top3: 28, top10: 47 },
  { month: 'Mar', top3: 33, top10: 51 },
  { month: 'Apr', top3: 38, top10: 55 },
  { month: 'May', top3: 47, top10: 63 },
];

const positionDistribution = [
  { name: 'Top 3', value: 47, color: '#10B981', fill: '#10B981' },
  { name: 'Pos 4–10', value: 86, color: '#4F8EF7', fill: '#4F8EF7' },
  { name: 'Pos 11–30', value: 124, color: '#F59E0B', fill: '#F59E0B' },
  { name: 'Pos 31+', value: 68, color: '#E4E9F2', fill: '#E4E9F2' },
];

const demoKeywords = [
  { keyword: 'local seo london',      pos: 2,  prev: 10, change: 8,  vol: 880,  url: '/local-seo',    trend: 'up' },
  { keyword: 'seo agency london',     pos: 4,  prev: 7,  change: 3,  vol: 1600, url: '/services/seo', trend: 'up' },
  { keyword: 'digital marketing uk',  pos: 7,  prev: 6,  change: -1, vol: 2400, url: '/about',         trend: 'down' },
  { keyword: 'best seo company uk',   pos: 9,  prev: 11, change: 2,  vol: 1800, url: '/about-us',     trend: 'up' },
  { keyword: 'google ranking service',pos: 15, prev: 15, change: 0,  vol: 1200, url: '/services',     trend: 'flat' },
  { keyword: 'technical seo audit',   pos: 22, prev: 19, change: -3, vol: 640,  url: '/audit',        trend: 'down' },
  { keyword: 'ecommerce seo agency',  pos: 28, prev: 36, change: 8,  vol: 1600, url: '/ecommerce',    trend: 'up' },
  { keyword: 'content marketing seo', pos: 34, prev: 33, change: -1, vol: 2100, url: '/content',      trend: 'down' },
  { keyword: 'seo consultant london', pos: 11, prev: 13, change: 2,  vol: 960,  url: '/consultant',   trend: 'up' },
  { keyword: 'ppc agency london',     pos: 11, prev: 14, change: 3,  vol: 720,  url: '/ppc',          trend: 'up' },
];

interface DemoReport {
  id: string; period: string; generatedDate: string;
  healthScore: number; sessions: string; top10: string;
  clicks: string; impressions: string;
  wins: string[]; status: 'ready' | 'generating' | 'draft';
}

const demoReports: DemoReport[] = [
  {
    id: 'r1', period: 'May 2026', generatedDate: 'Jun 1, 2026',
    healthScore: 76, sessions: '8,420', top10: '47',
    clicks: '6,700', impressions: '124,000',
    status: 'ready',
    wins: [
      '"local seo london" climbed pos 10 → pos 2 (+8 places)',
      'Organic traffic increased 16.3% month-over-month',
      '3 new high-authority backlinks acquired (Forbes, Moz, TechRadar)',
    ],
  },
  {
    id: 'r2', period: 'April 2026', generatedDate: 'May 1, 2026',
    healthScore: 68, sessions: '7,240', top10: '43',
    clicks: '5,400', impressions: '108,000',
    status: 'ready',
    wins: [
      '"seo agency london" entered the top 5 positions',
      'Page speed optimizations reduced bounce rate by 12%',
    ],
  },
  {
    id: 'r3', period: 'March 2026', generatedDate: 'Apr 1, 2026',
    healthScore: 62, sessions: '6,100', top10: '39',
    clicks: '4,900', impressions: '96,000',
    status: 'ready',
    wins: [
      'Gained featured snippet for "seo consultant london"',
      'Organic impressions grew 25% overall',
    ],
  },
  {
    id: 'r4', period: 'February 2026', generatedDate: 'Mar 1, 2026',
    healthScore: 58, sessions: '5,200', top10: '35',
    clicks: '4,100', impressions: '81,000',
    status: 'ready',
    wins: [
      'Initial optimization for target landing pages completed',
      'First batch of 5 articles published and indexed',
    ],
  },
];

const aiRecs = [
  { priority: 'critical', label: 'Fix broken internal links', detail: '3 critical broken links on /blog/post-14 and /resources/guide-2. Fix this week to recover crawl budget.', impact: 'High' },
  { priority: 'high',     label: 'Push "ppc agency london" (Pos.11)', detail: 'Add 2–3 internal links from blog posts to /ppc page to enter the top 10.', impact: 'Medium' },
  { priority: 'medium',   label: 'Write 8 missing meta descriptions', detail: '8 blog pages lack meta descriptions, reducing CTR in search results.', impact: 'Medium' },
  { priority: 'low',      label: 'Compress hero images on homepage', detail: 'Hero images are 2.4 MB uncompressed. Reducing to <200 KB can improve LCP by 1.2s.', impact: 'Low' },
];

const priorityColor: Record<string, string> = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#4F8EF7',
  low: '#10B981',
};

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
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Client';

  /* --- state --- */
  const [activeSection, setActiveSection] = useState<'dashboard' | 'reports' | 'rankings' | 'analytics' | 'profile'>('dashboard');
  const [selectedReport, setSelectedReport] = useState<DemoReport | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [contactMsg, setContactMsg] = useState('');
  const [sendingContact, setSendingContact] = useState(false);
  const [kwSearch, setKwSearch] = useState('');
  const [profileForm, setProfileForm] = useState({ firstName: session?.user?.name?.split(' ')[0] ?? 'Sarah', lastName: 'Clarke', email: 'client@acme.com' });
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyRanking, setNotifyRanking] = useState(false);

  // Listen to hash changes from layout nav
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      if (['reports', 'rankings', 'analytics', 'profile'].includes(h)) {
        setActiveSection(h as any);
      } else {
        setActiveSection('dashboard');
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const filteredKws = demoKeywords.filter(k =>
    !kwSearch || k.keyword.toLowerCase().includes(kwSearch.toLowerCase())
  );

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSendingContact(true);
    setTimeout(() => {
      setSendingContact(false);
      toast.success('Message sent! Your agency will respond within 1 business day.');
      setContactMsg('');
      setShowContact(false);
    }, 1200);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPw !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    toast.success('Password updated successfully!');
    setPasswords({ current: '', newPw: '', confirm: '' });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  /* ── Report Detail View ── */
  if (selectedReport) {
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
            <button onClick={() => { toast.success('Download started...'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: T.textLight }}>
              <Download size={13} /> Download PDF
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: T.textLight }}>
              🔗 Share Link
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="report-detail-hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Monthly SEO Report</div>
              <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 4, letterSpacing: -0.5 }}>Acme Corp</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>acmecorp.com · {selectedReport.period}</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Generated: {selectedReport.generatedDate}</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '14px 22px', flexShrink: 0 }}>
              <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }}>{selectedReport.healthScore}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>Health Score</div>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="report-kpi">
          {[
            { label: 'Organic Sessions', value: selectedReport.sessions, delta: '+16.3%', up: true },
            { label: 'Top 10 Keywords', value: selectedReport.top10, delta: '+4 keywords', up: true },
            { label: 'Total Clicks', value: selectedReport.clicks, delta: '+14.8%', up: true },
            { label: 'Impressions', value: selectedReport.impressions, delta: '+22.1%', up: true },
          ].map((k, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 3px rgba(26,26,46,0.05)' }}>
              <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.textDark, marginBottom: 4 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: T.success, fontWeight: 700 }}>↑ {k.delta}</div>
            </div>
          ))}
        </div>

        {/* Wins */}
        <div className="report-section-card">
          <div className="report-section-header">
            <div className="report-section-num">1</div>
            <div className="report-section-title">This Month's Wins</div>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedReport.wins.map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', background: T.successLight, borderRadius: 9, border: `1px solid rgba(16,185,129,0.15)` }}>
                <CheckCircle2 size={15} color={T.success} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: T.textDark, fontWeight: 500 }}>{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Keyword Rankings */}
        <div className="report-section-card">
          <div className="report-section-header">
            <div className="report-section-num">2</div>
            <div className="report-section-title">Keyword Rankings</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: T.surface2 }}>
                  {['Keyword', 'Position', 'Change', 'Volume', 'URL'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: T.textMuted, textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoKeywords.slice(0, 5).map((kw, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: T.textDark, fontWeight: 600 }}>{kw.keyword}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: kw.pos <= 3 ? T.successLight : kw.pos <= 10 ? T.primaryLight : T.surface2, color: kw.pos <= 3 ? T.success : kw.pos <= 10 ? T.primary : T.textMuted }}>
                        #{kw.pos}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: kw.change > 0 ? T.success : kw.change < 0 ? T.danger : T.textMuted }}>
                      {kw.change > 0 ? `▲ +${kw.change}` : kw.change < 0 ? `▼ ${kw.change}` : '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: T.textLight }}>{kw.vol.toLocaleString()}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, color: T.primary, fontFamily: 'monospace' }}>{kw.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="report-section-card">
          <div className="report-section-header">
            <div className="report-section-num">3</div>
            <div className="report-section-title">AI-Powered Recommendations</div>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {aiRecs.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, borderLeft: `4px solid ${priorityColor[r.priority]}` }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor[r.priority] }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.textDark, marginBottom: 3 }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: T.textLight, lineHeight: 1.5 }}>{r.detail}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: priorityColor[r.priority], marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Impact: {r.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

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

        {/* Contact modal */}
        {showContact && <ContactModal onClose={() => setShowContact(false)} msg={contactMsg} setMsg={setContactMsg} sending={sendingContact} onSend={handleSendContact} />}
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
      {showContact && <ContactModal onClose={() => setShowContact(false)} msg={contactMsg} setMsg={setContactMsg} sending={sendingContact} onSend={handleSendContact} />}

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
                  Acme Corp · acmecorp.com · {today}
                </p>
              </div>
              <button className="btn-primary" onClick={() => setShowContact(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={14} /> Contact My Agency
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="cp-grid-4">
            <StatCard label="Organic Sessions" value="8,420" delta="+16.3% vs last month" deltaPositive icon={Activity} />
            <StatCard label="Top 10 Keywords" value="47" delta="+4 this month" deltaPositive icon={Target} accent="#10B981" />
            <StatCard label="Domain Trust" value="42" delta="+2 pts" deltaPositive icon={Shield} accent="#F59E0B" />
            <StatCard label="Site Health" value="76%" delta="+8 pts" deltaPositive icon={Zap} accent="#4F8EF7" />
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
                  <AreaChart data={trafficData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                  <BarChart data={keywordData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`, borderRadius: 12, padding: '20px', color: '#fff', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(79,142,247,0.2)', pointerEvents: 'none' }} />
                  <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>SEO Performance Report</div>
                  <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 3 }}>May 2026</div>
                  <div style={{ fontSize: 11, opacity: 0.65 }}>Acme Corp · acmecorp.com</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>76%</div>
                      <div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase' }}>Health</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>8,420</div>
                      <div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase' }}>Sessions</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>47</div>
                      <div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase' }}>Top 10</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
                  {demoReports[0].wins.map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: T.textLight }}>
                      <span style={{ color: T.success, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={() => setSelectedReport(demoReports[0])}>
                    View Full Report
                  </button>
                  <button className="btn-ghost" onClick={() => toast.success('PDF downloading...')}>
                    <Download size={14} />
                  </button>
                </div>
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
                {aiRecs.map((r, i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, borderLeft: `4px solid ${priorityColor[r.priority]}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.textDark, marginBottom: 2 }}>{r.label}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: priorityColor[r.priority], textTransform: 'uppercase', letterSpacing: 0.5 }}>{r.priority}</span>
                      <span style={{ fontSize: 9, color: T.textMuted }}>· Impact: {r.impact}</span>
                    </div>
                  </div>
                ))}
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
                  {demoReports.slice(0, 3).map(r => (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: T.textDark }}>{r.period}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: T.textMuted }}>{r.generatedDate}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, maxWidth: 80 }}>
                            <div className="progress-bar">
                              <div className="progress-bar-fill" style={{ width: `${r.healthScore}%`, background: r.healthScore >= 70 ? T.success : r.healthScore >= 50 ? T.warning : T.danger }} />
                            </div>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: r.healthScore >= 70 ? T.success : T.warning }}>{r.healthScore}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: T.textLight }}>{r.sessions}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setSelectedReport(r)} style={{ padding: '5px 10px', borderRadius: 6, background: T.primaryLight, color: T.primary, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Eye size={11} /> View
                          </button>
                          <button onClick={() => toast.success('PDF downloading...')} style={{ padding: '5px 10px', borderRadius: 6, background: 'transparent', border: `1px solid ${T.border}`, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: T.textLight, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Download size={11} /> PDF
                          </button>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18, marginBottom: 24 }}>
            {demoReports.map(r => (
              <div key={r.id} className="report-card" onClick={() => setSelectedReport(r)}>
                <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyMid}, #1a3a6e)`, padding: '22px 20px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(79,142,247,0.2)' }} />
                  <div style={{ fontSize: 9, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>SEO Performance Report</div>
                  <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 3 }}>{r.period}</div>
                  <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4 }}>Acme Corp · acmecorp.com</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', fontSize: 9, fontWeight: 700, color: '#34D399', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    <CheckCircle2 size={9} /> Ready
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: `1px solid ${T.border}` }}>
                  {[{ v: r.healthScore + '%', l: 'Health' }, { v: r.sessions, l: 'Sessions' }, { v: r.top10, l: 'Top 10' }].map((m, i) => (
                    <div key={i} style={{ padding: '12px 8px', textAlign: 'center', borderRight: i < 2 ? `1px solid ${T.border}` : 'none' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: T.textDark }}>{m.v}</div>
                      <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', marginTop: 2 }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surface2 }}>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{r.generatedDate}</div>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setSelectedReport(r)} style={{ padding: '5px 12px', borderRadius: 7, background: T.primaryLight, color: T.primary, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>View</button>
                    <button onClick={() => toast.success('PDF downloading...')} style={{ padding: '5px 10px', borderRadius: 7, background: T.primary, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>PDF</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            {[
              { label: 'Top 3', value: 47, color: T.success, bg: T.successLight },
              { label: 'Top 10', value: 86, color: T.primary, bg: T.primaryLight },
              { label: 'Top 30', value: 124, color: T.warning, bg: T.warningLight },
              { label: 'Not Ranked', value: 68, color: T.textMuted, bg: T.surface2 },
            ].map((s, i) => (
              <Card key={i} style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: T.textDark, marginBottom: 6 }}>{s.value}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: s.color }}>
                  keywords
                </div>
              </Card>
            ))}
          </div>

          {/* Keywords Table */}
          <Card>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Tracked Keywords ({filteredKws.length})</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ background: T.surface2, padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px', gap: 8 }}>
                {['Keyword', 'Position', 'Change', 'Volume'].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
                ))}
              </div>
              {filteredKws.map((kw, i) => (
                <div key={i} className="kw-row">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.textDark, marginBottom: 2 }}>{kw.keyword}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, fontFamily: 'monospace' }}>{kw.url}</div>
                  </div>
                  <div>
                    <span className="pos-badge" style={{
                      background: kw.pos <= 3 ? T.successLight : kw.pos <= 10 ? T.primaryLight : kw.pos <= 30 ? T.warningLight : T.surface2,
                      color: kw.pos <= 3 ? T.success : kw.pos <= 10 ? T.primary : kw.pos <= 30 ? T.warning : T.textMuted,
                    }}>
                      #{kw.pos}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: kw.change > 0 ? T.success : kw.change < 0 ? T.danger : T.textMuted }}>
                    {kw.change > 0 ? `▲ +${kw.change}` : kw.change < 0 ? `▼ ${kw.change}` : '—'}
                  </div>
                  <div style={{ fontSize: 12, color: T.textLight }}>{kw.vol.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── ANALYTICS SECTION ── */}
      {activeSection === 'analytics' && (
        <div>
          <SectionHeader title="Analytics Overview" subtitle="Organic traffic, clicks, and impressions from your website" />

          <div className="cp-grid-4">
            <StatCard label="Organic Sessions" value="8,420" delta="+16.3% vs last month" deltaPositive icon={Activity} />
            <StatCard label="Total Clicks" value="6,700" delta="+14.8%" deltaPositive icon={ArrowUpRight} accent="#10B981" />
            <StatCard label="Impressions" value="124K" delta="+22.1%" deltaPositive icon={Eye} accent="#F59E0B" />
            <StatCard label="Avg. CTR" value="5.4%" delta="+0.8 pts" deltaPositive icon={BarChart2} accent="#4F8EF7" />
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
                <AreaChart data={trafficData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
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
              {[
                { q: 'local seo london', clicks: 1240, impressions: 8400, ctr: '14.8%' },
                { q: 'seo agency london', clicks: 890, impressions: 6200, ctr: '14.4%' },
                { q: 'digital marketing uk', clicks: 720, impressions: 9100, ctr: '7.9%' },
                { q: 'best seo company uk', clicks: 650, impressions: 5600, ctr: '11.6%' },
                { q: 'technical seo audit', clicks: 480, impressions: 3800, ctr: '12.6%' },
              ].map((q, i) => (
                <div key={i} style={{ padding: '11px 16px', borderBottom: i < 4 ? `1px solid ${T.border}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: T.primaryLight, color: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.q}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{q.impressions.toLocaleString()} impressions · {q.ctr} CTR</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.textDark, flexShrink: 0 }}>{q.clicks.toLocaleString()}</div>
                </div>
              ))}
            </Card>

            <Card>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Top Pages</div>
              </div>
              {[
                { page: '/ (homepage)', clicks: 2100 },
                { page: '/local-seo', clicks: 980 },
                { page: '/services/seo', clicks: 870 },
                { page: '/about-us', clicks: 640 },
                { page: '/audit', clicks: 420 },
              ].map((p, i) => (
                <div key={i} style={{ padding: '11px 16px', borderBottom: i < 4 ? `1px solid ${T.border}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Globe size={14} color={T.textMuted} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: T.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.page}</div>
                    <div className="progress-bar" style={{ marginTop: 5, maxWidth: 160 }}>
                      <div className="progress-bar-fill" style={{ width: `${(p.clicks / 2100) * 100}%`, background: T.primary }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.textDark, flexShrink: 0 }}>{p.clicks.toLocaleString()}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── PROFILE SECTION ── */}
      {activeSection === 'profile' && (
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <SectionHeader title="Account Settings" subtitle="Manage your profile, password, and notification preferences" />

          {/* Profile Info */}
          <Card style={{ marginBottom: 18 }}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <User size={16} color={T.primary} />
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Profile Information</div>
            </div>
            <form style={{ padding: 20 }} onSubmit={e => { e.preventDefault(); toast.success('Profile updated!'); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.textDark, marginBottom: 5 }}>First Name</label>
                  <input className="profile-input" value={profileForm.firstName} onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.textDark, marginBottom: 5 }}>Last Name</label>
                  <input className="profile-input" value={profileForm.lastName} onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.textDark, marginBottom: 5 }}>Email Address</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 9 }}>
                  <Mail size={13} color={T.textMuted} />
                  <span style={{ fontSize: 13, color: T.textMuted, flex: 1 }}>{profileForm.email}</span>
                  <span style={{ fontSize: 10, color: T.textMuted, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 5, padding: '2px 6px' }}>Read-only</span>
                </div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>Contact your account manager to update email.</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card style={{ marginBottom: 18 }}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Lock size={16} color={T.primary} />
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Change Password</div>
            </div>
            <form style={{ padding: 20 }} onSubmit={handlePasswordUpdate}>
              {[
                { label: 'Current Password', key: 'current', val: passwords.current },
                { label: 'New Password', key: 'newPw', val: passwords.newPw },
                { label: 'Confirm New Password', key: 'confirm', val: passwords.confirm },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.textDark, marginBottom: 5 }}>{f.label}</label>
                  <input type="password" className="profile-input" value={f.val} onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))} required />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="submit" className="btn-primary">Update Password</button>
              </div>
            </form>
          </Card>

          {/* Notification Preferences */}
          <Card style={{ marginBottom: 18 }}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bell size={16} color={T.primary} />
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textDark }}>Notification Preferences</div>
            </div>
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'New report ready', desc: 'Email when your monthly report is generated', val: notifyEmail, set: setNotifyEmail },
                { label: 'Ranking alerts', desc: 'Notify when a keyword drops significantly', val: notifyRanking, set: setNotifyRanking },
              ].map((n, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === 0 ? `1px solid ${T.border}` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.textDark }}>{n.label}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{n.desc}</div>
                  </div>
                  <button
                    className="toggle-btn"
                    style={{ background: n.val ? T.primary : T.border }}
                    onClick={() => { n.set(!n.val); toast.success(`Notifications ${!n.val ? 'enabled' : 'disabled'}`); }}
                  >
                    <div className="toggle-thumb" style={{ left: n.val ? 19 : 3 }} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Danger zone */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ padding: '9px 20px', borderRadius: 9, background: 'transparent', border: `1.5px solid ${T.danger}`, color: T.danger, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Contact Modal ─── */
function ContactModal({ onClose, msg, setMsg, sending, onSend }: {
  onClose: () => void; msg: string; setMsg: (s: string) => void;
  sending: boolean; onSend: (e: React.FormEvent) => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 480, boxShadow: '0 32px 64px rgba(26,26,46,0.25)', border: `1px solid rgba(79,142,247,0.15)`, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid #E4E9F2`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E' }}>Message Your Agency</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>We'll respond within 1 business day</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, borderRadius: 6 }}><X size={20} /></button>
        </div>
        <form onSubmit={onSend} style={{ padding: 24 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Subject</label>
            <select style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E4E9F2', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#F8FAFC', color: '#1A1A2E' }}>
              <option>Question about my rankings</option>
              <option>Report clarification</option>
              <option>Strategy review request</option>
              <option>Billing query</option>
              <option>Other</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1A1A2E', marginBottom: 5 }}>Message</label>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} required rows={4} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E4E9F2', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} placeholder="Type your message…" />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 16px', borderRadius: 9, border: '1px solid #E4E9F2', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569' }}>Cancel</button>
            <button type="submit" disabled={sending} style={{ padding: '9px 20px', borderRadius: 9, background: '#4F8EF7', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Send size={13} /> {sending ? 'Sending…' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
