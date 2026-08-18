import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OnboardingClient from './OnboardingClient';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agency: true }
  });

  if (!user || !user.agency) {
    redirect('/login');
  }

  return (
    <OnboardingClient 
      agencyName={user.agency.name} 
      slug={user.agency.slug}
      initialStep={1} 
    />
  );
}
