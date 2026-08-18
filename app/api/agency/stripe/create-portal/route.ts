import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// Safe dynamic Stripe helper
function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  try {
    const req = eval('require');
    const Stripe = req('stripe');
    return new Stripe(key, { apiVersion: '2026-06-24.dahlia' });
  } catch {
    return null;
  }
}

/**
 * GET /api/agency/stripe/create-portal
 * Creates a Stripe Customer Portal session and returns the URL.
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe keys are not configured or stripe module not available.' 
      }, { status: 400 });
    }

    // Get user to check for stripe customer id
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true },
    });

    let customerId = user?.stripeCustomerId;

    // If they don't have a Stripe Customer ID, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || '',
        metadata: {
          userId: session.user.id ?? null,
          agencyId: session.user.agencyId ?? null,
        },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Determine return URL
    const url = new URL(req.url);
    const returnUrl = `${url.protocol}//${url.host}/settings`;

    // Create a Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId ?? '',
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Stripe Portal Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
