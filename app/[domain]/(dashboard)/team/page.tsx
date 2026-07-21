import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TeamClient from './TeamClient';
import { redirect } from 'next/navigation';

export default async function TeamPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain;

  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  // Fetch agency and users
  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] },
    include: {
      users: {
        orderBy: { createdAt: 'desc' }
      },
      invitations: {
        where: { role: { not: 'client' } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!agency) {
    return <div>Agency not found</div>;
  }

  // Formatting for the client
  const users = agency.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: 'Active',
    lastActive: 'Just now' // mock
  }));

  const pendingInvites = agency.invitations.map(i => ({
    id: i.id,
    email: i.email,
    role: i.role,
    status: 'Pending',
    expires: new Date(i.expiresAt).toLocaleDateString()
  }));

  const teamData = [...users, ...pendingInvites];

  return <TeamClient initialData={teamData} domain={domain} currentUserId={session.user.id ?? ''} />;
}
