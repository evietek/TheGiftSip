import 'server-only';

const API = process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com';
const UA = 'GiftSip-NextJS';

/** OAuth token */
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
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

/** Create order (server-side) */
export async function ppCreateOrder({ amount, currency = 'USD', shipping }) {
  const token = await ppAccessToken();

  const body = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: { currency_code: currency, value: Number(amount).toFixed(2) },
      shipping: shipping ? {
        name: { full_name: `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim() },
        address: {
          address_line_1: shipping.address1 || shipping.address,
          admin_area_2: shipping.city,
          admin_area_1: shipping.state,
          postal_code: shipping.zip,
          country_code: shipping.countryCode,
        },
      } : undefined,
    }],
    application_context: { shipping_preference: 'SET_PROVIDED_ADDRESS' },
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
    const t = await res.text();
    throw new Error(`PayPal create failed: ${res.status} ${t.slice(0,400)}`);
  }
  return res.json(); // { id, status, ... }
}

/** Capture order (server-side) */
export async function ppCaptureOrder(orderId) {
  const token = await ppAccessToken();
  const res = await fetch(`${API}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': UA },
    cache: 'no-store',
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal capture failed: ${res.status} ${t.slice(0,400)}`);
  }
  return res.json(); // capture details
}

/** (Optional) Get order details (useful for reconciliation / webhook handling) */
export async function ppGetOrder(orderId) {
  const token = await ppAccessToken();
  const res = await fetch(`${API}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': UA },
    cache: 'no-store',
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal get order failed: ${res.status} ${t.slice(0,400)}`);
  }
  return res.json();
}

/** Verify webhook signature with PayPal (required for secure webhooks) */
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
    const t = await res.text();
    throw new Error(`Webhook verify failed: ${res.status} ${t.slice(0,300)}`);
  }
  const json = await res.json(); // { verification_status: "SUCCESS"|"FAILURE" }
  return json?.verification_status === 'SUCCESS';
}
