'use client';

import { toast } from 'sonner';

export default function PrintButton() {
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Report URL copied to clipboard!');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        className="btn-print"
        onClick={handleCopyLink}
        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer' }}
      >
        🔗 Copy Link
      </button>
      <button className="btn-print" onClick={() => window.print()}>
        🖨 Download / Print PDF
      </button>
    </div>
  );
}
