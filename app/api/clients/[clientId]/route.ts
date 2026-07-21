import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const UpdateClientSchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().min(1).optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactName: z.string().optional(),
  serankingProjectId: z.number().nullable().optional(),
});

type Params = { params: Promise<{ clientId: string }> };

/** GET /api/clients/[clientId] */
export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;
    const client = await prisma.client.findFirst({
      where: { id: clientId, agencyId: session.user.agencyId as string },
      include: {
        serankingProject: true,
        reportSchedule: true,
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true, status: true, periodStart: true,
            periodEnd: true, pdfUrl: true, shareSlug: true,
            viewCount: true, generatedAt: true, createdAt: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error: unknown) {
    console.error('[CLIENT_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

/** PATCH /api/clients/[clientId] */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;
    const existing = await prisma.client.findFirst({
      where: { id: clientId, agencyId: session.user.agencyId as string },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = UpdateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updated = await prisma.client.update({
      where: { id: clientId },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('[CLIENT_PATCH]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

/** DELETE /api/clients/[clientId] */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;
    const existing = await prisma.client.findFirst({
      where: { id: clientId, agencyId: session.user.agencyId as string },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    await prisma.client.delete({ where: { id: clientId } });
    return new Response(null, { status: 204 });
  } catch (error: unknown) {
    console.error('[CLIENT_DELETE]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
