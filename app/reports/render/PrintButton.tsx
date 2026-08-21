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

    // Direct server PDF download with proper Content-Disposition and extension
    if (reportId) {
      try {
        const downloadUrl = `/api/reports/generate?id=${encodeURIComponent(reportId)}&filename=${encodeURIComponent(cleanName)}`;
        
        const res = await fetch(downloadUrl);
        if (res.ok) {
          const blob = await res.blob();
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const blobUrl = window.URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = blobUrl;
          a.download = `${cleanName}.pdf`;
          document.body.appendChild(a);
          a.click();
          
          // Do NOT revoke immediately — allow browser I/O thread ample time to write .pdf file
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
            a.remove();
          }, 45000);

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
    document.title = `${cleanName.replace(/_/g, ' ')}.pdf`;
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
      ? '✓ Downloaded PDF!'
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
