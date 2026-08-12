'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

async function getReport(reportId: string) {
  const res = await fetch(`/api/reports/${reportId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ domain: string; reportId: string }>;
}) {
  const { domain, reportId } = use(params);
  const basePath = domain === 'localhost' ? '/localhost' : `/${domain}`;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    getReport(reportId).then((data) => {
      setReport(data);
      setLoading(false);
    });
  }, [reportId]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/regenerate`, { method: 'POST' });
      if (res.ok) {
        toast.success('Report queued for regeneration. This may take a minute.');
        setTimeout(() => {
          getReport(reportId).then(setReport);
        }, 3000);
      } else {
        toast.error('Failed to queue report regeneration.');
      }
    } catch {
      toast.error('An error occurred.');
    } finally {
      setRegenerating(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      generated: { bg: '#d1fae5', color: '#059669', label: '✅ Generated' },
      generating: { bg: '#dbeafe', color: '#1d4ed8', label: '⏳ Generating…' },
      pending: { bg: '#fef9c3', color: '#92400e', label: '🕐 Pending' },
      failed: { bg: '#fee2e2', color: '#dc2626', label: '❌ Failed' },
    };
    const s = map[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          border: `1px solid ${s.color}30`,
        }}
      >
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px' }}>
        <div style={{ height: '32px', width: '300px', background: 'var(--bg-muted)', borderRadius: '6px', marginBottom: '24px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '200px', background: 'var(--bg-muted)', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Report Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>This report may have been deleted or the link is invalid.</p>
        <Link href={`${basePath}/reports`} className="btn btn-primary">← Back to Reports</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '960px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <Link href={`${basePath}/reports`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Reports</Link>
        <span>›</span>
        <span style={{ color: 'var(--text-primary)' }}>{report.title}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{report.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {statusBadge(report.status)}
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Client: <strong style={{ color: 'var(--text-primary)' }}>{report.clientName}</strong>
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Generated: <strong style={{ color: 'var(--text-primary)' }}>{new Date(report.createdAt || report.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          {report.pdfUrl && (
            <a
              href={report.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
            >
              📥 Download PDF
            </a>
          )}
          <a
            href={`/reports/render/${reportId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            👁 Preview
          </a>
          <button
            className="btn btn-secondary"
            onClick={handleRegenerate}
            disabled={regenerating || report.status === 'generating'}
          >
            {regenerating ? '⏳ Queuing…' : '🔄 Regenerate'}
          </button>
        </div>
      </div>

      {/* PDF Preview Embed */}
      {report.pdfUrl ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-muted)', padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>📄 PDF Report</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>— inline preview</span>
          </div>
          <iframe
            src={`${report.pdfUrl}#view=FitH`}
            style={{ width: '100%', height: '720px', border: 'none', display: 'block' }}
            title="Report PDF Preview"
          />
        </div>
      ) : report.status === 'generating' || report.status === 'pending' ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Report is being generated</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>
            The PDF is being compiled in the background. This usually takes 10–30 seconds. Refresh the page to check progress.
          </p>
          <button className="btn btn-secondary" onClick={() => getReport(reportId).then(setReport)}>
            🔄 Check Status
          </button>
        </div>
      ) : report.status === 'failed' ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', marginBottom: '24px', border: '1px solid #fee2e2' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#dc2626', marginBottom: '8px' }}>PDF Generation Failed</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>
            The PDF could not be generated. This may be due to a Puppeteer or Chrome issue. Try regenerating below.
          </p>
          <button className="btn btn-primary" onClick={handleRegenerate} disabled={regenerating}>
            {regenerating ? '⏳ Queuing…' : '🔄 Try Again'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No PDF Available</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Generate the PDF using the button above.</p>
        </div>
      )}

      {/* Web Report Link */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>🌐 Web Preview</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>View the live HTML version of this report</div>
        </div>
        <a
          href={`/reports/render/${reportId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          Open Web Report →
        </a>
      </div>
    </div>
  );
}
