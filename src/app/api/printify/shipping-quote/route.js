import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------ Regions ------------ */
const EU_CODES = new Set([
  "IE","DE","FR","IT","ES","NL","BE","AT","SE","NO","DK","FI","PL","CZ","HU",
  "PT","RO","SK","SI","HR","EE","LV","LT","GR","BG","LU","MT","CY"
]);

function regionFor(countryCode) {
  if (countryCode === "US") return "US";
  if (countryCode === "CA") return "CA";
  if (countryCode === "GB") return "GB";
  if (countryCode === "AU" || countryCode === "NZ") return "AU_NZ";
  if (EU_CODES.has(countryCode)) return "EU";
  return "ROW";
}

/* ------------ Country normalize (CRITICAL) ------------ */
function toCC(country) {
  if (!country) return "US";
  const s = String(country).trim();

  // If already ISO-2
  if (s.length === 2) {
    const up = s.toUpperCase();
    if (up === "UK") return "GB"; // normalize UK → GB
    return up;
  }

  const norm = s.toLowerCase();
  const map = {
    "united kingdom": "GB",
    "uk": "GB",
    "great britain": "GB",
    "britain": "GB",
    "england": "GB",
    "scotland": "GB",
    "wales": "GB",
    "northern ireland": "GB",

    "united states": "US",
    "united states of america": "US",
    "usa": "US",
    "canada": "CA",
    "australia": "AU",
    "new zealand": "NZ",
  };

  return map[norm] || "ROW";
}
/* ------------ Highest-safe Standard rates (USD) ------------ */
// Shirts
const SHIRT = {
  US:    { first: 5.89, add: 2.99, eta: "2-5" },
  CA:    { first: 9.39, add: 4.39, eta: "10-30" },
  GB:    { first: 5.49, add: 1.99, eta: "2-5" },
  EU:    { first: 7.79, add: 2.99, eta: "5-15" },
  AU_NZ: { first: 12.49, add: 4.99, eta: "10-30" },
  ROW:   { first: 10.00, add: 4.00, eta: "10-30" },
};
// Mugs 11oz
const MUG11 = {
  US:    { first: 6.99, add: 2.99, eta: "2-8" },
  CA:    { first: 14.89, add: 6.09, eta: "10-30" },
  GB:    { first: 21.19, add: 7.99, eta: "10-30" },
  EU:    { first: 21.19, add: 7.99, eta: "10-30" },
  AU_NZ: { first: 21.19, add: 7.99, eta: "10-30" },
  ROW:   { first: 21.19, add: 7.99, eta: "10-30" },
};
// Mugs 15oz
const MUG15 = {
  US:    { first: 8.99, add: 3.99, eta: "2-8" },
  CA:    { first: 14.89, add: 7.49, eta: "10-30" },
  GB:    { first: 21.19, add: 8.79, eta: "10-30" },
  EU:    { first: 21.19, add: 8.79, eta: "10-30" },
  AU_NZ: { first: 21.19, add: 8.79, eta: "10-30" },
  ROW:   { first: 21.19, add: 8.79, eta: "10-30" },
};

/* ------------ Helpers ------------ */
function isShirt(item) {
  const t = `${item.title || item.name || ""}`.toLowerCase();
  return t.includes("t-shirt") || t.includes("tshirt") || t.includes("tee") || t.includes("shirt");
}
function isMug(item) {
  return `${item.title || item.name || ""}`.toLowerCase().includes("mug");
}
function mugSize(item) {
  const t = `${item.title || item.name || ""}`.toLowerCase();
  const s = `${item.size || item.variant_title || ""}`.toLowerCase();
  if (t.includes("15") || s.includes("15")) return "MUG15";
  return "MUG11";
}
function firstAddTotal(rate, qty) {
  return rate.first + Math.max(0, qty - 1) * rate.add;
}
function slowestEta(a, b) {
  const ua = Number((a.split("-")[1] || a).replace(/\D/g, "")) || 0;
  const ub = Number((b.split("-")[1] || b).replace(/\D/g, "")) || 0;
  return ub > ua ? b : a;
}

/* ------------ Route ------------ */
export async function POST(req) {
  try {
    const body = await req.json();

    // Accept flat or nested; accept code or name
    const items = body?.items;
    const countryInput =
      body?.countryCode ||
      body?.address?.countryCode ||
      body?.country ||
      body?.address?.country;

    const address = body?.address || body?.address1 || body?.address?.address || body?.address_line1 || body?.address;
    const city    = body?.city || body?.address?.city;
    const state   = body?.state || body?.address?.region || body?.address?.state;
    const zip     = body?.zip || body?.zipCode || body?.address?.zip || body?.address?.postalCode;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }
    if (!countryInput || !address || !city || !state || !zip) {
      return NextResponse.json({ error: "Full address + country required" }, { status: 400 });
    }

    const cc = toCC(countryInput);
    const region = regionFor(cc);

    // DEBUG: see mapping in logs
    console.log("[shipping-quote] countryIn:", countryInput, "→ cc:", cc, "→ region:", region);

    // Count items
    let shirtQty = 0, mug11Qty = 0, mug15Qty = 0;
    for (const it of items) {
      const q = Math.max(1, Number(it.quantity) || 1);
      if (isShirt(it)) shirtQty += q;
      else if (isMug(it)) (mugSize(it) === "MUG15" ? (mug15Qty += q) : (mug11Qty += q));
    }

    let total = 0;
    let eta = "10-30";

    if (shirtQty > 0) {
      const r = SHIRT[region];
      total += firstAddTotal(r, shirtQty);
      eta = slowestEta(eta, r.eta);
    }
    if (mug11Qty > 0) {
      const r = MUG11[region];
      total += firstAddTotal(r, mug11Qty);
      eta = slowestEta(eta, r.eta);
    }
    if (mug15Qty > 0) {
      const r = MUG15[region];
      total += firstAddTotal(r, mug15Qty);
      eta = slowestEta(eta, r.eta);
    }

    return NextResponse.json({
      success: true,
      shipping: {
        method: "standard",
        cost: Math.round(total * 100) / 100,
        currency: "USD",
        estimatedDays: eta,
        region,
        countryCode: cc,
        address: { address, city, state, zip, country: countryInput },
        notes: "Standard shipping only. No auto-upgrade.",
      },
    });
  } catch (err) {
    console.error("shipping-quote error:", err);
    return NextResponse.json({ error: "Failed shipping quote", details: err?.message }, { status: 500 });
  }
}
