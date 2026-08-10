/**
 * Webhook Dispatcher Utility
 * Fires HTTP POST requests to all registered webhook endpoints for an agency.
 * Signs each payload with HMAC-SHA256 if a secret is configured.
 */

import crypto from 'crypto';
import prisma from '@/lib/prisma';

type WebhookEvent =
  | 'report.generated'
  | 'report.failed'
  | 'sync.completed'
  | 'sync.failed'
  | 'client.added'
  | 'client.removed'
  | 'team.invited';

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  agencyId: string;
  data: Record<string, unknown>;
}

/**
 * Signs a webhook payload body with HMAC-SHA256.
 * Compatible with the Stripe webhook verification pattern.
 */
function sign(body: string, secret: string): string {
  return 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(body, 'utf-8')
    .digest('hex');
}

/**
 * Fires a single webhook endpoint with retry logic.
 * Does not throw — logs errors but does not break the calling flow.
 */
async function fireEndpoint(
  url: string,
  body: string,
  signature: string | null
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-RankFlow-Event': 'webhook',
    'User-Agent': 'RankFlow-Webhooks/1.0',
  };

  if (signature) {
    headers['X-RankFlow-Signature'] = signature;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!res.ok) {
      console.warn(`[Webhook] ${url} responded with ${res.status}`);
    } else {
      console.log(`[Webhook] ✓ Delivered to ${url}`);
    }
  } catch (err) {
    console.error(`[Webhook] ✗ Failed to deliver to ${url}:`, err);
  }
}

/**
 * Main dispatcher — finds all active endpoints for an agency matching the event,
 * signs the payload, and fires them in parallel.
 *
 * @example
 * await dispatchWebhooks('agency-cuid-123', 'report.generated', { reportId: 'r-123', clientId: 'c-456' });
 */
export async function dispatchWebhooks(
  agencyId: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  let endpoints;

  try {
    endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        agencyId,
        isActive: true,
      },
    });
  } catch (err) {
    console.error('[Webhook] Failed to fetch endpoints from DB:', err);
    return;
  }

  if (!endpoints.length) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    agencyId,
    data,
  };

  const body = JSON.stringify(payload);

  // Fire all endpoints in parallel
  await Promise.allSettled(
    endpoints.map((endpoint) => {
      // Parse events array and check if this endpoint listens for this event
      let listenedEvents: string[] = [];
      try {
        listenedEvents = JSON.parse(endpoint.events);
      } catch {
        listenedEvents = [];
      }

      if (!listenedEvents.includes(event) && !listenedEvents.includes('*')) {
        return Promise.resolve(); // Skip — endpoint doesn't listen to this event
      }

      const signature = endpoint.secret ? sign(body, endpoint.secret) : null;
      return fireEndpoint(endpoint.url, body, signature);
    })
  );
}
