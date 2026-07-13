'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import './reports.css';

export default function ReportsPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';
  
  const [selectedReport, setSelectedReport] = useState('acme-jun');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isErrorLogOpen, setIsErrorLogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const downloadPdf = (reportId: string) => {
    toast.info('Generating PDF... This may take a few seconds.');
    window.open(`/api/reports/generate?id=${reportId}`, '_blank');
  };

  const bulkGenerate = () => {
    setIsBulkModalOpen(false);
    toast.loading('Queuing bulk generation...');
    let count = 0;
    const clients = ['Acme Corp', 'TechStart.io', 'GreenLeaf Organics'];
    clients.forEach((c, i) => setTimeout(() => {
      count++;
      toast.success(`${c} — Report done!`);
      if (count === clients.length) setTimeout(() => toast.success('✅ All 3 reports generated!'), 600);
    }, 700 * (i + 1)));
  };

  return (
    <>
      {/* Topbar equivalent (header is usually in layout, so we just provide page content, but we might have a custom topbar in the dashboard page layout? 
          Wait, the Topbar is part of layout.tsx but the buttons are custom? 
          Actually, the Topbar in layout.tsx is global. We will just render the content below it.
          Let's just use page-header here if needed, or just let Topbar be.
      */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">Reports</div>
          <div className="page-subtitle">38 total · 6 pending</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsBulkModalOpen(true)}>⚡ Bulk Generate</button>
          <Link href={domain === 'localhost' ? '/localhost/reports/new' : '/reports/new'} className="btn btn-primary btn-sm">＋ Generate Report</Link>
        </div>
      </div>

      <div className="sync-bar">
        <span>✅ Last sync: Today at 02:14 AM · Next: Tomorrow 02:00 AM · All 24 clients up to date</span>
        <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px' }} onClick={() => toast.info('Sync queued...')}>🔄 Sync Now</button>
      </div>

      <div className="page-content">
        {/* KPI Row */}
        <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '24px' }}>
          <div className="kpi-card success">
            <div className="kpi-icon">📄</div>
            <div className="kpi-label">Reports This Month</div>
            <div className="kpi-value">18</div>
            <div className="kpi-trend trend-up">↑ +3 vs last month</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">📁</div>
            <div className="kpi-label">Total Reports</div>
            <div className="kpi-value">38</div>
            <div className="kpi-trend trend-flat">→ Across 24 clients</div>
          </div>
          <div className="kpi-card warning">
            <div className="kpi-icon">⏳</div>
            <div className="kpi-label">Pending / Overdue</div>
            <div className="kpi-value" style={{ color: 'var(--warning)' }}>6</div>
            <div className="kpi-trend" style={{ color: 'var(--warning)' }}>⚠ Action needed</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">⚡</div>
            <div className="kpi-label">Avg Gen Time</div>
            <div className="kpi-value">2.4m</div>
            <div className="kpi-trend trend-up">↑ 0.3m faster</div>
          </div>
        </div>

        {/* Main grid */}
        <div className="reports-grid">
          {/* Table */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-input-wrap">
                <span className="search-icon">🔍</span>
                <input type="text" className="form-input" placeholder="Search client or period..." style={{ paddingLeft: '34px', width: '220px', fontSize: '12px' }}/>
              </div>
              <select className="form-input" style={{ width: '150px', fontSize: '12px' }}>
                <option value="">Client: All</option>
                <option value="Acme Corp">Acme Corp</option>
                <option value="TechStart.io">TechStart.io</option>
              </select>
              <select className="form-input" style={{ width: '130px', fontSize: '12px' }}>
                <option value="">Status: All</option>
                <option value="done">✅ Completed</option>
                <option value="pending">⏳ Pending</option>
                <option value="failed">❌ Failed</option>
              </select>
              <button className="btn btn-secondary btn-sm" onClick={() => toast.info('Exporting CSV...')}>⬇ Export</button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Period</th>
                    <th>Status</th>
                    <th>Generated</th>
                    <th>Client Opened?</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={selectedReport === 'acme-jun' ? 'selected-row' : ''} style={{ cursor: 'pointer' }} onClick={() => setSelectedReport('acme-jun')}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>AC</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>Acme Corp</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>acmecorp.com</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>Jun 2026</strong> <span className="badge badge-primary" style={{ fontSize: '10px', marginLeft: '3px' }}>v2</span></td>
                    <td><span className="badge badge-success"><span className="badge-dot"></span>Done</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Jun 3, 14:20</td>
                    <td><span className="badge badge-success">👁 Viewed × 2</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedReport('acme-jun'); }}>👁 View</button>
                        <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); downloadPdf('acme-jun'); }}>📥</button>
                        <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); toast.success('Link copied!'); }}>🔗</button>
                      </div>
                    </td>
                  </tr>

                  {/* Pending Row */}
                  <tr className="overdue-row" style={{ cursor: 'default' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg,#F59E0B,#D97706)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>GL</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>GreenLeaf Organics</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>greenleaf.com</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>Jun 2026</strong></td>
                    <td><span className="badge badge-warning"><span className="badge-dot"></span>Pending</span></td>
                    <td><span className="schedule-chip">📅 Scheduled Jul 1</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary btn-sm" disabled={isGenerating === 'gl'} onClick={() => {
                          setIsGenerating('gl');
                          toast.info('Generating report...');
                          setTimeout(() => setIsGenerating(null), 2000);
                        }}>
                          {isGenerating === 'gl' ? 'Generating...' : '⚡ Generate Now'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Failed Row */}
                  <tr style={{ cursor: 'default' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg,#3B82F6,#2563EB)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>BS</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>BlueSky Marketing</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>bluesky.co.uk</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>May 2026</strong></td>
                    <td><span className="badge badge-danger"><span className="badge-dot"></span>Failed</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--danger)' }}>Failed Jun 1, 09:05</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => toast.success('Retry queued!')}>🔄 Retry</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setIsErrorLogOpen(!isErrorLogOpen)}>⚠ Error Log</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {isErrorLogOpen && (
                <div style={{ background: 'var(--danger-light)', borderTop: '1px solid #FECACA', padding: '16px 20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#7F1D1D', marginBottom: '4px' }}>⚠ Error Details — BlueSky Marketing · May 2026</div>
                  <div style={{ fontSize: '12px', color: '#991B1B', marginBottom: '8px' }}><strong>Failed at:</strong> Jun 1, 2026 09:05:32 UTC · Retry count: 3/3</div>
                  <div style={{ background: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', color: '#7F1D1D', marginBottom: '12px' }}>
                    SERankingAPIError: 429 Too Many Requests<br/>
                    at fetchKeywordPositions (/lib/seranking/client.ts:84)<br/>
                    Endpoint: GET /sites/47291/positions?range=30&page=1
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => { setIsErrorLogOpen(false); toast.success('Retry queued!'); }}>🔄 Retry Now</button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="preview-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>📄 Report Preview</div>
              <span className="badge badge-primary">{selectedReport === 'acme-jun' ? 'Acme Corp · Jun 2026' : 'Report'}</span>
            </div>

            {selectedReport === 'acme-jun' ? (
              <div className="report-preview report-preview-block">
                <div className="report-cover">
                  <div className="report-cover-agency">Digital Horizons Agency</div>
                  <div className="report-cover-title">Monthly SEO Report</div>
                  <div className="report-cover-period">Acme Corp · June 2026</div>
                  <div className="report-cover-score">
                    <div className="report-cover-score-value">76</div>
                    <div className="report-cover-score-label">HEALTH SCORE</div>
                  </div>
                </div>

                <div className="report-section">
                  <div className="report-section-title">Executive Summary</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Strong performance month.</strong> Top 10 keywords grew by 4 to reach 47. Organic sessions up <strong style={{ color: 'var(--success)' }}>+16.3%</strong> to 8,420.
                  </div>
                </div>

                <div className="report-section">
                  <div className="report-section-title">Key Metrics</div>
                  <div className="report-metrics-grid">
                    <div className="report-metric"><div className="report-metric-val" style={{ color: 'var(--success)' }}>8,420</div><div className="report-metric-label">Sessions</div></div>
                    <div className="report-metric"><div className="report-metric-val">47</div><div className="report-metric-label">Top 10 KWs</div></div>
                    <div className="report-metric"><div className="report-metric-val" style={{ color: 'var(--success)' }}>76%</div><div className="report-metric-label">Health</div></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => downloadPdf('acme-jun')}>📥 Download PDF</button>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => window.open('/reports/render/acme-jun', '_blank')}>👁 View Web Version</button>
                </div>
              </div>
            ) : (
              <div className="report-preview report-preview-block">
                <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Select a report</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isGenerateModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">Generate New Report</div>
                <div className="modal-subtitle">Create a branded SEO report for a client</div>
              </div>
              <button className="modal-close" onClick={() => setIsGenerateModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Client *</label>
                <select className="form-input" id="genClientSelect">
                  <option value="Acme Corp">Acme Corp</option>
                  <option value="TechStart.io">TechStart.io</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsGenerateModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => generateReport((document.getElementById('genClientSelect') as HTMLSelectElement).value)}>🚀 Generate</button>
            </div>
          </div>
        </div>
      )}

      {isBulkModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <div>
                <div className="modal-title">⚡ Bulk Generate</div>
                <div className="modal-subtitle">Generate reports for multiple clients</div>
              </div>
              <button className="modal-close" onClick={() => setIsBulkModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">Reports will be emailed automatically.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsBulkModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={bulkGenerate}>🚀 Generate</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
