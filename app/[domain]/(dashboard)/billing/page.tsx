import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BillingClient from './BillingClient';
import { redirect } from 'next/navigation';

export default async function BillingPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain;

  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] },
    include: { clients: true }
  });

  if (!agency) {
    return <div>Agency not found</div>;
  }

  // Determine limits based on plan
  let clientLimit = 10;
  if (agency.plan === 'professional') clientLimit = 50;
  if (agency.plan === 'enterprise') clientLimit = 9999;

  return (
    <BillingClient 
      plan={agency.plan || 'starter'}
      clientCount={agency.clients.length}
      clientLimit={clientLimit}
      agencyName={agency.name}
    />
  );
}
