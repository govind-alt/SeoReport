import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Session check: user must be logged in
  if (!session || !session.user) {
    redirect('/login');
  }

  // 2. Role check: enforce strict global superadmin privileges
  if (session.user.role !== 'superadmin') {
    redirect('/login');
  }

  return (
    <>
      {children}
    </>
  );
}
