import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import IntegrationsClient from './IntegrationsClient';
import { redirect } from 'next/navigation';

export default async function IntegrationsPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain;

  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] }
  });

  if (!agency) {
    return <div>Agency not found</div>;
  }

  const integrations = {
    seranking: !!agency.serankingApiKey,
    gsc: false, // Google Search Console — set true when GSC tokens stored
    slack: !!(agency as any).slackWebhookUrl,
    teams: !!(agency as any).teamsWebhookUrl,
    slackWebhookUrl: (agency as any).slackWebhookUrl || '',
    teamsWebhookUrl: (agency as any).teamsWebhookUrl || '',
    agencyId: agency.id,
  };

  return <IntegrationsClient integrations={integrations} domain={domain} />;
}
