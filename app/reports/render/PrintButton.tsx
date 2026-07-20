'use client';

import { useState } from 'react';

const A4_W_MM = 210;
const A4_H_MM = 297;
const SCALE = 3; // higher scale = crisper text in PDF
const A4_W_PX = 794; // A4 at 96dpi

export default function PrintButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleDownload = async () => {
    setStatus('loading');
    const toolbar = document.getElementById('screenControls');

    try {
      await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2canvas = (window as any).html2canvas;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { jsPDF } = (window as any).jspdf;

      // Hide toolbar so it doesn't appear in PDF
      if (toolbar) toolbar.style.visibility = 'hidden';

      const origScrollY = window.scrollY;
      window.scrollTo(0, 0);
      await delay(150);

      const reportPage = document.querySelector('.report-page') as HTMLElement;
      if (!reportPage) {
        if (toolbar) toolbar.style.visibility = '';
        window.print();
        window.scrollTo(0, origScrollY);
        return;
      }

      // Force A4 width, remove decorative styles that would distort layout
      const origStyle = reportPage.getAttribute('style') || '';
      reportPage.style.cssText = `
        width: ${A4_W_PX}px !important;
        max-width: ${A4_W_PX}px !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 auto !important;
        overflow: visible !important;
      `;
      await delay(200);

      // Measure section bottom edges for smart page breaks
      const sections = Array.from(
        reportPage.querySelectorAll('.cover, .report-section, .report-footer')
      ) as HTMLElement[];
      const pageTopPx = reportPage.getBoundingClientRect().top + window.scrollY;

      // Render full report to a single canvas at 3× scale for crisp text
      const fullCanvas = await html2canvas(reportPage, {
        scale: SCALE,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: A4_W_PX,
        height: reportPage.scrollHeight,
        windowWidth: A4_W_PX,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        foreignObjectRendering: false,
        onclone: (doc: Document) => {
          // Ensure print-color-adjust on cloned doc
          const style = doc.createElement('style');
          style.textContent = '* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }';
          doc.head.appendChild(style);
        },
      });

      // Build page-break candidates at section boundaries
      const breaks: number[] = [0];
      for (const s of sections) {
        const rect = s.getBoundingClientRect();
        const sBot = Math.round((rect.top + window.scrollY - pageTopPx + rect.height) * SCALE);
        if (sBot > 0 && sBot < fullCanvas.height) breaks.push(sBot);
      }
      breaks.push(fullCanvas.height);

      // Restore styles
      reportPage.setAttribute('style', origStyle);
      if (toolbar) toolbar.style.visibility = '';
      window.scrollTo(0, origScrollY);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Conversion: A4_W_PX * SCALE canvas pixels = A4_W_MM mm
      const mmPerCanvasPx = A4_W_MM / (A4_W_PX * SCALE);
      // How many canvas px fit in one A4 page height
      const pageHpx = Math.round(A4_H_MM / mmPerCanvasPx);

      let sliceStart = 0;
      let pageNum = 0;

      while (sliceStart < fullCanvas.height) {
        // Find a good natural break close to one A4 page height
        const idealEnd = sliceStart + pageHpx;
        const sliceEnd = findBestBreak(breaks, idealEnd, fullCanvas.height);
        const sliceH = sliceEnd - sliceStart;

        // Draw this slice into a temporary canvas
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = fullCanvas.width;
        sliceCanvas.height = sliceH;
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          fullCanvas,
          0, sliceStart, fullCanvas.width, sliceH,
          0, 0, fullCanvas.width, sliceH
        );

        // Exact mm height for this slice
        const sliceHmm = sliceH * mmPerCanvasPx;

        if (pageNum > 0) pdf.addPage([A4_W_MM, sliceHmm < A4_H_MM ? A4_H_MM : sliceHmm], 'portrait');
        pdf.addImage(
          sliceCanvas.toDataURL('image/jpeg', 0.96),
          'JPEG',
          0, 0,
          A4_W_MM,
          sliceHmm,
        );

        sliceStart = sliceEnd;
        pageNum++;
      }

      const slug = document.title.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 50);
      pdf.save(`${slug || 'SEO_Report'}.pdf`);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);

    } catch (err) {
      console.error('PDF generation failed:', err);
      if (toolbar) toolbar.style.visibility = '';
      window.print();
      setStatus('idle');
    }
  };

  const label =
    status === 'loading' ? '⏳ Building PDF…' :
    status === 'done'    ? '✅ Downloaded!'   :
                           'Download PDF';

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

// Find the nearest section boundary that is at or before targetY
function findBestBreak(breaks: number[], targetY: number, maxY: number): number {
  const below = breaks.filter(b => b <= targetY && b > 0);
  if (below.length === 0) return Math.min(targetY, maxY);
  // If the best break is too far back (less than 60% of page), just cut at targetY
  const best = below[below.length - 1];
  if (best < targetY * 0.6) return Math.min(targetY, maxY);
  return Math.min(best, maxY);
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(s);
  });
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
