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
  const timer = setTimeout(() => ctrl.abort(), 20_000);

  try {
    const res = await fetch(`https://api.printify.com/v1/shops/${storeId}/products.json`, {
      headers: { Authorization: `Bearer ${apiKey}`, 'User-Agent': 'GiftSip-NextJS' },
      signal: ctrl.signal,
      cache: 'no-store',
    });

    const apiResponse = await res.json();
    const products = apiResponse?.data;
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid Printify response' }, { status: 502 });
    }

    const formatted = products.map((p) => {
      const defaultVariant = p.variants?.[0] || {};
      const colors = [];
      const colorOption = p.options?.find(opt =>
        opt.name?.toLowerCase().includes('color') || opt.type === 'color'
      );

      if (colorOption?.values) {
        const enabledColorIds = new Set();
        p.variants?.forEach((variant) => {
          if (variant.is_enabled && variant.options) {
            variant.options.forEach(optionId => {
              if (colorOption.values.find(cv => cv.id === optionId)) {
                enabledColorIds.add(optionId);
              }
            });
          }
        });
        colorOption.values.forEach(cv => {
          if (enabledColorIds.has(cv.id) && cv.title) colors.push(cv.title);
        });
      }

      return {
        id: p.id,
        name: p.title || 'Untitled Product',
        slug: p.handle || p.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || `product-${p.id}`,
        price: defaultVariant.price ? defaultVariant.price / 100 : 0,
        originalPrice: null,
        image: p.images?.[0]?.src || '/api/placeholder/300/300',
        images: p.images?.map(img => img.src) || [],
        badge: p.visible === false ? 'Hidden' : null,
        badgeColor: 'bg-gray-400',
        store: p.brand || 'Generic Brand',
        category: p.product?.product_type || p.tags?.[0] || 'Uncategorized',
        description: p.description || 'No description available.',
        keywords: p.tags || [],
        variants: p.variants || [],
        colors,
        soldOut: defaultVariant.is_enabled === false,
        discount: null,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('products error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    clearTimeout(timer);
  }
}
