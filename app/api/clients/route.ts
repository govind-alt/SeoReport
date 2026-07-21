import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CreateClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  domain: z.string().min(1, 'Domain is required'),
  industry: z.string().optional(),
  notes: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactName: z.string().optional(),
  serankingProjectId: z.number().optional(),
});

/** GET /api/clients — list all clients for the agency */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      where: { agencyId: session.user.agencyId as string },
      include: {
        serankingProject: { select: { serankingId: true, name: true, lastSyncedAt: true } },
        reportSchedule: { select: { isActive: true, nextRunAt: true, autoSend: true } },
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true, status: true, periodStart: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(clients);
  } catch (error: unknown) {
    console.error('[CLIENTS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

/** POST /api/clients — create a new client */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, domain, industry, notes, contactEmail, contactName, serankingProjectId } = parsed.data;

    const client = await prisma.client.create({
      data: {
        name,
        domain: domain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        industry,
        notes,
        contactEmail: contactEmail || null,
        contactName,
        serankingProjectId,
        agencyId: session.user.agencyId as string,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: unknown) {
    console.error('[CLIENTS_POST]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
