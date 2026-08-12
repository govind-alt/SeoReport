import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/request-access
 * A client user requests portal access — notifies the agency admin.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, company } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Try to find the agency from the request's host header
    const host = req.headers.get('host') || '';
    const domain = host.split(':')[0]; // strip port

    let agency = null;
    if (domain && domain !== 'localhost') {
      agency = await prisma.agency.findFirst({
        where: { OR: [{ slug: domain }, { subdomain: domain }] },
        select: { id: true, name: true, contactEmail: true }
      });
    }

    // Log to console in dev (would send email in prod)
    console.log('\n[REQUEST ACCESS]');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Company: ${company || '—'}`);
    console.log(`Agency: ${agency?.name || 'Unknown'}`);
    if (agency?.contactEmail) {
      console.log(`Notify admin at: ${agency.contactEmail}`);
    }

    return NextResponse.json({ success: true, message: 'Access request received' });
  } catch (error) {
    console.error('[REQUEST_ACCESS]', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
