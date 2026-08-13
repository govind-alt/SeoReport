'use client';

import { useState } from 'react';

interface PrintButtonProps {
  filename?: string;
}

export default function PrintButton({ filename }: PrintButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  const handleDownload = () => {
    setStatus('loading');

    // Build a clean human-readable filename from the page content or the prop
    let cleanName = filename;
    if (!cleanName) {
      const clientElem = document.querySelector<HTMLElement>('.cover-client-name');
      const periodElem = document.querySelector<HTMLElement>('.cover-period');
      const clientStr = clientElem?.textContent?.trim().replace(/[^a-zA-Z0-9 ]/g, '').trim() || '';
      const periodStr = periodElem?.textContent?.split('·')[0]?.trim().replace(/[^a-zA-Z0-9 ]/g, '').trim() || '';
      if (clientStr && periodStr) {
        cleanName = `${clientStr} SEO Report ${periodStr}`;
      } else if (clientStr) {
        cleanName = `${clientStr} SEO Report`;
      } else {
        cleanName = 'SEO Performance Report';
      }
    }
    // Strip trailing .pdf if present (browser adds it)
    cleanName = cleanName.replace(/\.pdf$/i, '').trim();

    // Save original title, set it to our clean filename so Chrome uses it as PDF name
    const origTitle = document.title;
    document.title = cleanName;

    // Small delay so the title change is registered, then trigger print
    setTimeout(() => {
      window.print();
      // Restore the title after the print dialog opens (200ms is enough)
      setTimeout(() => {
        document.title = origTitle;
        setStatus('idle');
      }, 500);
    }, 80);
  };

  const label =
    status === 'loading' ? '⏳ Opening Print…' : 'Download PDF';

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
