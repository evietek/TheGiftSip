import 'server-only';

/** Base API + UA */
const API = process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com';
const UA  = 'GiftSip-NextJS';

/** Get OAuth access token */
export async function ppAccessToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!id || !secret) throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET');

  const auth = Buffer.from(`${id}:${secret}`).toString('base64');

  const res = await fetch(`${API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`PayPal auth failed: ${res.status} ${t.slice(0, 400)}`);
  }

  const data = await res.json();
  return data.access_token;
}

/** Create an order (CAPTURE) */
export async function ppCreateOrder({ amount, currency = 'USD', shipping }) {
  const token = await ppAccessToken();

  // Build shipping block only if all key fields present
  let shippingBlock;
  if (shipping) {
    const countryCode = (shipping.countryCode || '').toUpperCase();
    const state = shipping.stateCode || shipping.state || ''; // prefer 2-letter code if you have it
    const hasAll =
      !!shipping.address1 &&
      !!shipping.city &&
      !!state &&
      !!shipping.zip &&
      !!countryCode;

    if (hasAll) {
      shippingBlock = {
        name: {
          full_name: `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim(),
        },
        address: {
          address_line_1: shipping.address1,
          admin_area_2: shipping.city,   // city
          admin_area_1: state,           // state/province (2-letter for US/CA/AU preferred)
          postal_code: shipping.zip,
          country_code: countryCode,     // ISO2 uppercase
        },
      };
    }
  }

  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: Number(amount || 0).toFixed(2),
        },
        ...(shippingBlock ? { shipping: shippingBlock } : {}),
      },
    ],
    application_context: {
      // If you supply a shipping address, tell PayPal to use it; otherwise don't require shipping
      shipping_preference: shippingBlock ? 'SET_PROVIDED_ADDRESS' : 'NO_SHIPPING',
    },
  };

  const res = await fetch(`${API}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': UA,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    // Log full details server-side for debugging
    console.error('PayPal create failed:', res.status, t);
    throw new Error(`PayPal create failed: ${res.status} ${t.slice(0, 800)}`);
  }

  return res.json(); // { id, status, ... }
}

/** Capture an order */
export async function ppCaptureOrder(orderId) {
  if (!orderId) throw new Error('orderId required');
  const token = await ppAccessToken();

  const res = await fetch(`${API}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': UA,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    console.error('PayPal capture failed:', res.status, t);
    throw new Error(`PayPal capture failed: ${res.status} ${t.slice(0, 800)}`);
  }

  return res.json(); // capture details
}

/** Get order details (optional helper) */
export async function ppGetOrder(orderId) {
  if (!orderId) throw new Error('orderId required');
  const token = await ppAccessToken();

  const res = await fetch(`${API}/v2/checkout/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': UA,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`PayPal get order failed: ${res.status} ${t.slice(0, 400)}`);
  }

  return res.json();
}

/** Verify webhook signature (if you wire webhooks) */
export async function verifyWebhookSignature({ headers, event }) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error('Missing PAYPAL_WEBHOOK_ID');

  const token = await ppAccessToken();

  const payload = {
    transmission_id: headers['paypal-transmission-id'],
    transmission_time: headers['paypal-transmission-time'],
    cert_url: headers['paypal-cert-url'],
    auth_algo: headers['paypal-auth-algo'],
    transmission_sig: headers['paypal-transmission-sig'],
    webhook_id: webhookId,
    webhook_event: event,
  };

  const res = await fetch(`${API}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': UA,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Webhook verify failed: ${res.status} ${t.slice(0, 300)}`);
  }

  const json = await res.json();
  return json?.verification_status === 'SUCCESS';
}
