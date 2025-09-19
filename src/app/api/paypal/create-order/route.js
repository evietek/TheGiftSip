export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { ppCreateOrder } from '@/lib/paypal'; // JS module

export async function POST(req) {
  try {
    const { items, shippingAddress, shippingCost = 0 } = (await req.json()) || {};
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items' }, { status: 400 });
    }

    // same-origin call avoids BASE_URL/env pitfalls
    const priceRes = await fetch('/api/printify/price-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
      cache: 'no-store',
    });

    if (!priceRes.ok) {
      const t = await priceRes.text().catch(() => '');
      console.error('price-check failed:', t);
      return NextResponse.json({ error: 'Pricing failed' }, { status: 400 });
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
          state: shippingAddress.state,
          zip: shippingAddress.zipCode,
          countryCode: (shippingAddress.countryCode || 'US').toUpperCase(),
        }
      : null;

    const order = await ppCreateOrder({ amount: total, currency: 'USD', shipping: ship });
    return NextResponse.json({ id: order.id });
  } catch (e) {
    console.error('create-order error:', e);
    return NextResponse.json({ error: 'Server error', detail: e?.message || String(e) }, { status: 500 });
  }
}
