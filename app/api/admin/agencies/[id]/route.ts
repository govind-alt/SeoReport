import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, subdomain, plan, status, mrr } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (subdomain !== undefined) {
      dataToUpdate.subdomain = subdomain;
      dataToUpdate.slug = subdomain; // Slug usually mirrors subdomain
    }
    if (plan !== undefined) dataToUpdate.plan = plan;
    if (status !== undefined) dataToUpdate.status = status;

    const agency = await prisma.agency.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(agency);
  } catch (error) {
    console.error('[ADMIN_AGENCIES_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
