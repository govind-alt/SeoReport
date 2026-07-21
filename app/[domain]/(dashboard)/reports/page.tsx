'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FileText, Plus, Eye, Download, RefreshCw, X,
  CheckCircle2, Clock, AlertCircle, Zap, Users,
  Calendar, TrendingUp, BarChart2, Send, Search,
  ChevronRight, ExternalLink
} from 'lucide-react';

/* ─── Types ─── */
interface Report {
  id: string;
  clientName: string;
  clientDomain: string;
  clientInitials: string;
  period: string;
  status: 'done' | 'pending' | 'failed' | 'generating';
  generatedAt: string;
  views: number;
  preview?: {
    healthScore: number;
    summary: string;
    metrics: { label: string; value: string }[];
    recommendations?: string[];
  };
}

/* ─── Demo Data ─── */
const DEMO_REPORTS: Report[] = [
  {
    id: 'acme-jun', clientName: 'Acme Corp', clientDomain: 'acme.com',
    clientInitials: 'AC', period: 'Jun 2026', status: 'done',
    generatedAt: 'Jun 20, 14:20', views: 4,
    preview: {
      healthScore: 92,
      summary: 'Excellent month for Acme Corp. Top-10 keywords grew by 18 to reach 237. Organic sessions up +24.3% to 84,200. Site health improved 6 points. All 3 critical issues from last month resolved.',
      metrics: [{ label: 'Sessions', value: '84,200' }, { label: 'Top-10 KWs', value: '237' }, { label: 'Health', value: '92%' }],
      recommendations: ['Expand blog content targeting long-tail keywords', 'Improve Core Web Vitals on product pages', 'Build 15 high-DA backlinks this month'],
    },
  },
  {
    id: 'techvision-jun', clientName: 'TechVision Inc', clientDomain: 'techvision.io',
    clientInitials: 'TV', period: 'Jun 2026', status: 'done',
    generatedAt: 'Jun 19, 09:45', views: 2,
    preview: {
      healthScore: 84,
      summary: 'Solid performance. Rankings improved across 34 keywords. Traffic up 18.2%. A few pages still need on-page optimization.',
      metrics: [{ label: 'Sessions', value: '61,000' }, { label: 'Top-10 KWs', value: '189' }, { label: 'Health', value: '84%' }],
      recommendations: ['Fix 12 broken internal links', 'Add schema markup to 8 product pages', 'Target 5 new featured snippet opportunities'],
    },
  },
  {
    id: 'growthlabs-jun', clientName: 'GrowthLabs', clientDomain: 'growthlabs.co',
    clientInitials: 'GL', period: 'Jun 2026', status: 'pending',
    generatedAt: '—', views: 0,
    preview: undefined,
  },
  {
    id: 'nexaretail-jun', clientName: 'NexaRetail', clientDomain: 'nexaretail.com',
    clientInitials: 'NR', period: 'Jun 2026', status: 'done',
    generatedAt: 'Jun 22, 16:00', views: 1,
    preview: {
      healthScore: 78,
      summary: 'Good progress on e-commerce SEO. Product page rankings improved. Traffic stable with a slight upward trend.',
      metrics: [{ label: 'Sessions', value: '53,200' }, { label: 'Top-10 KWs', value: '156' }, { label: 'Health', value: '78%' }],
      recommendations: ['Optimize product image alt text at scale', 'Improve page load speed (currently 3.8s)', 'Add customer review schema markup'],
    },
  },
  {
    id: 'bloom-may', clientName: 'BloomAgency', clientDomain: 'bloomagency.co',
    clientInitials: 'BA', period: 'May 2026', status: 'done',
    generatedAt: 'May 31, 11:15', views: 5,
    preview: {
      healthScore: 88,
      summary: 'Top performance month. High-quality backlinks acquired, technical issues resolved, and significant ranking improvements across target keywords.',
      metrics: [{ label: 'Sessions', value: '71,400' }, { label: 'Top-10 KWs', value: '211' }, { label: 'Health', value: '88%' }],
      recommendations: ['Continue link building campaign', 'Launch content cluster for new service line'],
    },
  },
  {
    id: 'healthplus-jun', clientName: 'HealthPlus', clientDomain: 'healthplus.io',
    clientInitials: 'HP', period: 'Jun 2026', status: 'failed',
    generatedAt: 'Jun 18, 08:30', views: 0,
    preview: undefined,
  },
];

