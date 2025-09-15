export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET(_req, { params }) {
  const { id } = params || {};
  const API_KEY = process.env.PRINTIFY_API_KEY;
  const STORE_ID = process.env.PRINTIFY_STORE_ID;

  if (!id || !API_KEY || !STORE_ID) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);

  try {
    const res = await fetch(`https://api.printify.com/v1/shops/${STORE_ID}/products/${id}.json`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      signal: ctrl.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = await res.json();

    const defaultVariant = product.variants?.find((v) => v.is_default);
    const price = defaultVariant?.price ? defaultVariant.price / 100 : 0;
    const tags = Array.isArray(product.tags) ? product.tags.slice(0, 8) : [];

    const sizeOption = product.options?.find((opt) =>
      opt.name?.toLowerCase().includes('size') || opt.type === 'size'
    );
    const sizes = sizeOption ? sizeOption.values.map((v) => v.title) : [];
    const images = Array.isArray(product.images) ? product.images.map((img) => img.src) : [];

    // specs extraction is best-effort; don’t crash if description is missing
    const specs = [];
    if (typeof product.description === 'string') {
      try {
        const matches = Array.from(product.description.matchAll(/<br\/?>\.:\s*(.*?)<br\/?>/gi));
        matches.forEach((m) => {
          const line = (m[1] || '').trim();
          if (!line) return;
          const [label, ...rest] = line.split(':');
          specs.push({ label: (label || 'Spec').trim(), value: rest.join(':').trim() });
        });
      } catch {}
    }

    const colors = [];
    const colorOption = product.options?.find(opt =>
      opt.name?.toLowerCase().includes('color') || opt.type === 'color'
    );
    if (colorOption?.values) {
      const enabledColorIds = new Set();
      product.variants?.forEach((variant) => {
        if (variant.is_enabled && variant.options) {
          variant.options.forEach(optionId => {
            const cv = colorOption.values.find(c => c.id === optionId);
            if (cv) enabledColorIds.add(optionId);
          });
        }
      });
      colorOption.values.forEach(cv => {
        if (enabledColorIds.has(cv.id) && cv.title) {
          colors.push({
            name: cv.title,
            class: getColorClass(cv.title),
            hex: cv.colors?.[0] || null,
          });
        }
      });
    }

    function getColorClass(colorName) {
      const map = {
        'White': 'bg-white border-2 border-gray-300',
        'Black': 'bg-black',
        'Red': 'bg-red-500',
        'Blue': 'bg-blue-500',
        'Royal': 'bg-blue-600',
        'Navy': 'bg-blue-900',
        'Light Blue': 'bg-blue-300',
        'Carolina Blue': 'bg-blue-400',
        'Green': 'bg-green-500',
        'Forest Green': 'bg-green-700',
        'Irish Green': 'bg-green-600',
        'Safety Green': 'bg-green-400',
        'Yellow': 'bg-yellow-400',
        'Orange': 'bg-orange-500',
        'Purple': 'bg-purple-500',
        'Pink': 'bg-pink-500',
        'Light Pink': 'bg-pink-300',
        'Gray': 'bg-gray-500',
        'Grey': 'bg-gray-500',
        'Sport Grey': 'bg-gray-400',
        'Ash': 'bg-gray-200',
        'Dark Heather': 'bg-gray-600',
        'Brown': 'bg-yellow-800',
        'Dark Chocolate': 'bg-yellow-900',
        'Maroon': 'bg-red-800',
        'Teal': 'bg-teal-500',
        'Lime': 'bg-lime-500',
        'Cyan': 'bg-cyan-500',
        'Magenta': 'bg-pink-600',
        'Silver': 'bg-gray-400',
        'Gold': 'bg-yellow-600',
      };
      return map[colorName] || 'bg-gray-300';
    }

    return NextResponse.json({
      id: product.id,
      title: product.title,
      description: product.description,
      price,
      tags,
      sizes,
      colors,
      specs,
      images,
      category:
        product.product?.product_type ||
        product.tags?.find((tag) =>
          tag.toLowerCase().includes('long sleeve') ||
          tag.toLowerCase().includes('tee') ||
          tag.toLowerCase().includes('shirt')
        ) || 'Apparel',
      defaultVariantId: defaultVariant?.id || null,
      variants: product.variants || [],
      options: product.options || [],
    });
  } catch (err) {
    console.error('product[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    clearTimeout(timer);
  }
}
