export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createPrintifyOrder } from '@/lib/printify';
import { rateLimit } from '@/lib/rateLimit';

// OPTIONAL: PayPal verification (only if you pass paypalOrderId from client after server capture)
import { ppAccessToken } from '@/lib/paypal'; // add ppGetOrder helper if you like

// ---- Simple in-memory idempotency (replace with DB/Redis in prod) ----
const createdIds = new Set();
function isDuplicate(key) {
  if (createdIds.has(key)) return true;
  createdIds.add(key);
  // best-effort expiry
  setTimeout(() => createdIds.delete(key), 15 * 60 * 1000);
  return false;
}

function clientIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || '0.0.0.0';
}

function toISO2(country) {
  const map = { 'United States': 'US', Canada: 'CA', 'United Kingdom': 'GB' };
  return map[country] || 'US';
}

// ----- Light schema (avoid Zod dep for now) -----
function validateBody(body) {
  const errors = [];
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!body || typeof body !== 'object') errors.push('Body required');

  const { email, phone, shipping, items } = body || {};

  if (!email || !emailRx.test(email)) errors.push('Valid email required');
  if (!shipping || typeof shipping !== 'object') errors.push('Shipping required');

  if (shipping) {
    if (!shipping.firstName) errors.push('firstName required');
    if (!shipping.city) errors.push('city required');
    if (!(shipping.address1 || shipping.address)) errors.push('address required');
    if (!(shipping.postalCode || shipping.zipCode)) errors.push('zip required');
  }

  if (!Array.isArray(items) || items.length === 0 || items.length > 10) {
    errors.push('Invalid items');
  } else {
    for (const it of items) {
      const qty = Number(it?.quantity) || 1;
      if (qty < 1 || qty > 100) errors.push('Invalid quantity');
      if (!((it?.printifyProductId && it?.variantId) || it?.sku)) {
        errors.push('Missing item identifiers');
      }
    }
  }
  return errors;
}

export async function POST(req) {
  const ip = clientIp(req);
  if (!rateLimit(ip, 'create-order', 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const {
      email, phone, shipping, items,
      externalId, shippingMethod = 1,
      recomputeShipping = false,
      shippingCost,                  // client-provided (ignored if recomputeShipping=true)
      paypalOrderId                  // optional: verify PayPal
    } = body || {};

    // 1) Validate input
    const errs = validateBody(body);
    if (errs.length) return NextResponse.json({ error: errs.join(', ') }, { status: 400 });

    // 2) Idempotency key (based on externalId if provided)
    const idem = externalId || `order_${email}_${Date.now()}`;
    if (isDuplicate(idem)) {
      return NextResponse.json({ error: 'Duplicate order attempt' }, { status: 409 });
    }

    // 3) Rebuild safe line_items (no client prices)
    const line_items = items.map((it) => {
      const li = {
        quantity: Math.max(1, Math.min(100, Number(it.quantity) || 1)),
        external_id: it.cartId || undefined,
      };
      if (it.printifyProductId && it.variantId) {
        li.product_id = String(it.printifyProductId);
        li.variant_id = Number(it.variantId);
      } else if (it.sku) {
        li.sku = String(it.sku);
      }
      return li;
    });

    // 4) Server-price the items via your own trusted endpoint
    const priceRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/printify/price-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(i => ({
          cartId: i.cartId,
          productId: i.printifyProductId || i.productId,
          variantId: i.variantId,
          quantity: i.quantity
        })),
      }),
      cache: 'no-store',
    });
    if (!priceRes.ok) {
      return NextResponse.json({ error: 'Pricing validation failed' }, { status: 400 });
    }
    const priced = await priceRes.json(); // { subtotal, currency, lines: [...] }
    const subtotal = Number(priced?.subtotal || 0);

    // 5) Shipping (recompute on server optionally)
    let shipCost = Number(shippingCost || 0);
    if (recomputeShipping) {
      const shipRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/printify/shipping-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            product_id: i.printifyProductId || i.productId,
            variant_id: i.variantId,
            quantity: i.quantity
          })),
          address: {
            country: shipping.countryCode || toISO2(shipping.country) || 'US',
            region: shipping.state || '',
            city: shipping.city,
            zip: shipping.postalCode || shipping.zipCode,
          },
        }),
        cache: 'no-store',
      });
      if (!shipRes.ok) return NextResponse.json({ error: 'Shipping validation failed' }, { status: 400 });
      const ship = await shipRes.json();
      // Expecting something like { cost, currency, ... }
      shipCost = Number(ship?.cost || 0);
    }

    const expectedTotal = Number((subtotal + shipCost).toFixed(2));

    // 6) (Optional) Verify PayPal order status/amount before fulfilling
    if (paypalOrderId) {
      try {
        const token = await ppAccessToken();
        const api = process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com';
        const r = await fetch(`${api}/v2/checkout/orders/${paypalOrderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const pj = await r.json();
        // Accept COMPLETED (for captured orders); optionally allow APPROVED only if you capture server-side here.
        const status = pj?.status;
        const paid = Number(pj?.purchase_units?.[0]?.amount?.value || 0);
        if (status !== 'COMPLETED' && status !== 'APPROVED') {
          return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
        }
        // If COMPLETED, amounts must match (tolerate 1¢ rounding)
        if (status === 'COMPLETED' && Math.abs(paid - expectedTotal) > 0.01) {
          return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 409 });
        }
      } catch (e) {
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 502 });
      }
    }

    // 7) Final Printify payload
    const payload = {
      external_id: idem,
      label: externalId || undefined,
      line_items,
      shipping_method: Number(shippingMethod) || 1,
      send_shipping_notification: false,
      address_to: {
        first_name: shipping.firstName,
        last_name: shipping.lastName || '',
        email,
        phone: phone || '',
        country: shipping.countryCode || toISO2(shipping.country) || 'US',
        region: shipping.state || '',
        address1: shipping.address1 || shipping.address,
        address2: shipping.address2 || '',
        city: shipping.city,
        zip: shipping.postalCode || shipping.zipCode,
      },
    };

    // 8) Timeout guard for upstream
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);

    let created;
    try {
      created = await createPrintifyOrder(payload); // your lib has its own timeout too (recommended)
    } finally {
      clearTimeout(timer);
    }

    return NextResponse.json({ ok: true, printifyOrderId: created?.id || null }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
