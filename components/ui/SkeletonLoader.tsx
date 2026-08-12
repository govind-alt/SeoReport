export function SkeletonLoader({ type = 'card' }: { type?: 'card' | 'table-row' | 'chart' | 'text' }) {
  if (type === 'table-row') {
    return (
      <div style={{ display: 'flex', gap: '16px', padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div className="skeleton-pulse" style={{ height: '20px', width: '20%', borderRadius: '4px', background: 'var(--gray-200)' }} />
        <div className="skeleton-pulse" style={{ height: '20px', width: '40%', borderRadius: '4px', background: 'var(--gray-200)' }} />
        <div className="skeleton-pulse" style={{ height: '20px', width: '20%', borderRadius: '4px', background: 'var(--gray-200)' }} />
        <div className="skeleton-pulse" style={{ height: '20px', width: '20%', borderRadius: '4px', background: 'var(--gray-200)' }} />
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="card" style={{ padding: '24px', height: '350px', display: 'flex', flexDirection: 'column' }}>
        <div className="skeleton-pulse" style={{ height: '24px', width: '150px', borderRadius: '4px', background: 'var(--gray-200)', marginBottom: '32px' }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton-pulse" style={{ flex: 1, height: `${Math.random() * 60 + 20}%`, background: 'var(--primary-light)', borderRadius: '4px 4px 0 0' }} />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton-pulse" style={{ height: '16px', width: '100%', borderRadius: '4px', background: 'var(--gray-200)' }} />
        <div className="skeleton-pulse" style={{ height: '16px', width: '80%', borderRadius: '4px', background: 'var(--gray-200)' }} />
        <div className="skeleton-pulse" style={{ height: '16px', width: '60%', borderRadius: '4px', background: 'var(--gray-200)' }} />
      </div>
    );
  }

  // default card
  return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="skeleton-pulse" style={{ height: '36px', width: '36px', borderRadius: '8px', background: 'var(--primary-light)', marginBottom: '16px' }} />
      <div className="skeleton-pulse" style={{ height: '14px', width: '60%', borderRadius: '4px', background: 'var(--gray-200)', marginBottom: '12px' }} />
      <div className="skeleton-pulse" style={{ height: '32px', width: '40%', borderRadius: '6px', background: 'var(--gray-200)' }} />
    </div>
  );
}
