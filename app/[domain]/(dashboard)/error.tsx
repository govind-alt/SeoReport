'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const domain = (params?.domain as string) || 'localhost';
  const basePath = domain === 'localhost' ? '/localhost' : `/${domain}`;

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '56px', marginBottom: '20px' }}>⚠️</div>
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          maxWidth: '460px',
          lineHeight: 1.7,
          marginBottom: '28px',
        }}
      >
        An unexpected error occurred while loading this page. This has been logged automatically.
        You can try refreshing the page, or navigate back to the dashboard.
      </p>

      {error.digest && (
        <div
          style={{
            background: 'var(--bg-muted)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            marginBottom: '24px',
          }}
        >
          Error ID: {error.digest}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-primary" onClick={reset}>
          🔄 Try Again
        </button>
        <Link
          href={`${basePath}`}
          className="btn btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          ← Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
