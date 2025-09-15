import { NextResponse } from 'next/server';

// Comprehensive shipping rates based on destination and weight
const SHIPPING_RATES = {
  // North America
  US: { standard: 5.99, express: 12.99, overnight: 24.99, currency: 'USD' },
  CA: { standard: 8.99, express: 16.99, overnight: 34.99, currency: 'CAD' },
  MX: { standard: 12.99, express: 19.99, overnight: 39.99, currency: 'MXN' },
  
  // Europe
  GB: { standard: 8.99, express: 14.99, overnight: 29.99, currency: 'GBP' },
  DE: { standard: 9.99, express: 15.99, overnight: 31.99, currency: 'EUR' },
  FR: { standard: 9.99, express: 15.99, overnight: 31.99, currency: 'EUR' },
  IT: { standard: 9.99, express: 15.99, overnight: 31.99, currency: 'EUR' },
  ES: { standard: 9.99, express: 15.99, overnight: 31.99, currency: 'EUR' },
  NL: { standard: 8.99, express: 14.99, overnight: 29.99, currency: 'EUR' },
  BE: { standard: 8.99, express: 14.99, overnight: 29.99, currency: 'EUR' },
  AT: { standard: 9.99, express: 15.99, overnight: 31.99, currency: 'EUR' },
  CH: { standard: 12.99, express: 19.99, overnight: 39.99, currency: 'CHF' },
  SE: { standard: 11.99, express: 18.99, overnight: 37.99, currency: 'SEK' },
  NO: { standard: 11.99, express: 18.99, overnight: 37.99, currency: 'NOK' },
  DK: { standard: 9.99, express: 15.99, overnight: 31.99, currency: 'DKK' },
  FI: { standard: 9.99, express: 15.99, overnight: 31.99, currency: 'EUR' },
  PL: { standard: 7.99, express: 12.99, overnight: 24.99, currency: 'PLN' },
  CZ: { standard: 7.99, express: 12.99, overnight: 24.99, currency: 'CZK' },
  HU: { standard: 7.99, express: 12.99, overnight: 24.99, currency: 'HUF' },
  PT: { standard: 8.99, express: 14.99, overnight: 29.99, currency: 'EUR' },
  IE: { standard: 8.99, express: 14.99, overnight: 29.99, currency: 'EUR' },
  
  // Asia Pacific
  AU: { standard: 12.99, express: 19.99, overnight: 39.99, currency: 'AUD' },
  NZ: { standard: 13.99, express: 21.99, overnight: 43.99, currency: 'NZD' },
  JP: { standard: 11.99, express: 18.99, overnight: 37.99, currency: 'JPY' },
  KR: { standard: 10.99, express: 16.99, overnight: 33.99, currency: 'KRW' },
  SG: { standard: 9.99, express: 15.99, overnight: 31.99, currency: 'SGD' },
  HK: { standard: 9.99, express: 15.99, overnight: 31.99, currency: 'HKD' },
  TW: { standard: 10.99, express: 16.99, overnight: 33.99, currency: 'TWD' },
  TH: { standard: 8.99, express: 14.99, overnight: 29.99, currency: 'THB' },
  MY: { standard: 8.99, express: 14.99, overnight: 29.99, currency: 'MYR' },
  ID: { standard: 7.99, express: 12.99, overnight: 24.99, currency: 'IDR' },
  PH: { standard: 7.99, express: 12.99, overnight: 24.99, currency: 'PHP' },
  VN: { standard: 7.99, express: 12.99, overnight: 24.99, currency: 'VND' },
  IN: { standard: 6.99, express: 11.99, overnight: 23.99, currency: 'INR' },
  CN: { standard: 8.99, express: 14.99, overnight: 29.99, currency: 'CNY' },
  
  // Middle East & Africa
  AE: { standard: 11.99, express: 18.99, overnight: 37.99, currency: 'AED' },
  SA: { standard: 10.99, express: 16.99, overnight: 33.99, currency: 'SAR' },
  IL: { standard: 10.99, express: 16.99, overnight: 33.99, currency: 'ILS' },
  ZA: { standard: 9.99, express: 15.99, overnight: 31.99, currency: 'ZAR' },
  EG: { standard: 7.99, express: 12.99, overnight: 24.99, currency: 'EGP' },
  NG: { standard: 7.99, express: 12.99, overnight: 24.99, currency: 'NGN' },
  KE: { standard: 7.99, express: 12.99, overnight: 24.99, currency: 'KES' },
  
  // South America
  BR: { standard: 9.99, express: 15.99, overnight: 31.99, currency: 'BRL' },
  AR: { standard: 8.99, express: 14.99, overnight: 29.99, currency: 'ARS' },
  CL: { standard: 8.99, express: 14.99, overnight: 29.99, currency: 'CLP' },
  CO: { standard: 7.99, express: 12.99, overnight: 24.99, currency: 'COP' },
  PE: { standard: 7.99, express: 12.99, overnight: 24.99, currency: 'PEN' },
  UY: { standard: 8.99, express: 14.99, overnight: 29.99, currency: 'UYU' },
  
  // Default for other countries
  INTERNATIONAL: { standard: 15.99, express: 24.99, overnight: 49.99, currency: 'USD' }
};

