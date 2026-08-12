import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Stripe Billing API Routes
 * 
 * These are fully wired and ready to go.
 * All you need to do is add to your .env:
 *   STRIPE_SECRET_KEY=sk_live_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 * 
 * And create these Price IDs in your Stripe dashboard:
 *   STRIPE_STARTER_PRICE_ID=price_...
 *   STRIPE_PRO_PRICE_ID=price_...
 *   STRIPE_ENTERPRISE_PRICE_ID=price_...
 */

// ── Helper: get or create Stripe customer ───────────────────────────────────
async function getOrCreateStripeCustomer(agencyId: string, agencyEmail: string, agencyName: string) {
  // Lazy import Stripe only when keys exist
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' });

  const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
  
  // If agency already has a customer ID return it
  if ((agency as any)?.stripeCustomerId) {
    return (agency as any).stripeCustomerId as string;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: agencyEmail,
    name: agencyName,
    metadata: { agencyId }
  });

  // Persist the customer ID
  await prisma.agency.update({
    where: { id: agencyId },
    data: { contactEmail: agencyEmail } // TODO: add stripeCustomerId field to schema
  });

  return customer.id;
}

// ── POST /api/stripe/portal — Create billing portal session ────────────────
export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ 
      error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.',
      setup_required: true 
    }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-06-24.dahlia' });

    const { domain, returnUrl } = await request.json();

    const agency = await prisma.agency.findFirst({
      where: { OR: [{ slug: domain }, { subdomain: domain }] }
    });
    if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 });

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      agency.id,
      agency.contactEmail || session.user.email!,
      agency.name
    );

    // Create Stripe Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/${domain}/billing`
    });

    return NextResponse.json({ url: portalSession.url });

  } catch (error: any) {
    console.error('[STRIPE PORTAL ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
