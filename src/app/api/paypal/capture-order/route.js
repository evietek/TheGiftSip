export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { ppCaptureOrder } from '@/lib/paypal';

export async function POST(req) {
  try {
    const body = (await req.json()) || {};
    // accept either orderID (SDK) or orderId (your earlier code)
    const orderID = body.orderID || body.orderId;
    if (!orderID) {
      return NextResponse.json({ error: 'Missing orderID' }, { status: 400 });
    }

    const capture = await ppCaptureOrder(orderID);
    return NextResponse.json({ ok: true, capture });
  } catch (e) {
    console.error('capture-order error:', e);
    return NextResponse.json({ error: 'Server error', detail: e?.message || String(e) }, { status: 500 });
  }
}
