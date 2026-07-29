import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AuthSuccessPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.email === 'superadmin@rankflow.app') {
    redirect('/admin');
  }

  if (session.user.role === 'client') {
    redirect('/client/dashboard');
  }

  if (session.user.agencyId) {
    const agency = await prisma.agency.findUnique({
      where: { id: session.user.agencyId },
      select: { slug: true, subdomain: true }
    });
    
    const slug = agency?.slug || agency?.subdomain || 'demo';
    redirect(`/${slug}/`);
  }

  redirect('/demo/');
}
