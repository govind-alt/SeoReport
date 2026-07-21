'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getReports, generateReportForClient, getClients } from '@/app/actions';
import './reports.css';

type Report = {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  title: string;
  date: string;
  status: string;
  period: string;
};

type Client = {
  id: string;
  name: string;
  website: string;
  health: number | null;
  initials: string;
  color: string;
  lastReport: string;
  nextReport: string;
  status: string;
};

export default function ReportsPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const domain = resolvedParams.domain || 'localhost';

  const [reports, setReports] = useState<Report[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isErrorLogOpen, setIsErrorLogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [selectedGenClient, setSelectedGenClient] = useState('');

  const loadData = async () => {
    try {
      const [reportData, clientData] = await Promise.all([
        getReports(domain),
        getClients(domain)
      ]);
      setReports(reportData);
      if (reportData.length > 0) setSelectedReport(reportData[0]);
      setClients(clientData);
      if (clientData.length > 0) setSelectedGenClient(clientData[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  const downloadPdf = async (reportId: string) => {
    const toastId = toast.loading('Generating PDF... This may take 5-10 seconds.');
    try {
      const res = await fetch(`/api/reports/generate?id=${reportId}`);
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `SEO-Report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF. Please try again.', { id: toastId });
    }
  };

  const generateReport = async () => {
    if (!selectedGenClient) return;
    setIsGenerateModalOpen(false);
    const clientName = clients.find(c => c.id === selectedGenClient)?.name || 'Client';
    setIsGenerating(selectedGenClient);
    const toastId = toast.loading(`Generating report for ${clientName}...`);
    try {
      const result = await generateReportForClient(domain, selectedGenClient);
      setIsGenerating(null);
      toast.success(`Report for ${clientName} generated!`, { id: toastId });
      await loadData();
    } catch (e: any) {
      setIsGenerating(null);
      toast.error(e.message || 'Failed to generate report', { id: toastId });
    }
  };

  const bulkGenerate = async () => {
    setIsBulkModalOpen(false);
    const toastId = toast.loading('Generating reports for all clients...');
    try {
      for (const c of clients) {
        await generateReportForClient(domain, c.id);
        // Small delay to prevent SQLite concurrent lock collisions
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      toast.success(`✅ Generated ${clients.length} reports!`, { id: toastId });
      await loadData();
    } catch (e: any) {
      toast.error(e.message || 'Bulk generate failed', { id: toastId });
    }
  };

  const generatedCount = reports.filter(r => r.status === 'generated').length;
  const failedCount = reports.filter(r => r.status === 'failed').length;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title">Reports</div>
          <div className="page-subtitle">{reports.length} total · {generatedCount} generated</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsBulkModalOpen(true)}>⚡ Bulk Generate</button>
          <Link href={`/${domain}/reports/new`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>＋ Generate Report</Link>
        </div>
      </div>

      <div className="sync-bar">
        <span>✅ Data synced · {clients.length} clients active · {generatedCount} reports generated</span>
        <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px' }} onClick={() => toast.info('Sync queued...')}>🔄 Sync Now</button>
      </div>

      <div className="page-content">
        {/* KPI Row */}
        <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '24px' }}>
          <div className="kpi-card success">
            <div className="kpi-icon">📄</div>
            <div className="kpi-label">Total Reports</div>
            <div className="kpi-value">{reports.length}</div>
            <div className="kpi-trend trend-up">All time</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">✅</div>
            <div className="kpi-label">Generated</div>
            <div className="kpi-value">{generatedCount}</div>
            <div className="kpi-trend trend-up">Success</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">👥</div>
            <div className="kpi-label">Active Clients</div>
            <div className="kpi-value">{clients.length}</div>
            <div className="kpi-trend trend-up">Tracked</div>
          </div>
          <div className={`kpi-card ${failedCount > 0 ? 'warning' : ''}`}>
            <div className="kpi-icon">⚠️</div>
            <div className="kpi-label">Failed</div>
            <div className="kpi-value" style={{ color: failedCount > 0 ? 'var(--warning)' : 'inherit' }}>{failedCount}</div>
            <div className="kpi-trend">Need retry</div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="reports-layout">
          {/* Report List */}
          <div className="reports-list-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Report History</div>
              <span className="badge badge-primary">{reports.length} total</span>
            </div>

            {reports.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>No reports yet</div>
                <div style={{ fontSize: '13px', marginBottom: '16px' }}>Generate your first report to get started</div>
                <Link href={`/${domain}/reports/new`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>+ Generate Report</Link>
              </div>
            ) : (
              <div className="table-wrapper" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Period</th>
                      <th>Status</th>
                      <th>Generated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        style={{ cursor: 'pointer', background: selectedReport?.id === report.id ? 'var(--primary-light)' : 'transparent' }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="client-avatar" style={{ background: '#4F46E5', width: '30px', height: '30px', fontSize: '11px' }}>{report.clientInitials}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '13px' }}>{report.clientName}</div>
                            </div>
                          </div>
                        </td>
                        <td><strong>{report.period}</strong></td>
                        <td>
                          <span className={`badge ${report.status === 'generated' ? 'badge-success' : report.status === 'failed' ? 'badge-danger' : 'badge-neutral'}`}>
                            <span className="badge-dot"></span>
                            {report.status === 'generated' ? 'Ready' : report.status === 'failed' ? 'Failed' : 'Draft'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={(e) => { e.stopPropagation(); downloadPdf(report.id); }}
                            >⬇ PDF</button>
                            <Link
                              href={`/${domain}/reports/${report.id}`}
                              className="btn btn-secondary btn-sm"
                              style={{ textDecoration: 'none' }}
                              onClick={(e) => e.stopPropagation()}
                            >👁 View</Link>
                          </div>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="preview-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>📄 Report Preview</div>
              {selectedReport && <span className="badge badge-primary">{selectedReport.clientName} · {selectedReport.period}</span>}
            </div>

            {selectedReport ? (
              <div className="report-preview report-preview-block">
                <div className="report-cover">
                  <div className="report-cover-agency">Digital Horizons Agency</div>
                  <div className="report-cover-title">Monthly SEO Report</div>
                  <div className="report-cover-period">{selectedReport.clientName} · {selectedReport.period}</div>
                  <div className="report-cover-score">
                    <div className="report-cover-score-value">76</div>
                    <div className="report-cover-score-label">HEALTH SCORE</div>
                  </div>
                </div>

                <div className="report-section">
                  <div className="report-section-title">Executive Summary</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Strong performance month.</strong> Top 10 keywords improved. Organic sessions up <strong style={{ color: 'var(--success)' }}>+16.3%</strong>. Site health at 76/100.
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
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => downloadPdf(selectedReport.id)}>⬇ Download PDF</button>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => window.open(`/reports/render/${selectedReport.id}`, '_blank')}>👁 Web View</button>
                </div>
              </div>
            ) : (
              <div className="report-preview report-preview-block">
                <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Select a report</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Click a report from the list to preview it here</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      {isGenerateModalOpen && (
        <div className="modal-overlay active" style={{ display: 'flex' }} onClick={() => setIsGenerateModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
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
                <select
                  className="form-input"
                  value={selectedGenClient}
                  onChange={e => setSelectedGenClient(e.target.value)}
                >
                  {clients.length === 0 && <option value="">No clients found</option>}
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="alert alert-info" style={{ marginTop: '12px' }}>
                Report will be generated using the latest available data for this client.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsGenerateModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={generateReport} disabled={!selectedGenClient}>🚀 Generate</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Modal */}
      {isBulkModalOpen && (
        <div className="modal-overlay active" style={{ display: 'flex' }} onClick={() => setIsBulkModalOpen(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">⚡ Bulk Generate</div>
                <div className="modal-subtitle">Generate reports for all {clients.length} clients</div>
              </div>
              <button className="modal-close" onClick={() => setIsBulkModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">This will create new report records for all {clients.length} clients using demo data.</div>
              <div style={{ marginTop: '12px' }}>
                {clients.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="client-avatar" style={{ background: '#4F46E5', width: '28px', height: '28px', fontSize: '10px' }}>{c.initials}</div>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsBulkModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={bulkGenerate}>🚀 Generate All</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
