export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paypal';

// In-memory idempotency (replace with Redis/DB in prod if you later add persistence)
const seenEvents = new Set();
function alreadySeen(id) {
  if (seenEvents.has(id)) return true;
  seenEvents.add(id);
  setTimeout(() => seenEvents.delete(id), 30 * 60 * 1000); // 30 min window
  return false;
}

function readPaypalHeaders(req) {
  // Normalize header names to lowercase keys for convenience
  const h = {
    'paypal-transmission-id': req.headers.get('paypal-transmission-id'),
    'paypal-transmission-time': req.headers.get('paypal-transmission-time'),
    'paypal-cert-url': req.headers.get('paypal-cert-url'),
    'paypal-auth-algo': req.headers.get('paypal-auth-algo'),
    'paypal-transmission-sig': req.headers.get('paypal-transmission-sig'),
  };
  return h;
}

export async function POST(req) {
  try {
    const headers = readPaypalHeaders(req);
    if (!headers['paypal-transmission-id']) {
      return NextResponse.json({ error: 'Missing PayPal headers' }, { status: 400 });
    }

    // Webhook event body
    const event = await req.json(); // PayPal sends JSON
    const eventId = event?.id;
    const eventType = event?.event_type;

    if (!eventId || !eventType) {
      return NextResponse.json({ error: 'Invalid webhook body' }, { status: 400 });
    }

    // Idempotency
    if (alreadySeen(eventId)) {
      return NextResponse.json({ ok: true, duplicate: true }, { status: 200 });
    }

    // Verify signature with PayPal
    const ok = await verifyWebhookSignature({ headers, event });
    if (!ok) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // ---- Handle events (no DB; just best-effort actions/logs) ----
    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED': {
        // You *can* optionally capture here server-side if your flow didn’t already
        // const orderId = event?.resource?.id;
        // ... capture if needed ...
        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        const captureId = event?.resource?.id;
        const amount = event?.resource?.amount?.value;
        const currency = event?.resource?.amount?.currency_code;
        const orderId = event?.resource?.supplementary_data?.related_ids?.order_id;

        // With no DB, just log. If you later add email or reconciliation, do it here.
        // Optional: notify yourself via email or Slack; or reconcile totals by
        // re-running your server-side price check and comparing to `amount`.
        break;
      }

      // Add other events you care about:
      // - PAYMENT.CAPTURE.DENIED
      // - PAYMENT.CAPTURE.REFUNDED
      // - CHECKOUT.ORDER.COMPLETED
      default:
    }

    // Always return 200 once verified and handled
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    // Returning 4xx/5xx makes PayPal retry later; only do this if you truly couldn’t process
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
