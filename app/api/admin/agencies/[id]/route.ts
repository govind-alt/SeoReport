import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const { plan, status, name, subdomain } = body;
    const updated = await prisma.agency.update({
      where: { id },
      data: {
        ...(plan !== undefined && { plan }),
        ...(status !== undefined && { status }),
        ...(name !== undefined && { name }),
        ...(subdomain !== undefined && { subdomain, slug: subdomain }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ADMIN_AGENCY_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await prisma.agency.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_AGENCY_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
