import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ClientDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain;
  const basePath = domain === 'localhost' ? '/localhost' : '';
  
  const session = await auth();

  // 1. Session check: user must be logged in
  if (!session || !session.user) {
    redirect(`${basePath}/c/login`);
  }

  // 2. Role boundary: redirect agency administrators back to the main admin console
  if (session.user.role === 'admin' || session.user.role === 'superadmin') {
    redirect(`${basePath}`);
  }

  // 3. Only role = client users are allowed inside this layout
  if (session.user.role !== 'client') {
    redirect(`${basePath}/c/login`);
  }
  
  return (
    <>
      {children}
    </>
  );
}
