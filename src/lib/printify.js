// lib/printify.js (server-only)
import "server-only";
export const runtime = "nodejs";

const BASE = "https://api.printify.com/v1";

function getEnv(name, alt) {
  const v = process.env[name] ?? (alt ? process.env[alt] : undefined);
  if (!v) throw new Error(`Missing ${name}${alt ? ` (or ${alt})` : ""}`);
  return v;
}

function assertLineItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No line_items provided");
  }
  for (const li of items) {
    if (!li?.product_id || !li?.variant_id) {
      throw new Error("Each line_item must include product_id and variant_id");
    }
  }
}

export async function createPrintifyOrder(payload) {
  const storeId = getEnv("PRINTIFY_STORE_ID", "PRINTIFY_SHOP_ID");
  const apiToken = getEnv("PRINTIFY_API_KEY");

  // Strip any client price fields + normalize types
  if (payload?.line_items) {
    payload.line_items = payload.line_items.map((li) => ({
      product_id: String(li.product_id),
      variant_id: Number(li.variant_id),
      quantity: Math.max(1, Math.min(100, Number(li.quantity) || 1)),
      // NEVER forward client-side price fields
    }));
  }
  assertLineItems(payload?.line_items);

  // Minimal address sanity (Printify also validates)
  const a = payload?.address_to || {};
  if (!a.country || !a.address1 || !a.city || !a.zip) {
    throw new Error("address_to is incomplete (country, address1, city, zip required)");
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`${BASE}/shops/${storeId}/orders.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        "User-Agent": "GiftSip-NextJS",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await res.text();

    if (!res.ok) {
      // Log full upstream detail to server logs (not returned to client)
      console.error("Printify order failed", {
        status: res.status,
        body: text?.slice(0, 2000),
      });
      throw new Error(`Printify order failed (${res.status})`);
    }

    return JSON.parse(text || "{}");
  } catch (e) {
    if (e.name === "AbortError") {
      console.error("Printify order request timed out after 20s");
      throw new Error("Upstream timeout");
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}
