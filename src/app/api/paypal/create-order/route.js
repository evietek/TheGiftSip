export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { ppCreateOrder } from '@/lib/paypal';

export async function POST(req) {
  try {
    const { items, shippingAddress, shippingCost = 0 } = await req.json() || {};
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items' }, { status: 400 });
    }

    // Get canonical item pricing from your own price-check route
    const priceRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/printify/price-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
      cache: 'no-store',
    });
    if (!priceRes.ok) return NextResponse.json({ error: 'Pricing failed' }, { status: 400 });
    const priced = await priceRes.json(); // { subtotal, lines, currency }

    const subtotal = Number(priced.subtotal || 0);
    const shipping = Number(shippingCost || 0);
    const total = subtotal + shipping;

    // Minimal shipping block for PayPal
    const ship = shippingAddress ? {
      firstName: shippingAddress.firstName,
      lastName: shippingAddress.lastName,
      address1: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.zipCode,
      countryCode: shippingAddress.countryCode,
    } : null;

    const order = await ppCreateOrder({ amount: total, currency: 'USD', shipping: ship });
    return NextResponse.json({ id: order.id });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
