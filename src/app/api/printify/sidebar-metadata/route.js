export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.PRINTIFY_API_KEY;
  const storeId = process.env.PRINTIFY_STORE_ID;

  if (!apiKey || !storeId) {
    return NextResponse.json({ error: 'Server misconfig' }, { status: 500 });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);

  try {
    const res = await fetch(`https://api.printify.com/v1/shops/${storeId}/products.json`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: ctrl.signal,
      cache: 'no-store',
    });

    const raw = await res.json();
    const products = raw?.data;
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid product list' }, { status: 502 });
    }

    const categories = new Set();
    const colors = new Set();
    const prices = [];

    const detailFetches = products.slice(0, 20).map(async (product) => {
      try {
        const r = await fetch(`https://api.printify.com/v1/shops/${storeId}/products/${product.id}.json`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: ctrl.signal,
          cache: 'no-store',
        });
        const full = await r.json();

        const category = full?.product?.product_type || full?.tags?.[0];
        if (category) categories.add(category);

        const colorOption = full?.options?.find(opt =>
          opt.name?.toLowerCase().includes('color') || opt.type === 'color'
        );
        if (colorOption?.values) {
          const enabledColorIds = new Set();
          full?.variants?.forEach((variant) => {
            if (variant.is_enabled && variant.options) {
              variant.options.forEach(optionId => {
                if (colorOption.values.find(cv => cv.id === optionId)) enabledColorIds.add(optionId);
              });
            }
          });
          colorOption.values.forEach(cv => {
            if (enabledColorIds.has(cv.id) && cv.title) colors.add(cv.title);
          });
        }

        full?.variants?.forEach((v) => {
          if (v.is_enabled && v.price) prices.push(v.price / 100);
        });
      } catch (e) {
      }
    });

    await Promise.all(detailFetches);

    return NextResponse.json({
      categories: Array.from(categories),
      colors: Array.from(colors),
      priceRange: prices.length ? [Math.min(...prices), Math.max(...prices)] : [0, 0],
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    clearTimeout(timer);
  }
}
