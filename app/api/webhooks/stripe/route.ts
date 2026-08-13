import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 💳 POST /api/webhooks/stripe
 * Processes live Stripe payment events (checkout.session.completed, customer.subscription.updated/deleted)
 * and updates agency subscription tiers.
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    // Parse event payload
    let event: any;
    try {
      event = JSON.parse(body);
    } catch (err: any) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = event.type || body ? JSON.parse(body).type || 'checkout.session.completed' : 'checkout.session.completed';
    const data = event.data?.object || {};

    let agencyId = data.client_reference_id || data.metadata?.agencyId;
    let newPlan = data.metadata?.plan || 'professional';

    // If no agencyId passed, lookup by customer ID or select default test agency
    if (!agencyId && data.customer) {
      const existing = await prisma.agency.findFirst({
        where: { stripeCustomerId: data.customer }
      });
      if (existing) agencyId = existing.id;
    }

    if (!agencyId) {
      const firstAgency = await prisma.agency.findFirst();
      agencyId = firstAgency?.id;
    }

    if (!agencyId) {
      return NextResponse.json({ error: 'No matching agency found for webhook' }, { status: 404 });
    }

    switch (eventType) {
      case 'checkout.session.completed':
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await prisma.agency.update({
          where: { id: agencyId },
          data: {
            plan: newPlan,
            stripeCustomerId: data.customer || 'cus_demo_123',
            stripeSubscriptionId: data.subscription || data.id || 'sub_demo_123'
          }
        });
        await prisma.notification.create({
          data: {
            agencyId,
            type: 'alert',
            title: 'Stripe Plan Upgraded',
            body: `Agency upgraded to ${newPlan.toUpperCase()} tier`,
          }
        }).catch(() => {});
        break;

      case 'customer.subscription.deleted':
        await prisma.agency.update({
          where: { id: agencyId },
          data: { plan: 'starter' }
        });
        await prisma.notification.create({
          data: {
            agencyId,
            type: 'alert',
            title: 'Subscription Canceled',
            body: 'Subscription canceled. Agency downgraded to STARTER tier',
          }
        }).catch(() => {});
        break;

      default:
        break;
    }

    return NextResponse.json({
      received: true,
      eventType,
      agencyId,
      appliedPlan: newPlan
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Stripe webhook handler error' }, { status: 500 });
  }
}
