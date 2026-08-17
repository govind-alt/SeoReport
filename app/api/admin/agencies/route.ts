import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agencies = await prisma.agency.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          take: 1,
          select: { name: true, email: true }
        },
        _count: {
          select: {
            clients: true,
            users: true
          }
        }
      }
    });

    const formattedAgencies = await Promise.all(agencies.map(async (a) => {
      const reportsCount = await prisma.report.count({
        where: { client: { agencyId: a.id } }
      });
      
      const planMrr: Record<string, number> = {
        starter: 99,
        pro: 299,
        agency: 499,
        enterprise: 999
      };

      return {
        id: a.id,
        name: a.name,
        subdomain: a.subdomain || a.slug,
        plan: a.plan || 'pro',
        clients: a._count.clients,
        reports: reportsCount,
        status: a.status || 'active',
        mrr: planMrr[a.plan] || 299,
        joined: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        email: a.billingEmail || a.users[0]?.email || 'N/A',
        contactName: a.users[0]?.name || 'Agency Admin'
      };
    }));

    return NextResponse.json(formattedAgencies);
  } catch (error) {
    console.error('[ADMIN_AGENCIES_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, plan, subdomain, contactName } = body;

    if (!name || !email || !subdomain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const agency = await prisma.agency.create({
      data: {
        name,
        slug: subdomain,
        subdomain,
        plan: plan || 'starter',
        status: 'trial',
        billingEmail: email,
        users: {
          create: {
            name: contactName || 'Admin',
            email,
            role: 'admin'
          }
        }
      }
    });

    return NextResponse.json(agency);
  } catch (error) {
    console.error('[ADMIN_AGENCIES_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
