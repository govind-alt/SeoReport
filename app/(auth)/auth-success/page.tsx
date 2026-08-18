import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AuthSuccessPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user.role || '').toLowerCase();
  const email = (session.user.email || '').toLowerCase();

  // Superadmin
  if (role === 'superadmin' || email === 'superadmin@rankflow.app') {
    redirect('/superadmin');
  }

  // Client user
  if (role === 'client') {
    redirect('/client-portal');
  }

  // Agency user / Google Sign-in
  if (session.user.agencyId) {
    const agency = await prisma.agency.findUnique({
      where: { id: session.user.agencyId },
      select: { slug: true, subdomain: true }
    });
    
    const slug = agency?.slug || agency?.subdomain;
    if (slug) {
      redirect(`/${slug}/`);
    }
  }

  // Fallback to agency dashboard
  redirect('/admin/dashboard');
}

