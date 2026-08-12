'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ClientPortalError({
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
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        textAlign: 'center',
        background: 'var(--bg)',
      }}
    >
      <div style={{ fontSize: '56px', marginBottom: '20px' }}>🔒</div>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}
      >
        Unable to load your portal
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          maxWidth: '400px',
          lineHeight: 1.7,
          marginBottom: '28px',
        }}
      >
        We encountered an error loading your client portal. Please try refreshing the page.
        If the problem persists, contact your account manager.
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn btn-primary" onClick={reset}>
          🔄 Try Again
        </button>
        <Link
          href={`${basePath}/c/login`}
          className="btn btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
