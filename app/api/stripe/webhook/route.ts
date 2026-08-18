import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Stripe Webhook Handler
 * 
 * Handles: checkout.session.completed, invoice.paid, customer.subscription.deleted
 * 
 * To activate: add STRIPE_WEBHOOK_SECRET to your .env
 * To register this endpoint in Stripe Dashboard:
 *   Webhook URL: https://your-domain.com/api/stripe/webhook
 *   Events: checkout.session.completed, invoice.paid, customer.subscription.deleted
 */
export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  try {
    let Stripe: any;
    try {
      const req = eval('require');
      Stripe = req('stripe');
    } catch {
      return NextResponse.json({ error: 'Stripe module not found' }, { status: 500 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-06-24.dahlia' });
    
    // Verify webhook authenticity
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    console.log(`[STRIPE WEBHOOK] Received: ${event.type}`);

    switch (event.type) {
      
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const agencyId = session.metadata?.agencyId;
        const planKey = session.metadata?.plan || 'starter';
        
        if (agencyId) {
          await prisma.agency.update({
            where: { id: agencyId },
            data: { plan: planKey }
          });
          console.log(`[STRIPE WEBHOOK] Activated plan '${planKey}' for agency ${agencyId}`);
        }
        break;
      }

      case 'invoice.paid': {
        // Plan remains active — no action needed
        console.log('[STRIPE WEBHOOK] Invoice paid — plan remains active.');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;
        
        // Find agency by Stripe customer ID and downgrade to starter
        // NOTE: requires stripeCustomerId field in Agency schema
        // For now we log — wire this after adding stripeCustomerId to schema
        console.log(`[STRIPE WEBHOOK] Subscription cancelled for customer ${customerId}. Downgrade agency to starter.`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.log(`[STRIPE WEBHOOK] Payment failed for customer ${invoice.customer}.`);
        // TODO: Send payment failed email, optionally suspend agency
        break;
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('[STRIPE WEBHOOK ERROR]', error.message);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }
}
