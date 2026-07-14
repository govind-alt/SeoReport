'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, FileText, Phone, ArrowUpRight,
  Download, Send, CheckCircle2, Clock, AlertCircle,
  Search, Star, Globe, BarChart2, Activity, RefreshCw,
  ChevronRight, Eye, MessageSquare, Mail, X, User, Lock, Bell
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Wireframe Colors & Styling ─── */
const THEME = {
  primary: '#4F8EF7',
  primaryHover: '#3B7BF6',
  bgLight: '#EBF2FF',
  border: '#E4E9F2',
  textDark: '#1A1A2E',
  textLight: '#475569',
  textMuted: '#94A3B8',
  success: '#10B981',
  successBg: '#ECFDF5',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
};

/* ─── Demo data matching the wireframe ─── */
const trafficData6Months = [
  { month: 'Dec', sessions: 4200 },
  { month: 'Jan', sessions: 5200 },
  { month: 'Feb', sessions: 6100 },
  { month: 'Mar', sessions: 7400 },
  { month: 'Apr', sessions: 6900 },
  { month: 'May', sessions: 8420 },
];

const demoKeywords = [
  { keyword: 'local seo london', position: 2, change: 8, volume: 880, url: '/local-seo' },
  { keyword: 'seo agency london', position: 4, change: 3, volume: 1600, url: '/services/seo' },
  { keyword: 'digital marketing uk', position: 7, change: -1, volume: 2400, url: '/about' },
  { keyword: 'best seo company uk', position: 9, change: 2, volume: 1800, url: '/about-us' },
  { keyword: 'google ranking service', position: 15, change: 0, volume: 1200, url: '/services' },
  { keyword: 'technical seo audit', position: 22, change: -3, volume: 640, url: '/audit' },
  { keyword: 'ecommerce seo agency', position: 28, change: 8, volume: 1600, url: '/ecommerce' },
  { keyword: 'content marketing seo', position: 34, change: 1, volume: 2100, url: '/content' },
];

interface Report {
  id: string;
  period: string;
  generatedDate: string;
  healthScore: number;
  sessions: string;
  top10: string;
  wins: string[];
}

