import './client-portal.css';

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="client-portal-layout">
      {children}
    </div>
  );
}
