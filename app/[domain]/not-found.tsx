'use client';

import Link from 'next/link';

export default function DomainNotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg, #f4f5f7)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '32px',
        textAlign: 'center',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        border: '1px solid var(--border, #e2e8f0)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--primary-light, #e0e7ff)',
          color: 'var(--primary, #4F8EF7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          margin: '0 auto 24px',
          fontWeight: 800
        }}>
          404
        </div>
        
        <h2 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text-primary, #1e293b)',
          marginBottom: '12px'
        }}>
          Page not found
        </h2>
        
        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted, #64748b)',
          marginBottom: '28px',
          lineHeight: 1.6
        }}>
          The page you are looking for does not exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.history.back()}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
