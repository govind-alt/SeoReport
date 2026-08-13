export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="auth-root-wrapper">{children}</div>;
}