// Weight estimates for different product types (in pounds)
const PRODUCT_WEIGHTS = {
  't-shirt': 0.5,
  'hoodie': 1.0,
  'mug': 1.2,
  'poster': 0.3,
  'sticker': 0.1,
  'default': 0.5
};

function getCountryCode(country) {
  if (country && country.length === 2) return country.toUpperCase();
  const map = { 
    'United States': 'US', 'United States of America': 'US', 'USA': 'US',
    'Canada': 'CA', 'United Kingdom': 'GB', 'UK': 'GB', 'Great Britain': 'GB',
    'Germany': 'DE', 'France': 'FR', 'Italy': 'IT', 'Spain': 'ES',
    'Netherlands': 'NL', 'Belgium': 'BE', 'Austria': 'AT', 'Switzerland': 'CH',
    'Sweden': 'SE', 'Norway': 'NO', 'Denmark': 'DK', 'Finland': 'FI',
    'Poland': 'PL', 'Czech Republic': 'CZ', 'Hungary': 'HU', 'Portugal': 'PT',
    'Ireland': 'IE', 'Australia': 'AU', 'New Zealand': 'NZ', 'Japan': 'JP',
    'South Korea': 'KR', 'Singapore': 'SG', 'Hong Kong': 'HK', 'Taiwan': 'TW',
    'Thailand': 'TH', 'Malaysia': 'MY', 'Indonesia': 'ID', 'Philippines': 'PH',
    'Vietnam': 'VN', 'India': 'IN', 'China': 'CN', 'United Arab Emirates': 'AE',
    'Saudi Arabia': 'SA', 'Israel': 'IL', 'South Africa': 'ZA', 'Egypt': 'EG',
    'Nigeria': 'NG', 'Kenya': 'KE', 'Brazil': 'BR', 'Argentina': 'AR',
    'Chile': 'CL', 'Colombia': 'CO', 'Peru': 'PE', 'Uruguay': 'UY', 'Mexico': 'MX'
  };
  return map[country] || 'INTERNATIONAL';
}

function estimateProductWeight(productTitle) {
  const title = productTitle.toLowerCase();
  if (title.includes('t-shirt') || title.includes('tshirt')) return PRODUCT_WEIGHTS['t-shirt'];
  if (title.includes('hoodie') || title.includes('sweatshirt')) return PRODUCT_WEIGHTS['hoodie'];
  if (title.includes('mug') || title.includes('cup')) return PRODUCT_WEIGHTS['mug'];
  if (title.includes('poster') || title.includes('print')) return PRODUCT_WEIGHTS['poster'];
  if (title.includes('sticker') || title.includes('decals')) return PRODUCT_WEIGHTS['sticker'];
  return PRODUCT_WEIGHTS['default'];
}

function calculateShippingCost(items, country) {
  const countryCode = getCountryCode(country);
  const rates = SHIPPING_RATES[countryCode] || SHIPPING_RATES.INTERNATIONAL;

  // Calculate total weight
  const totalWeight = items.reduce((total, item) => {
    const itemWeight = estimateProductWeight(item.title);
    return total + (itemWeight * item.quantity);
  }, 0);

  // Determine shipping method based on weight and destination
  let shippingMethod = 'standard';
  let cost = rates.standard;

  if (totalWeight > 2 || countryCode === 'INTERNATIONAL') {
    shippingMethod = 'express';
    cost = rates.express;
  }
  if (totalWeight > 5) {
    shippingMethod = 'overnight';
    cost = rates.overnight;
  }

  return {
    method: shippingMethod,
    cost,
    // Force USD regardless of country
    currency: 'USD',
    estimatedDays: getEstimatedDays(shippingMethod, countryCode),
    weight: totalWeight,
    countryCode
  };
}

function getEstimatedDays(method, countryCode) {
  const deliveryTimes = {
    US: { standard: '3-5', express: '1-2', overnight: '1' },
    CA: { standard: '5-7', express: '2-3', overnight: '1-2' },
    GB: { standard: '7-10', express: '3-5', overnight: '1-2' },
    INTERNATIONAL: { standard: '10-14', express: '5-7', overnight: '2-3' }
  };
  return deliveryTimes[countryCode]?.[method] || deliveryTimes.INTERNATIONAL[method];
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { items, country, address, city, state, zipCode } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }
    if (!country) {
      return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }
    if (!address || !city || !state || !zipCode) {
      return NextResponse.json({
        error: 'Complete address required for shipping calculation',
        requiresAddress: true
      }, { status: 400 });
    }

    // Calculate shipping cost
    const shippingInfo = calculateShippingCost(items, country);

    // Add some randomness to simulate real API behavior
    const baseCost = shippingInfo.cost;
    const variation = baseCost * 0.1; // ±10%
    const finalCost = baseCost + (Math.random() - 0.5) * variation;

    return NextResponse.json({
      success: true,
      shipping: {
        method: shippingInfo.method,
        cost: Math.round(finalCost * 100) / 100,
        // Force USD in the response
        currency: 'USD',
        estimatedDays: shippingInfo.estimatedDays,
        weight: Math.round(shippingInfo.weight * 10) / 10,
        country,
        countryCode: shippingInfo.countryCode,
        address: { address, city, state, zipCode, country }
      }
    });
  } catch (error) {
    console.error('Shipping quote error:', error);
    return NextResponse.json({
      error: 'Failed to calculate shipping cost',
      details: error.message
    }, { status: 500 });
  }
}
