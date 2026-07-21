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

  // If already fully onboarded, redirect to dashboard
  if (user.agency.onboardingStep >= 5 || user.agency.onboardingSkipped) {
    redirect(`/${user.agency.slug}`);
  }

  return (
    <OnboardingClient 
      agencyName={user.agency.name} 
      slug={user.agency.slug}
      initialStep={user.agency.onboardingStep || 1} 
    />
  );
}
