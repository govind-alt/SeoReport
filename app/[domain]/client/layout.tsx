export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {children}
    </div>
  );
}
