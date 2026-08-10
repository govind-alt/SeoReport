import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';

const SettingsSchema = z.object({
  name: z.string().min(2).optional(),
  billingEmail: z.string().email().optional(),
  notificationEmail: z.string().email().optional(),
  customDomain: z.string().optional(),
  serankingApiKey: z.string().optional(),
  brandingJson: z.string().optional(),
  plan: z.enum(['starter', 'pro', 'agency']).optional(),
});

/** GET /api/agency/settings */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { id: session.user.agencyId as string },
      select: {
        id: true, name: true, slug: true, subdomain: true,
        plan: true, billingEmail: true, notificationEmail: true, customDomain: true, brandingJson: true,
        serankingApiKey: true,
        createdAt: true,
      },
    });

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...agency,
      hasSerankingApiKey: Boolean(agency.serankingApiKey),
      // Never expose the raw encrypted value
      serankingApiKey: agency.serankingApiKey ? `sk-${'•'.repeat(30)}xyz` : null,
    });
  } catch (error: unknown) {
    console.error('[AGENCY_SETTINGS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

/** PATCH /api/agency/settings */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { serankingApiKey, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };

    // Encrypt the API key before saving (or set null if empty)
    if (serankingApiKey !== undefined) {
      updateData.serankingApiKey = serankingApiKey ? encrypt(serankingApiKey) : null;
    }

    const agency = await prisma.agency.update({
      where: { id: session.user.agencyId as string },
      data: updateData,
      select: {
        id: true, name: true, slug: true, plan: true,
        billingEmail: true, notificationEmail: true, customDomain: true, brandingJson: true,
        serankingApiKey: true,
      },
    });

    return NextResponse.json({
      ...agency,
      hasSerankingApiKey: Boolean(agency.serankingApiKey),
      serankingApiKey: agency.serankingApiKey ? `sk-${'•'.repeat(30)}xyz` : null,
    });
  } catch (error: unknown) {
    console.error('[AGENCY_SETTINGS_PATCH]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
