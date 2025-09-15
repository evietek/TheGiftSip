// lib/printify.js  (server-only)
import 'server-only';                 // ensures it never bundles client-side
export const runtime = 'nodejs';      // if this file is imported by an API route

const BASE = 'https://api.printify.com/v1';

function getEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export async function createPrintifyOrder(payload) {
  // 1) Recalculate totals on server (don’t trust client)
  // TODO: Replace with your own server-side price calc using product IDs/variants/qty.
  // strip any client-sent prices:
  if (payload?.line_items) {
    payload.line_items = payload.line_items.map(li => ({
      product_id: li.product_id,
      variant_id: li.variant_id,
      quantity: li.quantity,
      // ⛔️ do NOT accept client price/amount fields
    }));
  }

  const apiKey = getEnv('PRINTIFY_API_KEY');
  const storeId = getEnv('PRINTIFY_STORE_ID');

  // 2) Add a timeout & retry (Printify can be slow)
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(`${BASE}/shops/${storeId}/orders.json`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GiftSip-NextJS',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      // Optionally: cache: "no-store"
    });

    const text = await res.text(); // read once
    if (!res.ok) {
      // 3) Log safely (server logs only), don’t leak upstream body to client
      throw new Error(`Printify order failed (${res.status})`);
    }
    return JSON.parse(text);
  } finally {
    clearTimeout(t);
  }
}