/* ─── Generate Report Modal ─── */
function GenerateModal({ open, onClose, onGenerate }: { open: boolean; onClose: () => void; onGenerate: (client: string, period: string) => void }) {
  const [client, setClient] = useState('');
  const [period, setPeriod] = useState('Jun 2026');
  const clients = ['Acme Corp', 'TechVision Inc', 'GrowthLabs', 'NexaRetail', 'BloomAgency', 'HealthPlus'];

  if (!open) return null;
  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Generate Report</div>
            <div className="modal-subtitle">Create a new SEO performance report</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Client <span className="required">*</span></label>
            <select className="form-input" value={client} onChange={e => setClient(e.target.value)}>
              <option value="">Select a client…</option>
              {clients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Reporting Period</label>
            <select className="form-input" value={period} onChange={e => setPeriod(e.target.value)}>
              {['Jun 2026', 'May 2026', 'Apr 2026', 'Q2 2026', 'Q1 2026'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!client} onClick={() => { onGenerate(client, period); onClose(); }}>
            <Zap size={14} /> Generate Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
const StatusBadge = ({ status }: { status: Report['status'] }) => {
  const map = {
    done:       { label: 'Delivered',   color: '#059669', bg: '#ECFDF5', icon: <CheckCircle2 size={11} /> },
    pending:    { label: 'Pending',     color: '#D97706', bg: '#FFFBEB', icon: <Clock size={11} /> },
    failed:     { label: 'Failed',      color: '#DC2626', bg: '#FEF2F2', icon: <AlertCircle size={11} /> },
    generating: { label: 'Generating…', color: '#4F8EF7', bg: '#EBF2FF', icon: <RefreshCw size={11} className="spinner" /> },
  };
  const s = map[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color,
    }}>
      {s.icon} {s.label}
    </span>
  );
};

/* ─── Stat Ring ─── */
const ScoreRing = ({ score }: { score: number }) => {
  const r = 22; const c = 2 * Math.PI * r;
  const fill = (score / 100) * c;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ position: 'relative', width: 52, height: 52, margin: '0 auto 12px' }}>
      <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="26" cy="26" r={r} fill="none" stroke="#E4E9F2" strokeWidth="5" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${fill} ${c}`} strokeLinecap="round" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, color,
      }}>{score}</div>
    </div>
  );
};

/* ─── Main Page ─── */
export default function ReportsPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain ?? 'localhost';
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedId, setSelectedId] = useState('acme-jun');
  const [showGenerate, setShowGenerate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Report['status']>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const rawDbReports = Array.isArray(data) ? data : [];
        const dbReports: Report[] = rawDbReports.map((dbRep: any) => {
          const clientName = dbRep.client?.name ?? 'Unknown Client';
          const date = dbRep.periodStart ? new Date(dbRep.periodStart) : new Date();
          const periodStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          return {
            id: dbRep.id,
            clientName,
            clientDomain: dbRep.client?.domain ?? '',
            clientInitials: clientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
            period: periodStr,
            status: dbRep.status === 'draft' ? 'pending' : dbRep.status,
            generatedAt: dbRep.generatedAt ? new Date(dbRep.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
            views: dbRep.viewCount ?? 0,
            preview: dbRep.status === 'done' ? {
              healthScore: 82,
              summary: 'Report generated successfully.',
              metrics: [{ label: 'Sessions', value: 'N/A' }, { label: 'Top-10 KWs', value: 'N/A' }, { label: 'Health', value: '82%' }]
            } : undefined
          };
        });
        const merged = [...dbReports, ...DEMO_REPORTS];
        setReports(merged);
        if (merged.length > 0) {
          setSelectedId(merged[0].id);
        }
      })
      .catch(() => setReports(DEMO_REPORTS))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = (client: string, period: string) => {
    const id = `${client.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const newReport: Report = {
      id, clientName: client, clientDomain: `${client.toLowerCase().replace(/\s+/g, '')}.com`,
      clientInitials: client.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      period, status: 'generating', generatedAt: '—', views: 0,
    };
    setReports(prev => [newReport, ...prev]);
    toast.loading(`Generating ${client} report…`);
    setTimeout(() => {
      setReports(prev => prev.map(r => r.id === id ? {
        ...r, status: 'done', generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        preview: { healthScore: 82, summary: 'Report generated successfully.', metrics: [{ label: 'Sessions', value: 'N/A' }, { label: 'Top-10 KWs', value: 'N/A' }, { label: 'Health', value: '82%' }] },
      } : r));
      toast.success(`${client} report ready!`);
    }, 3000);
  };

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.clientName.toLowerCase().includes(q) || r.period.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const selected = reports.find(r => r.id === selectedId);
  const doneCount = reports.filter(r => r.status === 'done').length;
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const failedCount = reports.filter(r => r.status === 'failed').length;

  // Eye: open preview in new tab
  const viewReport = (id: string) => {
    window.open(`/reports/render/${id}`, '_blank');
  };

  // Download: open print-ready page (auto-triggers window.print)
  const downloadPdf = (id: string) => {
    window.open(`/reports/render/${id}`, '_blank');
  };

  // Share: generate shareSlug via API, copy public link to clipboard
  const shareReport = async (id: string) => {
    // Demo reports don't have a DB row — build a fake shareable link
    const isDemoId = !id.match(/^c[a-z0-9]{24}$/);
    if (isDemoId) {
      const link = `${window.location.origin}/reports/render/${id}`;
      await navigator.clipboard.writeText(link).catch(() => {});
      toast.success('Preview link copied! (Demo report)');
      return;
    }
    try {
      toast.loading('Generating share link…', { id: 'share' });
      const res = await fetch(`/api/reports/${id}/share`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const { shareSlug } = await res.json();
      const shareUrl = `${window.location.origin}/report/${shareSlug}`;
      await navigator.clipboard.writeText(shareUrl).catch(() => {});
      toast.success('Share link copied to clipboard!', { id: 'share' });
    } catch {
      toast.error('Failed to generate share link', { id: 'share' });
    }
  };

  return (
    <>
      <GenerateModal open={showGenerate} onClose={() => setShowGenerate(false)} onGenerate={handleGenerate} />

      <div className="page-content">
        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Reports</h1>
            <p className="page-subtitle">Manage and deliver SEO performance reports to your clients</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => {
              const ids = filtered.filter(r => r.status === 'pending').map(r => r.id);
              if (!ids.length) { toast.info('No pending reports to generate'); return; }
              toast.loading(`Queuing ${ids.length} reports…`);
              ids.forEach((id, i) => setTimeout(() => {
                setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'generating' } : r));
                setTimeout(() => setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'done', generatedAt: 'Just now' } : r)), 2000);
                toast.success(`Report ${i + 1}/${ids.length} done!`);
              }, 800 * i));
            }}>
              <Zap size={14} /> Bulk Generate
            </button>
            <button id="generate-report-btn" className="btn btn-primary" onClick={() => setShowGenerate(true)}>
              <Plus size={15} /> New Report
            </button>
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Reports', value: reports.length, icon: <FileText size={17} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
            { label: 'Delivered', value: doneCount, icon: <CheckCircle2 size={17} />, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Pending', value: pendingCount, icon: <Clock size={17} />, color: '#D97706', bg: '#FFFBEB' },
            { label: 'Failed', value: failedCount, icon: <AlertCircle size={17} />, color: '#DC2626', bg: '#FEF2F2' },
          ].map((k, i) => (
            <div key={i} style={{
              background: 'white', border: '1px solid var(--border)', borderRadius: 12,
              padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {k.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Split Layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
          {/* ── Left: Reports Table ── */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 32, fontSize: 12 }} placeholder="Search reports…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['all', 'done', 'pending', 'failed'] as const).map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1.5px solid',
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: filterStatus === s ? 'var(--primary)' : 'white',
                    borderColor: filterStatus === s ? 'var(--primary)' : 'var(--border)',
                    color: filterStatus === s ? 'white' : 'var(--text-muted)',
                  }}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="spinner" style={{ margin: '0 auto 10px', display: 'block' }} />
                  Loading reports…
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><FileText size={40} style={{ color: 'var(--gray-300)' }} /></div>
                  <div className="empty-state-title">No reports found</div>
                  <div className="empty-state-desc">Generate your first report to get started.</div>
                  <button className="btn btn-primary" onClick={() => setShowGenerate(true)}><Plus size={14} /> New Report</button>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                      {['Client', 'Period', 'Status', 'Generated', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(report => (
                      <tr
                        key={report.id}
                        onClick={() => setSelectedId(report.id)}
                        style={{
                          borderBottom: '1px solid #F1F5F9', cursor: 'pointer', transition: 'background 0.12s',
                          background: selectedId === report.id ? '#EBF2FF' : 'white',
                        }}
                        onMouseEnter={e => { if (selectedId !== report.id) (e.currentTarget as HTMLTableRowElement).style.background = '#F8FAFC'; }}
                        onMouseLeave={e => { if (selectedId !== report.id) (e.currentTarget as HTMLTableRowElement).style.background = 'white'; }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                              background: report.clientInitials.charCodeAt(0) % 2 === 0 ? 'var(--primary)' : '#1A1A2E',
                              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 800,
                            }}>{report.clientInitials}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{report.clientName}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{report.clientDomain}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Calendar size={12} style={{ color: 'var(--text-muted)' }} /> {report.period}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}><StatusBadge status={report.status} /></td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{report.generatedAt}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                             <button title="Preview" onClick={e => { e.stopPropagation(); viewReport(report.id); }} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'white', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Eye size={12} />
                            </button>
                            {report.status === 'done' && (
                              <>
                                <button title="Download" onClick={e => { e.stopPropagation(); downloadPdf(report.id); }} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'white', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Download size={12} />
                                </button>
                                <button title="Share" onClick={e => { e.stopPropagation(); shareReport(report.id); }} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'white', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Send size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', background: '#F8FAFC', fontSize: 12, color: 'var(--text-muted)', borderRadius: '0 0 14px 14px' }}>
              {filtered.length} reports · {doneCount} delivered
            </div>
          </div>

          {/* ── Right: Report Preview Panel ── */}
          <div style={{ position: 'sticky', top: 24 }}>
            {selected?.preview ? (
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                {/* Cover */}
                <div style={{
                  background: 'linear-gradient(135deg, #1A1A2E 0%, #0F3460 60%, #4F8EF7 100%)',
                  padding: '24px 20px', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'radial-gradient(circle, rgba(79,142,247,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 600 }}>SEO Performance Report</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{selected.clientName}</div>
                    <div style={{ fontSize: 13, opacity: 0.7 }}>{selected.period}</div>
                    <ScoreRing score={selected.preview.healthScore} />
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Overall Health Score</div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--border)' }}>
                  {selected.preview.metrics.map((m, i) => (
                    <div key={i} style={{
                      padding: '14px 10px', textAlign: 'center',
                      borderRight: i < selected.preview!.metrics.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 8 }}>Executive Summary</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.preview.summary}</p>
                </div>

                {/* Recommendations */}
                {selected.preview.recommendations && (
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 10 }}>AI Recommendations</div>
                    {selected.preview.recommendations.map((rec, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', marginTop: 5, flexShrink: 0 }} />
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ padding: '14px 18px', display: 'flex', gap: 8, background: '#F8FAFC', borderRadius: '0 0 14px 14px' }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => downloadPdf(selected.id)}>
                    <Download size={13} /> Download PDF
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => shareReport(selected.id)}>
                    <Send size={13} /> Share
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'white', border: '1px solid var(--border)', borderRadius: 14,
                padding: '40px 24px', textAlign: 'center', boxShadow: 'var(--shadow-card)',
              }}>
                {selected?.status === 'pending' ? (
                  <>
                    <Clock size={40} style={{ color: '#F59E0B', margin: '0 auto 14px', display: 'block' }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Report Pending</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>This report hasn't been generated yet. Generate it now to see the preview.</div>
                    <button className="btn btn-primary btn-sm" onClick={() => { if (selected) handleGenerate(selected.clientName, selected.period); }}>
                      <Zap size={13} /> Generate Report
                    </button>
                  </>
                ) : selected?.status === 'failed' ? (
                  <>
                    <AlertCircle size={40} style={{ color: '#EF4444', margin: '0 auto 14px', display: 'block' }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Generation Failed</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Something went wrong. Try regenerating this report.</div>
                    <button className="btn btn-primary btn-sm" onClick={() => { if (selected) handleGenerate(selected.clientName, selected.period); }}>
                      <RefreshCw size={13} /> Retry
                    </button>
                  </>
                ) : (
                  <>
                    <FileText size={40} style={{ color: 'var(--gray-300)', margin: '0 auto 14px', display: 'block' }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Select a Report</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click any report from the list to preview it here</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
