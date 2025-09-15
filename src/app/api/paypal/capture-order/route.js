export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { ppCaptureOrder } from '@/lib/paypal';

export async function POST(req) {
  try {
    const { orderId } = await req.json() || {};
    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });

    const capture = await ppCaptureOrder(orderId);

    // Optional: check amount paid vs expected; you can store expected totals in DB
    // For MVP, just return the capture:
    return NextResponse.json({ ok: true, capture });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
