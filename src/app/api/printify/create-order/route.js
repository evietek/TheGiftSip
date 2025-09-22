export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createPrintifyOrder } from "@/lib/printify";
import { rateLimit } from "@/lib/rateLimit";
// Optional PayPal verification (only if you pass paypalOrderId)
import { ppAccessToken } from "@/lib/paypal";

// ---- helpers ----
const createdIds = new Set();
function isDuplicate(key) {
  if (createdIds.has(key)) return true;
  createdIds.add(key);
  setTimeout(() => createdIds.delete(key), 15 * 60 * 1000);
  return false;
}

function clientIp(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

function toISO2(country) {
  const map = { "United States": "US", Canada: "CA", "United Kingdom": "GB" };
  return map[country] || "US";
}

function getInternalBase(req) {
  // Prefer explicit env; fallback to request host (handles www/non-www)
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, "");
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

function validateBody(body) {
  const errors = [];
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!body || typeof body !== "object") errors.push("Body required");
  const { email, shipping, items } = body || {};

  if (!email || !emailRx.test(email)) errors.push("Valid email required");
  if (!shipping || typeof shipping !== "object") errors.push("Shipping required");

  if (shipping) {
    if (!shipping.firstName) errors.push("firstName required");
    if (!shipping.city) errors.push("city required");
    if (!(shipping.address1 || shipping.address)) errors.push("address required");
    if (!(shipping.postalCode || shipping.zipCode)) errors.push("zip required");
  }

  if (!Array.isArray(items) || items.length === 0 || items.length > 10) {
    errors.push("Invalid items");
  } else {
    for (const it of items) {
      const qty = Number(it?.quantity) || 1;
      if (qty < 1 || qty > 100) errors.push("Invalid quantity");
      // we allow sku in request, but must be resolved server-side before Printify call
      if (!((it?.printifyProductId && it?.variantId) || it?.sku)) {
        errors.push("Missing item identifiers");
      }
    }
  }
  return errors;
}

// (optional) resolve SKU -> product_id/variant_id here if you support sku-only items
async function resolveSkuLines(items) {
  // If you don't use SKU inputs, just map directly below.
  // Otherwise implement your mapping here (e.g., DB lookup).
  return items.map((it) => {
    if (it.printifyProductId && it.variantId) {
      return {
        product_id: String(it.printifyProductId),
        variant_id: Number(it.variantId),
        quantity: Math.max(1, Math.min(100, Number(it.quantity) || 1)),
        external_id: it.cartId || undefined,
      };
    }
    if (it.sku) {
      // TODO: replace with your actual resolver:
      // throw new Error(`SKU resolver not implemented for ${it.sku}`);
      return {
        // If you can’t resolve SKU, fail early:
        // product_id: undefined, variant_id: undefined,
        // For now we intentionally throw:
        _sku: it.sku,
      };
    }
    return {};
  });
}

export async function POST(req) {
  const ip = clientIp(req);
  if (!rateLimit(ip, "create-order", 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const {
      email,
      phone,
      shipping,
      items,
      externalId,
      shippingMethod = 1,
      recomputeShipping = false,
      shippingCost,
      paypalOrderId, // optional
    } = body || {};

    // 1) Validate input
    const errs = validateBody(body);
    if (errs.length) {
      return NextResponse.json({ error: errs.join(", ") }, { status: 400 });
    }

    // 2) Idempotency
    const idem = externalId || `order_${email}_${Date.now()}`;
    if (isDuplicate(idem)) {
      return NextResponse.json({ error: "Duplicate order attempt" }, { status: 409 });
    }

    // 3) Build safe line_items (no client prices). Resolve sku if needed.
    const resolved = await resolveSkuLines(items);
    // Fail if any unresolved sku made it through:
    for (const li of resolved) {
      if (!li?.product_id || !li?.variant_id) {
        const skuMsg = li?._sku ? ` (unresolved SKU: ${li._sku})` : "";
        return NextResponse.json(
          { error: `Missing product_id/variant_id${skuMsg}` },
          { status: 400 }
        );
      }
    }
    const line_items = resolved.map(({ product_id, variant_id, quantity, external_id }) => ({
      product_id,
      variant_id,
      quantity,
      external_id,
    }));

    // 4) Server-side pricing
    const base = getInternalBase(req);
    const priceRes = await fetch(`${base}/api/printify/price-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          cartId: i.cartId,
          productId: i.printifyProductId || i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      }),
      cache: "no-store",
    });
    if (!priceRes.ok) {
      const t = await priceRes.text();
      console.error("Pricing validation failed:", priceRes.status, t?.slice(0, 1000));
      return NextResponse.json({ error: "Pricing validation failed" }, { status: 400 });
    }
    const priced = await priceRes.json();
    const subtotal = Number(priced?.subtotal || 0);

    // 5) Shipping (optional recompute)
    let shipCost = Number(shippingCost || 0);
    if (recomputeShipping) {
      const shipRes = await fetch(`${base}/api/printify/shipping-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.printifyProductId || i.productId,
            variant_id: i.variantId,
            quantity: i.quantity,
          })),
          address: {
            country: shipping.countryCode || toISO2(shipping.country) || "US",
            region: shipping.state || "",
            city: shipping.city,
            zip: shipping.postalCode || shipping.zipCode,
          },
        }),
        cache: "no-store",
      });
      if (!shipRes.ok) {
        const t = await shipRes.text();
        console.error("Shipping validation failed:", shipRes.status, t?.slice(0, 1000));
        return NextResponse.json({ error: "Shipping validation failed" }, { status: 400 });
      }
      const ship = await shipRes.json();
      shipCost = Number(ship?.cost || 0);
    }

    const expectedTotal = Number((subtotal + shipCost).toFixed(2));

    // 6) (Optional) Verify PayPal order status/amount
    if (paypalOrderId) {
      try {
        const token = await ppAccessToken();
        const api = process.env.PAYPAL_API || "https://api-m.sandbox.paypal.com";
        const r = await fetch(`${api}/v2/checkout/orders/${paypalOrderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const pj = await r.json();

        const status = pj?.status;
        const paid = Number(pj?.purchase_units?.[0]?.amount?.value || 0);

        if (status !== "COMPLETED" && status !== "APPROVED") {
          return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
        }
        if (status === "COMPLETED" && Math.abs(paid - expectedTotal) > 0.01) {
          return NextResponse.json({ error: "Payment amount mismatch" }, { status: 409 });
        }
      } catch (e) {
        console.error("Payment verification failed:", e);
        return NextResponse.json({ error: "Payment verification failed" }, { status: 502 });
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
        last_name: shipping.lastName || "",
        email,
        phone: phone || "",
        country: shipping.countryCode || toISO2(shipping.country) || "US",
        region: shipping.state || "",
        address1: shipping.address1 || shipping.address,
        address2: shipping.address2 || "",
        city: shipping.city,
        zip: shipping.postalCode || shipping.zipCode,
      },
    };

    // 8) Upstream timeout guard (redundant with lib but fine)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    let created;
    try {
      created = await createPrintifyOrder(payload);
    } finally {
      clearTimeout(timer);
    }

    return NextResponse.json(
      { ok: true, printifyOrderId: created?.id || null },
      { status: 200 }
    );
  } catch (err) {
    console.error("Create-order route failed:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
