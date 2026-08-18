import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AuditLogClient from './AuditLogClient';

export default async function AuditLogPage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain;

  const session = await auth();
  if (!session?.user) redirect('/login');

  const agency = await prisma.agency.findFirst({
    where: { OR: [{ slug: domain }, { subdomain: domain }] }
  });
  if (!agency) return <div>Agency not found</div>;

  const logs = await prisma.auditLog.findMany({
    where: { agencyId: agency.id },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <AuditLogClient
      logs={logs.map(l => ({
        id: l.id,
        action: l.action,
        userName: l.userName || 'System',
        userInitials: l.userInitials || 'SY',
        ipAddress: '127.0.0.1',
        createdAt: l.createdAt.toISOString()
      }))}
      agencyName={agency.name}
    />
  );
}
