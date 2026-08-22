import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        agency: {
          select: { id: true, name: true, subdomain: true, slug: true }
        },
        _count: {
          select: {
            reports: true,
          }
        },
      }
    });

    const formattedClients = clients.map((c) => ({
      id: c.id,
      name: c.name,
      domain: c.domain,
      industry: c.industry || 'General',
      contactName: c.contactName || 'N/A',
      contactEmail: c.contactEmail || 'N/A',
      agencyId: c.agencyId,
      agencyName: c.agency.name,
      agencyDomain: c.agency.subdomain || c.agency.slug,
      reportsCount: c._count.reports,
      serankingLinked: !!c.serankingProjectId,
      createdAt: c.createdAt,
      joined: new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error('[ADMIN_CLIENTS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
