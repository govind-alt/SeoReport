import { prisma } from '@/lib/prisma';
import SettingsTabsClient from './SettingsTabsClient';
import { redirect } from 'next/navigation';

export default async function SettingsPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain;

  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] },
    include: {
      users: true,
      invitations: true,
      auditLogs: {
        orderBy: { createdAt: 'desc' },
        take: 50
      }
    }
  });

  if (!agency) {
    redirect('/');
  }

  return <SettingsTabsClient domain={domain} initialAgency={agency} />;
}
