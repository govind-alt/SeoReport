import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ClientDashboardLayout({ children, params }: { children: React.ReactNode, params: Promise<{ domain: string }> }) {
  const resolvedParams = await params;
  
  const session = await auth();
  if (!session) {
    redirect(`/${resolvedParams.domain}/c/login`);
  }
  
  return (
    <>
      {children}
    </>
  );
}
