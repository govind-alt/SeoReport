export default function DashboardLoading() {
  return (
    <div style={{ padding: '32px 40px' }}>
      {/* Page header skeleton */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            height: '28px',
            width: '260px',
            background: 'var(--bg-muted)',
            borderRadius: '6px',
            marginBottom: '10px',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: '16px',
            width: '180px',
            background: 'var(--bg-muted)',
            borderRadius: '4px',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* KPI cards skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              height: '100px',
              animation: 'shimmer 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Content area skeleton */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          height: '320px',
          animation: 'shimmer 1.5s ease-in-out infinite',
          animationDelay: '0.4s',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
