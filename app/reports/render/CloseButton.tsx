'use client';

export default function CloseButton() {
  return (
    <button 
      onClick={() => window.close()} 
      className="btn-close"
      style={{
        border: 'none',
        background: 'rgba(255,255,255,0.07)',
        color: 'rgba(255,255,255,0.8)',
        padding: '10px 18px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer'
      }}
    >
      ← Close Preview
    </button>
  );
}
