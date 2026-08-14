'use client';

import { useState } from 'react';

interface PrintButtonProps {
  reportId?: string;
  filename?: string;
}

export default function PrintButton({ reportId, filename }: PrintButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleDownload = async () => {
    setStatus('loading');

    // Build a clean human-readable filename from the page content or the prop
    let cleanName = filename;
    if (!cleanName) {
      const clientElem = document.querySelector<HTMLElement>('.cover-client-name');
      const periodElem = document.querySelector<HTMLElement>('.cover-period');
      const clientStr = clientElem?.textContent?.trim().replace(/[^a-zA-Z0-9 ]/g, '').trim() || '';
      const periodStr = periodElem?.textContent?.split('·')[0]?.trim().replace(/[^a-zA-Z0-9 ]/g, '').trim() || '';
      if (clientStr && periodStr) {
        cleanName = `${clientStr}_SEO_Report_${periodStr}`;
      } else if (clientStr) {
        cleanName = `${clientStr}_SEO_Report`;
      } else {
        cleanName = 'SEO_Performance_Report';
      }
    }
    cleanName = cleanName.replace(/\.pdf$/i, '').trim().replace(/\s+/g, '_');

    // Attempt direct server PDF stream download
    if (reportId) {
      try {
        const downloadUrl = `/api/reports/generate?id=${encodeURIComponent(reportId)}&filename=${encodeURIComponent(cleanName)}`;
        const res = await fetch(downloadUrl);
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = blobUrl;
          a.download = `${cleanName}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          a.remove();
          setStatus('success');
          setTimeout(() => setStatus('idle'), 2500);
          return;
        }
      } catch (err) {
        console.warn('Direct PDF download endpoint failed, falling back to window.print():', err);
      }
    }

    // Direct client fallback
    const origTitle = document.title;
    document.title = cleanName.replace(/_/g, ' ');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = origTitle;
        setStatus('idle');
      }, 600);
    }, 100);
  };

  const label =
    status === 'loading'
      ? '⏳ Generating PDF…'
      : status === 'success'
      ? '✓ Downloaded!'
      : 'Download PDF';

  return (
    <button
      className="btn-print"
      onClick={handleDownload}
      disabled={status === 'loading'}
      style={{
        opacity: status === 'loading' ? 0.8 : 1,
        cursor: status === 'loading' ? 'wait' : 'pointer',
        minWidth: 172,
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}
