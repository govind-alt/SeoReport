'use client';

import { useState } from 'react';

const A4_W_MM = 210;
const A4_H_MM = 297;
const SCALE = 2.5;
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

      // Save scroll position and scroll to top for accurate coordinate mapping
      const origScrollY = window.scrollY;
      window.scrollTo(0, 0);
      await delay(100);

      const reportPage = document.querySelector('.report-page') as HTMLElement;
      if (!reportPage) { window.print(); window.scrollTo(0, origScrollY); return; }

      // Force report-page to render at exactly A4 width, no shadow, no border-radius
      const origStyle = reportPage.getAttribute('style') || '';
      reportPage.style.cssText += `
        width: ${A4_W_PX}px !important;
        max-width: ${A4_W_PX}px !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
      `;

      // Short wait for reflow
      await delay(150);

      // Measure section boundaries *while* A4 styling is applied!
      const sections = Array.from(
        reportPage.querySelectorAll('.cover, .report-section, .report-footer')
      ) as HTMLElement[];

      const pageTopPx = reportPage.getBoundingClientRect().top + window.scrollY;
      const breaks: number[] = [0]; // canvas Y positions (at SCALE) where we CAN break

      // Capture entire report at once (full height)
      const fullCanvas = await html2canvas(reportPage, {
        scale: SCALE,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: A4_W_PX,
        height: reportPage.scrollHeight,
        windowWidth: A4_W_PX,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        foreignObjectRendering: false,
      });

      for (const s of sections) {
        const rect = s.getBoundingClientRect();
        const sTop = (rect.top + window.scrollY - pageTopPx) * SCALE;
        const sBot = sTop + rect.height * SCALE;
        // Allow break at the BOTTOM of each section
        if (sBot > 0 && sBot < fullCanvas.height) breaks.push(Math.round(sBot));
      }
      breaks.push(fullCanvas.height);

      // Restore original styles and scroll
      reportPage.setAttribute('style', origStyle);
      if (toolbar) toolbar.style.visibility = '';
      window.scrollTo(0, origScrollY);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageHpx = (A4_H_MM / A4_W_MM) * A4_W_PX * SCALE; // A4 height in canvas px

      let sliceStart = 0;
      let pageNum = 0;

      while (sliceStart < fullCanvas.height) {
        const sliceEnd = findBestBreak(breaks, sliceStart + pageHpx, fullCanvas.height);
        const sliceH = sliceEnd - sliceStart;

        // Create a slice canvas
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = fullCanvas.width;
        sliceCanvas.height = sliceH;
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(fullCanvas, 0, sliceStart, fullCanvas.width, sliceH, 0, 0, fullCanvas.width, sliceH);

        const imgH = (sliceH / fullCanvas.height) * (fullCanvas.height / fullCanvas.width) * A4_W_MM;

        if (pageNum > 0) pdf.addPage();
        pdf.addImage(
          sliceCanvas.toDataURL('image/jpeg', 0.98),
          'JPEG',
          0, 0,
          A4_W_MM,
          imgH,
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

// Pick the nearest section boundary ≤ targetY, or just use targetY if none fits
function findBestBreak(breaks: number[], targetY: number, maxY: number): number {
  const candidates = breaks.filter(b => b <= targetY && b > 0);
  if (candidates.length === 0) return Math.min(targetY, maxY);
  return Math.min(candidates[candidates.length - 1], maxY);
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
