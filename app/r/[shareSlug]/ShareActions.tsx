'use client';

export function ShareActions({ href }: { href: string }) {
  return (
    <div className="actions-row">
      <button
        className="download-btn"
        onClick={() => window.print()}
      >
        📥 Download PDF
      </button>
      <button
        onClick={() => {
          navigator.clipboard.writeText(href).catch(() => {});
          alert('Link copied!');
        }}
        style={{
          padding: '12px 20px', borderRadius: '10px',
          border: '1px solid #E2E8F0', background: 'white',
          cursor: 'pointer', fontSize: '14px', fontWeight: 600,
        }}
      >
        🔗 Copy Link
      </button>
    </div>
  );
}