const demoReports: Report[] = [
  {
    id: 'r1',
    period: 'May 2026',
    generatedDate: 'Jun 1, 2026',
    healthScore: 76,
    sessions: '8,420',
    top10: '47',
    wins: [
      '🏆 "local seo london" climbed from position 10 → position 2 (+8 places)',
      '📈 Organic traffic increased by 16.3% month-over-month',
      '🔗 3 new high-authority backlinks acquired (Forbes, Moz, TechRadar)'
    ]
  },
  {
    id: 'r2',
    period: 'April 2026',
    generatedDate: 'May 1, 2026',
    healthScore: 68,
    sessions: '7,240',
    top10: '43',
    wins: [
      '🏆 "seo agency london" entered the top 5 positions',
      '📈 Page speed optimizations led to 12% lower bounce rate'
    ]
  },
  {
    id: 'r3',
    period: 'March 2026',
    generatedDate: 'Apr 1, 2026',
    healthScore: 62,
    sessions: '6,100',
    top10: '39',
    wins: [
      '🏆 Gained google snippet for "seo consultant london"',
      '📈 Organic impressions grew by 25% overall'
    ]
  },
  {
    id: 'r4',
    period: 'February 2026',
    generatedDate: 'Mar 1, 2026',
    healthScore: 58,
    sessions: '5,200',
    top10: '35',
    wins: [
      '🏆 Initial optimization for target landing pages completed',
      '📈 First batch of 5 articles published and indexed'
    ]
  }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A2E', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(79,142,247,0.3)' }}>
      <div style={{ fontSize: 11, color: '#9aa0b4', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, color: p.color ?? THEME.primary, fontWeight: 700 }}>
          {p.name}: {p.value?.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

export default function ClientDashboardPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'profile'>('dashboard');
  
  /* --- Selected report view (Screen 03) --- */
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  /* --- Download PDF Modal (Screen 04) --- */
  const [downloadModalReport, setDownloadModalReport] = useState<Report | null>(null);

  /* --- Contact modal --- */
  const [showContact, setShowContact] = useState(false);
  const [contactSubject, setContactSubject] = useState('Question about my rankings');
  const [contactMessage, setContactMessage] = useState('');
  const [sendingContact, setSendingContact] = useState(false);

  /* --- Profile States (Screen 05) --- */
  const [profileName, setProfileName] = useState({ first: 'Sarah', last: 'Clarke' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [notifyReportReady, setNotifyReportReady] = useState(true);

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile details updated successfully!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password updated successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSendingContact(true);
    setTimeout(() => {
      setSendingContact(false);
      toast.success('Message sent! Digital Horizons will respond within 1 business day.');
      setContactMessage('');
      setShowContact(false);
    }, 1200);
  };

  const triggerDownloadPDF = (report: Report) => {
    toast.loading('Generating branded PDF report...');
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Downloaded ${report.period} report successfully!`);
      setDownloadModalReport(null);
    }, 2000);
  };

  /* --- Render interactive report detail view (Screen 03) --- */
  if (selectedReport) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F5F7', fontFamily: 'system-ui, sans-serif', color: THEME.textDark }}>
        {/* Report Header (Branded) */}
        <div style={{ background: THEME.primary, color: '#fff', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>DH</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Digital Horizons Agency</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>Client Portal · Acme Corp</div>
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Monthly SEO Report</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Acme Corp</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>acmecorp.com · {selectedReport.period}</div>
          </div>
        </div>

        {/* Action bar */}
        <div style={{ background: '#dde1e8', padding: '10px 32px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            onClick={() => setSelectedReport(null)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: THEME.primary, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Back to Dashboard
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              onClick={() => setDownloadModalReport(selectedReport)}
              style={{ padding: '6px 14px', borderRadius: 6, background: '#fff', border: `1px solid ${THEME.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: THEME.textLight, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={13} /> Download PDF
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Shareable link copied to clipboard!');
              }}
              style={{ padding: '6px 14px', borderRadius: 6, background: 'transparent', border: `1px solid ${THEME.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: THEME.textLight, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              🔗 Share Link
            </button>
          </div>
        </div>

        <div style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section 1: Executive Summary */}
          <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: THEME.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, paddingBottom: 6, borderBottom: '2px solid #dde1e8' }}>
              1. Executive Summary
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
              <div style={{ border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Organic Sessions</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textDark }}>{selectedReport.sessions}</div>
                <div style={{ fontSize: 11, color: THEME.success, fontWeight: 600, marginTop: 4 }}>↑ +16.3%</div>
              </div>
              <div style={{ border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Top 10 Keywords</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textDark }}>{selectedReport.top10}</div>
                <div style={{ fontSize: 11, color: THEME.success, fontWeight: 600, marginTop: 4 }}>↑ +4</div>
              </div>
              <div style={{ border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Domain Trust</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textDark }}>42</div>
                <div style={{ fontSize: 11, color: THEME.success, fontWeight: 600, marginTop: 4 }}>↑ +2 pts</div>
              </div>
              <div style={{ border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Site Health</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textDark }}>{selectedReport.healthScore}%</div>
                <div style={{ fontSize: 11, color: THEME.success, fontWeight: 600, marginTop: 4 }}>↑ +8 pts</div>
              </div>
            </div>

            <div style={{ background: '#dde1e8', borderRadius: 8, padding: 16, fontSize: 12, color: THEME.textDark }}>
              <strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>🏆 This Month's Wins:</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedReport.wins.map((win, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{win}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Keyword Rankings */}
          <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: THEME.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, paddingBottom: 6, borderBottom: '2px solid #dde1e8' }}>
              2. Keyword Rankings
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '16px 0', borderRight: `1px solid ${THEME.border}` }}>
                {/* Custom circular progress gauge */}
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: `conic-gradient(${THEME.primary} 0% ${selectedReport.healthScore}%, #dde1e8 ${selectedReport.healthScore}% 100%)`,
                  margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ width: 66, height: 66, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: THEME.textDark }}>{selectedReport.top10}</div>
                    <div style={{ fontSize: 8, color: THEME.textMuted, textTransform: 'uppercase' }}>Top 10</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: THEME.success, fontWeight: 600 }}>↑ +4 vs last month</div>
              </div>

              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#dde1e8' }}>
                      <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: THEME.textLight, textAlign: 'left' }}>Keyword</th>
                      <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: THEME.textLight, textAlign: 'left' }}>Position</th>
                      <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: THEME.textLight, textAlign: 'left' }}>Change</th>
                      <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: THEME.textLight, textAlign: 'left' }}>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoKeywords.slice(0, 3).map((kw, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #dde1e8' }}>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: THEME.textDark, fontWeight: 600 }}>{kw.keyword}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12 }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: THEME.bgLight, color: THEME.primary }}>
                            {kw.position}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: kw.change > 0 ? THEME.success : THEME.danger, fontWeight: 600 }}>
                          {kw.change > 0 ? `▲ +${kw.change}` : `▼ ${kw.change}`}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: THEME.textLight }}>{kw.volume.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 3: AI Recommendations */}
          <div style={{ background: '#F8FAFC', border: `1px solid ${THEME.border}`, borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: THEME.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, paddingBottom: 6, borderBottom: '2px solid #dde1e8' }}>
              3. AI-Powered Recommendations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
              <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 6, padding: 14, borderLeft: `4px solid ${THEME.primary}` }}>
                <strong>1. Fix broken internal links</strong> — 3 critical broken links found. Fix `/blog/post-14` and `/resources/guide-2` this week to recover crawl budget.
              </div>
              <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 6, padding: 14, borderLeft: `4px solid ${THEME.success}` }}>
                <strong>2. Target "ppc agency london" (Pos. 11)</strong> — 1 more position push would enter the top 10. Add 2–3 internal links from blog posts to `/ppc` page.
              </div>
              <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 6, padding: 14, borderLeft: `4px solid #7090c0` }}>
                <strong>3. Write 8 missing meta descriptions</strong> — 8 blog pages lack meta descriptions, reducing click-through rate in search results.
              </div>
            </div>
          </div>
        </div>

        {/* PDF Confirmation Modal inside detail */}
        {downloadModalReport && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
            <div style={{ background: '#fff', border: `2px solid rgba(79,142,247,0.3)`, borderRadius: 12, padding: 24, width: '100%', maxWidth: 460, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, background: THEME.bgLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📄</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: THEME.textDark }}>Download Report PDF</div>
                  <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>Your branded SEO report will download as a PDF file</div>
                </div>
              </div>
              <div style={{ background: '#dde1e8', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 11 }}>
                  <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: THEME.textLight, marginBottom: 2 }}>Client</div><strong>Acme Corp</strong></div>
                  <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: THEME.textLight, marginBottom: 2 }}>Report Period</div><strong>{downloadModalReport.period}</strong></div>
                  <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: THEME.textLight, marginBottom: 2 }}>Sections</div><strong>7 sections</strong></div>
                  <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: THEME.textLight, marginBottom: 2 }}>Estimated Size</div><strong>~4.2 MB</strong></div>
                </div>
              </div>
              <div style={{ background: THEME.bgLight, border: `1px solid rgba(79,142,247,0.3)`, borderRadius: 6, padding: '10px 12px', fontSize: 10, color: THEME.primary, marginBottom: 16 }}>
                ℹ️ This PDF is branded by <strong>Digital Horizons</strong>. Do not distribute externally without permission.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: `1px solid ${THEME.border}`, paddingTop: 14 }}>
                <button 
                  onClick={() => setDownloadModalReport(null)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${THEME.border}`, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: THEME.textLight }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => triggerDownloadPDF(downloadModalReport)}
                  style={{ padding: '8px 18px', borderRadius: 8, background: THEME.primary, color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                >
                  ⬇ Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F5F7', fontFamily: 'system-ui, sans-serif', color: THEME.textDark }}>
      {/* ── Contact Modal (Direct Form overlay) ── */}
      {showContact && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 32px 64px rgba(26,26,46,0.25)', border: `1px solid ${THEME.border}` }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: THEME.textDark }}>Message Your Agency</div>
                <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>Digital Horizons will respond within 1 business day</div>
              </div>
              <button onClick={() => setShowContact(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: THEME.textMuted, display: 'flex' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSendContact}>
              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: THEME.textDark, marginBottom: 6 }}>Subject</label>
                  <select 
                    value={contactSubject} 
                    onChange={e => setContactSubject(e.target.value)} 
                    style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${THEME.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: THEME.textDark, outline: 'none', background: '#F8FAFC', boxSizing: 'border-box' }}
                  >
                    <option>Question about my rankings</option>
                    <option>Report clarification</option>
                    <option>Request for strategy review</option>
                    <option>Billing query</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: THEME.textDark, marginBottom: 6 }}>Message</label>
                  <textarea 
                    value={contactMessage} 
                    onChange={e => setContactMessage(e.target.value)} 
                    required 
                    rows={4} 
                    style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${THEME.border}`, borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: THEME.textDark, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} 
                    placeholder="Type your message here…" 
                  />
                </div>
              </div>
              <div style={{ padding: '14px 24px', borderTop: `1px solid ${THEME.border}`, display: 'flex', gap: 10, justifyContent: 'flex-end', background: '#F8FAFC', borderRadius: '0 0 16px 16px' }}>
                <button type="button" onClick={() => setShowContact(false)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${THEME.border}`, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: THEME.textLight }}>Cancel</button>
                <button type="submit" disabled={sendingContact} style={{ padding: '8px 18px', borderRadius: 8, background: THEME.primary, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Send size={13} /> {sendingContact ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Branded Header ── */}
      <header style={{
        background: THEME.primary, padding: '0 28px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>DH</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Digital Horizons</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 1 }}>Acme Corp — SEO Reports</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>SC</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>{profileName.first} {profileName.last}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>client@acme.com</div>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })} 
            style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.15)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Client Navigation Tabs (Screen 02 style) ── */}
      <div style={{ background: THEME.primaryHover, display: 'flex', gap: 2, padding: '0 32px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          style={{ padding: '12px 18px', fontSize: 12, color: activeTab === 'dashboard' ? '#fff' : 'rgba(255,255,255,0.7)', background: activeTab === 'dashboard' ? 'rgba(0,0,0,0.15)' : 'transparent', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'dashboard' ? '3px solid #fff' : '3px solid transparent', fontWeight: activeTab === 'dashboard' ? '750' : '500', transition: 'all 0.2s' }}
        >
          📊 Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('reports')} 
          style={{ padding: '12px 18px', fontSize: 12, color: activeTab === 'reports' ? '#fff' : 'rgba(255,255,255,0.7)', background: activeTab === 'reports' ? 'rgba(0,0,0,0.15)' : 'transparent', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'reports' ? '3px solid #fff' : '3px solid transparent', fontWeight: activeTab === 'reports' ? '750' : '500', transition: 'all 0.2s' }}
        >
          📄 My Reports
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          style={{ padding: '12px 18px', fontSize: 12, color: activeTab === 'profile' ? '#fff' : 'rgba(255,255,255,0.7)', background: activeTab === 'profile' ? 'rgba(0,0,0,0.15)' : 'transparent', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'profile' ? '3px solid #fff' : '3px solid transparent', fontWeight: activeTab === 'profile' ? '750' : '500', transition: 'all 0.2s' }}
        >
          👤 Profile
        </button>
      </div>

      <div style={{ padding: '28px', maxWidth: 1000, margin: '0 auto' }}>
        {/* ═══ 1. DASHBOARD TAB ═══ */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header info */}
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.textDark }}>Welcome back, {profileName.first} 👋</div>
              <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>Acme Corp · acmecorp.com · Latest data: May 2026</div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Organic Sessions</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textDark }}>8,420</div>
                <div style={{ fontSize: 10, color: THEME.success, fontWeight: 600, marginTop: 4 }}>↑ +16.3% vs Apr</div>
              </div>
              <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Top 10 Keywords</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textDark }}>47</div>
                <div style={{ fontSize: 10, color: THEME.success, fontWeight: 600, marginTop: 4 }}>↑ +4 keywords</div>
              </div>
              <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Domain Trust</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textDark }}>42</div>
                <div style={{ fontSize: 10, color: THEME.success, fontWeight: 600, marginTop: 4 }}>↑ +2 pts</div>
              </div>
              <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Site Health</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textDark }}>76%</div>
                <div style={{ fontSize: 10, color: THEME.success, fontWeight: 600, marginTop: 4 }}>↑ +8 pts</div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Latest Report card */}
              <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 750, color: THEME.textDark, marginBottom: 12 }}>📄 Latest Report</div>
                  <div style={{ background: '#dde1e8', borderRadius: 8, padding: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textDark }}>SEO Report — May 2026</div>
                    <div style={{ fontSize: 10, color: THEME.textLight, marginTop: 3 }}>Generated: Jun 1, 2026 · 7 sections</div>
                    <div style={{ fontSize: 10, color: THEME.success, fontWeight: 650, marginTop: 5 }}>✓ 3 major wins this month</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => setSelectedReport(demoReports[0])}
                    style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, background: THEME.primary, color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700, textAlign: 'center' }}
                  >
                    View Full Report
                  </button>
                  <button 
                    onClick={() => setDownloadModalReport(demoReports[0])}
                    style={{ padding: '8px 12px', border: `1px solid ${THEME.border}`, borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: THEME.textLight }}
                  >
                    ⬇ PDF
                  </button>
                </div>
              </div>

              {/* Traffic Trend Chart */}
              <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 12, fontWeight: 750, color: THEME.textDark }}>Traffic Trend (6 months)</div>
                <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 2, marginBottom: 12 }}>Your organic sessions over time</div>
                
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={trafficData6Months} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: THEME.textLight }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: THEME.textLight }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sessions" fill={THEME.primary} radius={[3, 3, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* My Report History Table */}
            <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${THEME.border}`, fontWeight: 700, fontSize: 13, color: THEME.textDark }}>
                My Report History
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#dde1e8' }}>
                    <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: THEME.textLight, textAlign: 'left' }}>Period</th>
                    <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: THEME.textLight, textAlign: 'left' }}>Generated</th>
                    <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: THEME.textLight, textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 600, color: THEME.textLight, textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demoReports.map((report) => (
                    <tr key={report.id} style={{ borderBottom: '1px solid #dde1e8' }}>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: THEME.textDark, fontWeight: 700 }}>{report.period}</td>
                      <td style={{ padding: '10px 12px', fontSize: 11, color: THEME.textLight }}>{report.generatedDate}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 9, fontWeight: 600, background: THEME.successBg, color: THEME.success }}>
                          Ready
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            onClick={() => setSelectedReport(report)}
                            style={{ padding: '4px 8px', borderRadius: 4, background: '#fff', border: `1px solid ${THEME.border}`, cursor: 'pointer', fontSize: 10, fontWeight: 600, color: THEME.textLight }}
                          >
                            👁 View
                          </button>
                          <button 
                            onClick={() => setDownloadModalReport(report)}
                            style={{ padding: '4px 8px', borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: THEME.primary }}
                          >
                            ⬇ PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Read-Only Footer Note */}
            <div style={{ fontSize: 11, color: THEME.textMuted, background: '#dde1e8', padding: '10px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔒 This portal is read-only. To update account settings or contact your SEO manager, email reports@digitalhorizons.com</span>
              <button 
                onClick={() => {
                  setContactSubject('General Query');
                  setShowContact(true);
                }}
                style={{ background: 'none', border: 'none', color: THEME.primary, fontWeight: 700, cursor: 'pointer', fontSize: 11 }}
              >
                Contact Manager →
              </button>
            </div>
          </div>
        )}

        {/* ═══ 2. MY REPORTS TAB ═══ */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: THEME.textDark, margin: 0 }}>My Reports</h1>
              <p style={{ fontSize: 12, color: THEME.textMuted, margin: '4px 0 0' }}>SEO performance reports delivered by your agency</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
              {demoReports.map((report) => (
                <div key={report.id} style={{ background: 'white', border: `1px solid ${THEME.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {/* Top header block */}
                  <div style={{ background: `linear-gradient(135deg, ${THEME.primary}, #904e0a)`, padding: '20px 16px', color: '#fff' }}>
                    <div style={{ fontSize: 9, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>SEO Performance Report</div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{report.period}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Acme Corp · acmecorp.com</div>
                  </div>
                  {/* Summary block */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: `1px solid ${THEME.border}` }}>
                    <div style={{ padding: '12px 6px', textAlign: 'center', borderRight: `1px solid ${THEME.border}` }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: THEME.textDark }}>{report.healthScore}%</div>
                      <div style={{ fontSize: 8, color: THEME.textMuted, textTransform: 'uppercase', marginTop: 2 }}>Health</div>
                    </div>
                    <div style={{ padding: '12px 6px', textAlign: 'center', borderRight: `1px solid ${THEME.border}` }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: THEME.textDark }}>{report.sessions}</div>
                      <div style={{ fontSize: 8, color: THEME.textMuted, textTransform: 'uppercase', marginTop: 2 }}>Sessions</div>
                    </div>
                    <div style={{ padding: '12px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: THEME.textDark }}>{report.top10}</div>
                      <div style={{ fontSize: 8, color: THEME.textMuted, textTransform: 'uppercase', marginTop: 2 }}>Top-10</div>
                    </div>
                  </div>
                  {/* Footer actions */}
                  <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
                    <div style={{ fontSize: 10, color: THEME.textMuted }}>{report.generatedDate}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        onClick={() => setSelectedReport(report)}
                        style={{ padding: '5px 10px', borderRadius: 6, background: THEME.bgLight, color: THEME.primary, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                      >
                        View
                      </button>
                      <button 
                        onClick={() => setDownloadModalReport(report)}
                        style={{ padding: '5px 10px', borderRadius: 6, background: THEME.primary, color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 3. PROFILE TAB ═══ */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: THEME.textDark, margin: 0 }}>Account Settings</h1>
            </div>

            {/* Profile Info */}
            <form onSubmit={handleUpdateName} style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textDark, marginBottom: 4 }}>Profile Information</div>
              <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 16 }}>Your contact details as set by your account manager.</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: THEME.textDark, marginBottom: 4 }}>First Name</label>
                  <input 
                    type="text" 
                    value={profileName.first} 
                    onChange={e => setProfileName(prev => ({ ...prev, first: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 12, background: '#fff', color: THEME.textDark, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: THEME.textDark, marginBottom: 4 }}>Last Name</label>
                  <input 
                    type="text" 
                    value={profileName.last} 
                    onChange={e => setProfileName(prev => ({ ...prev, last: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 12, background: '#fff', color: THEME.textDark, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: THEME.textDark, marginBottom: 4 }}>Email Address</label>
                <div style={{ width: '100%', padding: '8px 12px', border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 12, background: '#f0f0f0', color: THEME.textMuted, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>client@acme.com</span>
                  <span style={{ fontSize: 9 }}>(Cannot be changed)</span>
                </div>
                <div style={{ fontSize: 9, color: THEME.textMuted, marginTop: 4 }}>Contact your account manager to update email address.</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={{ padding: '6px 14px', borderRadius: 6, background: THEME.primary, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                  Update Name
                </button>
              </div>
            </form>

            {/* Change Password */}
            <form onSubmit={handleUpdatePassword} style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textDark, marginBottom: 4 }}>Change Password</div>
              <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 16 }}>For security, use a unique password at least 8 characters long.</div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: THEME.textDark, marginBottom: 4 }}>Current Password</label>
                <input 
                  type="password" 
                  value={passwords.current}
                  onChange={e => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 12, background: '#fff', color: THEME.textDark, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: THEME.textDark, marginBottom: 4 }}>New Password</label>
                <input 
                  type="password" 
                  value={passwords.new}
                  onChange={e => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 12, background: '#fff', color: THEME.textDark, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: THEME.textDark, marginBottom: 4 }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwords.confirm}
                  onChange={e => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${THEME.border}`, borderRadius: 6, fontSize: 12, background: '#fff', color: THEME.textDark, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={{ padding: '6px 14px', borderRadius: 6, background: THEME.primary, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                  Update Password
                </button>
              </div>
            </form>

            {/* Notifications */}
            <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textDark, marginBottom: 4 }}>Notification Preferences</div>
              <div style={{ display: 'flex', justifycontent: 'space-between', padding: '8px 0', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textDark }}>Email me when new report is ready</div>
                  <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 2 }}>Monthly notification when report is generated</div>
                </div>
                {/* Custom toggle button */}
                <button 
                  onClick={() => {
                    setNotifyReportReady(!notifyReportReady);
                    toast.success(`Notifications ${!notifyReportReady ? 'enabled' : 'disabled'}`);
                  }}
                  style={{
                    width: 34, height: 20, borderRadius: 10,
                    background: notifyReportReady ? THEME.primary : THEME.textMuted,
                    position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3, left: notifyReportReady ? 17 : 3, transition: 'left 0.2s'
                  }} />
                </button>
              </div>
            </div>

            {/* Logout button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ padding: '8px 18px', borderRadius: 8, background: 'transparent', border: `1px solid ${THEME.danger}`, color: THEME.danger, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PDF Confirmation Modal for Dashboard / My Reports tab views */}
      {downloadModalReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
          <div style={{ background: '#fff', border: `2px solid rgba(79,142,247,0.3)`, borderRadius: 12, padding: 24, width: '100%', maxWidth: 460, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, background: THEME.bgLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📄</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: THEME.textDark }}>Download Report PDF</div>
                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>Your branded SEO report will download as a PDF file</div>
              </div>
            </div>
            <div style={{ background: '#dde1e8', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 11 }}>
                <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: THEME.textLight, marginBottom: 2 }}>Client</div><strong>Acme Corp</strong></div>
                <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: THEME.textLight, marginBottom: 2 }}>Report Period</div><strong>{downloadModalReport.period}</strong></div>
                <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: THEME.textLight, marginBottom: 2 }}>Sections</div><strong>7 sections</strong></div>
                <div><div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: THEME.textLight, marginBottom: 2 }}>Estimated Size</div><strong>~4.2 MB</strong></div>
              </div>
            </div>
            <div style={{ background: THEME.bgLight, border: `1px solid rgba(79,142,247,0.3)`, borderRadius: 6, padding: '10px 12px', fontSize: 10, color: THEME.primary, marginBottom: 16 }}>
              ℹ️ This PDF is branded by <strong>Digital Horizons</strong>. Do not distribute externally without permission.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: `1px solid ${THEME.border}`, paddingTop: 14 }}>
              <button 
                onClick={() => setDownloadModalReport(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${THEME.border}`, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: THEME.textLight }}
              >
                Cancel
              </button>
              <button 
                onClick={() => triggerDownloadPDF(downloadModalReport)}
                style={{ padding: '8px 18px', borderRadius: 8, background: THEME.primary, color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
              >
                ⬇ Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
