export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { ppCreateOrder } from '@/lib/paypal';

export async function POST(req) {
  try {
    const { items, shippingAddress, shippingCost = 0 } = (await req.json()) || {};
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items' }, { status: 400 });
    }

    // Build absolute URL for server-side fetch
    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`);

    if (!origin) {
      return NextResponse.json(
        { error: 'Server not configured', detail: 'Missing origin/NEXT_PUBLIC_BASE_URL' },
        { status: 500 }
      );
    }

    const priceURL = new URL('/api/printify/price-check', origin).toString();

    const priceRes = await fetch(priceURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
      cache: 'no-store',
    });

    if (!priceRes.ok) {
      const t = await priceRes.text().catch(() => '');
      console.error('price-check failed:', t);
      return NextResponse.json(
        { error: 'Pricing failed', detail: t.slice(0, 300) || String(priceRes.status) },
        { status: 400 }
      );
    }

    const priced = await priceRes.json(); // { subtotal, currency, lines }
    const subtotal = Number(priced?.subtotal || 0);
    const shipping = Number(shippingCost || 0);
    const total = subtotal + shipping;

    const ship = shippingAddress
      ? {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,                // e.g., "CA" not "California"
          zip: shippingAddress.zipCode,
          countryCode: (shippingAddress.countryCode || 'US').toUpperCase(),
        }
      : null;

    const order = await ppCreateOrder({
      amount: total,
      currency: (priced?.currency || 'USD').toUpperCase(),
      shipping: ship || undefined,
    });

    return NextResponse.json({ id: order.id });
  } catch (e) {
    console.error('create-order error:', e);
    return NextResponse.json(
      { error: 'Server error', stage: 'create-order', detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
