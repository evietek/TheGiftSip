export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req) {
  const API_KEY = process.env.PRINTIFY_API_KEY;
  const STORE_ID = process.env.PRINTIFY_STORE_ID;
  if (!API_KEY || !STORE_ID) {
    return NextResponse.json({ error: "Server misconfig" }, { status: 500 });
  }

  try {
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }
    if (items.length > 20) {
      return NextResponse.json({ error: "Too many items" }, { status: 400 });
    }

    // group by product to reduce API calls
    const byProduct = new Map();
    for (const it of items) {
      if (!it.productId || !it.variantId) {
        return NextResponse.json({ error: "Invalid item identifiers" }, { status: 400 });
      }
      const q = Math.max(1, Math.min(100, Number(it.quantity) || 1));
      const arr = byProduct.get(it.productId) || [];
      arr.push({
        cartId: it.cartId,
        variantId: Number(it.variantId),
        quantity: q,
      });
      byProduct.set(it.productId, arr);
    }

    // fetch all product details in parallel
    const productIds = Array.from(byProduct.keys());
    const results = await Promise.allSettled(
      productIds.map((pid) =>
        fetch(`https://api.printify.com/v1/shops/${STORE_ID}/products/${pid}.json`, {
          headers: { Authorization: `Bearer ${API_KEY}` },
          cache: "no-store",
        }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Product ${pid} fetch failed`))))
      )
    );

    const productsById = new Map();
    results.forEach((r, idx) => {
      if (r.status === "fulfilled") {
        productsById.set(productIds[idx], r.value);
      }
    });

    let subtotal = 0;
    const lines = [];

    // helper: pick option objects
    function getOption(product, type) {
      if (!Array.isArray(product?.options)) return null;
      const t = type.toLowerCase();
      return product.options.find(
        (o) => o?.type === t || o?.name?.toLowerCase()?.includes(t)
      ) || null;
    }

    for (const [productId, entries] of byProduct.entries()) {
      const product = productsById.get(productId);

      const sizeOpt  = product ? getOption(product, "size")  : null;
      const colorOpt = product ? getOption(product, "color") : null;

      if (!product) {
        // product fetch failed—return “unavailable” zero lines for those cartIds
        for (const e of entries) {
          lines.push({
            cartId: e.cartId,
            unitPrice: 0,
            lineTotal: 0,
            unavailable: true,
            reason: "PRODUCT_NOT_FOUND",
            sizeTitle: null,
            colorTitle: null,
          });
        }
        continue;
      }

      for (const e of entries) {
        const variant = product.variants?.find((v) => v.id === e.variantId);
        const enabled = !!variant?.is_enabled;
        const priceCents = variant?.price;
        const unit = enabled && priceCents ? priceCents / 100 : 0;

        // map variant.options -> human titles
        let sizeTitle = null;
        let colorTitle = null;
        const optIds = Array.isArray(variant?.options) ? variant.options : [];

        if (sizeOpt?.values?.length && optIds.length) {
          const sv = sizeOpt.values.find((v) => optIds.includes(v.id));
          if (sv) sizeTitle = sv.title;
        }
        if (colorOpt?.values?.length && optIds.length) {
          const cv = colorOpt.values.find((v) => optIds.includes(v.id));
          if (cv) colorTitle = cv.title;
        }

        const lineTotal = unit * e.quantity;
        subtotal += lineTotal;

        lines.push({
          cartId: e.cartId,
          unitPrice: Number(unit.toFixed(2)),
          lineTotal: Number(lineTotal.toFixed(2)),
          unavailable: !enabled || !priceCents,
          reason: !variant
            ? "VARIANT_NOT_FOUND"
            : !enabled
              ? "VARIANT_DISABLED"
              : !priceCents
                ? "MISSING_PRICE"
                : null,
          sizeTitle,
          colorTitle,
        });
      }
    }

    return NextResponse.json({
      currency: "USD",
      subtotal: Number(subtotal.toFixed(2)),
      lines,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
