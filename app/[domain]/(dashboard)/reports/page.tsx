'use client';

import { useState, use, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FileText, Plus, Eye, Download, RefreshCw, X,
  CheckCircle2, Clock, AlertCircle, Zap, Users,
  Calendar, TrendingUp, BarChart2, Send, Search,
  ChevronRight, ExternalLink, Trash2
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

/* ─── Score Ring ─── */
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

/* ─── Helpers ─── */
function mapDbReport(dbRep: any): Report {
  const clientName = dbRep.client?.name ?? 'Unknown Client';
  const date = dbRep.periodStart ? new Date(dbRep.periodStart) : new Date();
  const periodStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  let sections = {};
  try {
    sections = dbRep.sectionsJson ? JSON.parse(dbRep.sectionsJson) : {};
  } catch {}

  let aiMetadata: any = {};
  try {
    aiMetadata = dbRep.aiRecsJson ? JSON.parse(dbRep.aiRecsJson) : {};
  } catch {}

  const status: Report['status'] = dbRep.status === 'draft' ? 'pending' : dbRep.status;

  return {
    id: dbRep.id,
    clientName,
    clientDomain: dbRep.client?.domain ?? '',
    clientInitials: clientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
    period: periodStr,
    status,
    generatedAt: dbRep.generatedAt
      ? new Date(dbRep.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—',
    views: dbRep.viewCount ?? 0,
    preview: status === 'done' ? {
      healthScore: 82,
      summary: typeof aiMetadata === 'string' ? aiMetadata : aiMetadata?.notes || `${clientName} performance report generated successfully. View full analytics in the preview.`,
      metrics: [
        { label: 'Period', value: periodStr },
        { label: 'Sections', value: Object.values(sections).filter(Boolean).length.toString() || '8' },
        { label: 'Format', value: (aiMetadata?.format || 'Web+PDF').toUpperCase() },
      ],
      recommendations: Array.isArray(aiMetadata?.recommendations) ? aiMetadata.recommendations : [
        'Scale high-converting commercial landing pages.',
        'Optimize crawl efficiency & structured schema data.',
        'Fortify high-authority backlink profile.'
      ],
    } : undefined,
  };
}

/* ─── Generate Report Modal ─── */
function GenerateModal({ open, onClose, onGenerate }: {
  open: boolean;
  onClose: () => void;
  onGenerate: (clientId: string, clientName: string, period: string) => void;
}) {
  const [clientId, setClientId] = useState('');
  const [period, setPeriod] = useState('last-month');
  const [clients, setClients] = useState<{ id: string; name: string; domain: string }[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingClients(true);
    fetch('/api/clients')
      .then(r => r.ok ? r.json() : [])
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]))
      .finally(() => setLoadingClients(false));
  }, [open]);

  if (!open) return null;

  const selectedClient = clients.find(c => c.id === clientId);

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
            {loadingClients ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>Loading clients…</div>
            ) : clients.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>
                No clients found. <Link href="../clients/new" style={{ color: 'var(--primary)' }}>Add a client first →</Link>
              </div>
            ) : (
              <select className="form-input" value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">Select a client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.domain})</option>)}
              </select>
            )}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Reporting Period</label>
            <select className="form-input" value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="last-month">Last Month</option>
              <option value="current-month">Current Month</option>
              <option value="last-quarter">Last Quarter</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!clientId}
            onClick={() => {
              if (selectedClient) {
                onGenerate(selectedClient.id, selectedClient.name, period);
                onClose();
              }
            }}
          >
            <Zap size={14} /> Generate Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ReportsPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain ?? 'localhost';
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Report['status']>('all');
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load reports ──────────────────────────────────────────────────────────
  const loadReports = useCallback(async () => {
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) return;
      const data = await res.json();
      const mapped: Report[] = (Array.isArray(data) ? data : []).map(mapDbReport);
      setReports(mapped);
      if (mapped.length > 0 && !selectedId) {
        setSelectedId(mapped[0].id);
      }
    } catch {
      // ignore
    }
  }, [selectedId]);

  useEffect(() => {
    loadReports().finally(() => setLoading(false));
  }, []);

  // ── Poll for reports that are still 'generating' ──────────────────────────
  useEffect(() => {
    const hasGenerating = reports.some(r => r.status === 'generating');

    if (hasGenerating && !pollingRef.current) {
      pollingRef.current = setInterval(() => {
        loadReports();
      }, 3000);
    }

    if (!hasGenerating && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [reports, loadReports]);

  // ── Generate a new report ─────────────────────────────────────────────────
  const handleGenerate = async (clientId: string, clientName: string, period: string) => {
    // Calculate period dates
    const now = new Date();
    let periodStart: Date, periodEnd: Date;

    if (period === 'last-month') {
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (period === 'current-month') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      // last-quarter
      const qStart = now.getMonth() - 3;
      periodStart = new Date(now.getFullYear(), qStart, 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    const toastId = toast.loading(`Creating ${clientName} report…`);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          sections: { keywords: true, backlinks: true, audit: true, analytics: true, aiRecs: true },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create report');
      }

      const newReport = await res.json();
      const mapped = mapDbReport(newReport);
      setReports(prev => [mapped, ...prev]);
      setSelectedId(mapped.id);
      toast.success(`${clientName} report is generating…`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate report', { id: toastId });
    }
  };

  // ── Bulk generate pending reports ─────────────────────────────────────────
  const handleBulkGenerate = async () => {
    const pending = filtered.filter(r => r.status === 'pending');
    if (!pending.length) {
      toast.info('No pending reports to generate');
      return;
    }
    toast.loading(`Re-triggering ${pending.length} reports…`);
    for (const r of pending) {
      fetch(`/api/reports/${r.id}/process`, { method: 'POST' }).catch(() => {});
    }
    setReports(prev => prev.map(r =>
      pending.find(p => p.id === r.id) ? { ...r, status: 'generating' } : r
    ));
    toast.success(`${pending.length} reports queued for generation!`);
  };

  // ── Delete report ─────────────────────────────────────────────────────────
  const deleteReport = async (id: string) => {
    if (!confirm('Delete this report permanently?')) return;
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setReports(prev => prev.filter(r => r.id !== id));
      if (selectedId === id) setSelectedId(reports.find(r => r.id !== id)?.id ?? null);
      toast.success('Report deleted');
    } catch {
      toast.error('Failed to delete report');
    }
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const shareReport = async (id: string) => {
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

  const viewReport = (id: string) => window.open(`/reports/render/${id}`, '_blank');
  const downloadPdf = (id: string) => window.open(`/reports/render/${id}`, '_blank');

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

  return (
    <>
      <GenerateModal
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        onGenerate={handleGenerate}
      />

      <div className="page-content">
        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Reports</h1>
            <p className="page-subtitle">Manage and deliver SEO performance reports to your clients</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={handleBulkGenerate}>
              <Zap size={14} /> Bulk Generate
            </button>
            <Link href={`/${domain}/reports/new`} id="generate-report-btn" className="btn btn-primary">
              <Plus size={15} /> New Report
            </Link>
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
              <button title="Refresh" onClick={() => loadReports()} style={{ padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 7, background: 'white', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <RefreshCw size={13} />
              </button>
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
                  <div className="empty-state-title">{search || filterStatus !== 'all' ? 'No matching reports' : 'No reports yet'}</div>
                  <div className="empty-state-desc">
                    {search || filterStatus !== 'all' ? 'Try adjusting your search or filter.' : 'Generate your first report to get started.'}
                  </div>
                  {!search && filterStatus === 'all' && (
                    <button className="btn btn-primary" onClick={() => setShowGenerate(true)}><Plus size={14} /> New Report</button>
                  )}
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
                                <button title="Download PDF" onClick={e => { e.stopPropagation(); downloadPdf(report.id); }} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'white', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Download size={12} />
                                </button>
                                <button title="Share" onClick={e => { e.stopPropagation(); shareReport(report.id); }} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'white', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Send size={12} />
                                </button>
                              </>
                            )}
                            {report.status === 'failed' && (
                              <button title="Retry" onClick={e => { e.stopPropagation(); fetch(`/api/reports/${report.id}/process`, { method: 'POST' }); setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'generating' } : r)); toast.info('Retrying…'); }} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'white', cursor: 'pointer', color: '#F59E0B', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <RefreshCw size={12} />
                            </button>
                            )}
                            <button title="Delete" onClick={e => { e.stopPropagation(); deleteReport(report.id); }} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'white', cursor: 'pointer', color: '#EF4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Trash2 size={12} />
                            </button>
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
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 6 }}>Executive Summary</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px' }}>{selected.preview.summary}</p>

                  {selected.preview.recommendations && selected.preview.recommendations.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-muted)', marginBottom: 4 }}>AI Strategic Priorities</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {selected.preview.recommendations.slice(0, 3).map((r, i) => (
                          <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

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
                {selected?.status === 'generating' ? (
                  <>
                    <RefreshCw size={40} style={{ color: '#4F8EF7', margin: '0 auto 14px', display: 'block' }} className="spinner" />
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Generating Report…</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Fetching data from SE Ranking and compiling your report. This usually takes under a minute.</div>
                  </>
                ) : selected?.status === 'pending' ? (
                  <>
                    <Clock size={40} style={{ color: '#F59E0B', margin: '0 auto 14px', display: 'block' }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Report Pending</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>This report hasn't been generated yet.</div>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                      if (selected) {
                        fetch(`/api/reports/${selected.id}/process`, { method: 'POST' });
                        setReports(prev => prev.map(r => r.id === selected.id ? { ...r, status: 'generating' } : r));
                        toast.info('Report queued for generation!');
                      }
                    }}>
                      <Zap size={13} /> Generate Now
                    </button>
                  </>
                ) : selected?.status === 'failed' ? (
                  <>
                    <AlertCircle size={40} style={{ color: '#EF4444', margin: '0 auto 14px', display: 'block' }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Generation Failed</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Something went wrong. Try regenerating this report.</div>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                      if (selected) {
                        fetch(`/api/reports/${selected.id}/process`, { method: 'POST' });
                        setReports(prev => prev.map(r => r.id === selected.id ? { ...r, status: 'generating' } : r));
                        toast.info('Retrying report generation…');
                      }
                    }}>
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
