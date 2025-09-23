import { NextResponse } from "next/server";

export const runtime = "nodejs";          // needed for Buffer
export const dynamic = "force-dynamic";   // don't static-optimize this route

const base = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

/** Get OAuth token */
async function ppAccessToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!id || !secret) throw new Error("Missing PayPal credentials");

  const auth = Buffer.from(`${id}:${secret}`).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${errText}`);
  }

  const json = await res.json();
  return json.access_token;
}

/** Capture order */
async function ppCaptureOrder(orderID) {
  const token = await ppAccessToken();

  const res = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,   // ✅ must be Bearer
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PayPal capture failed: ${res.status} ${errText}`);
  }

  return res.json();
}

export async function POST(req) {
  try {
    const { orderID } = await req.json();
    if (!orderID || typeof orderID !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid orderID" },
        { status: 400 }
      );
    }

    const data = await ppCaptureOrder(orderID);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message ?? "Capture failed" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { error: "Use POST for capture" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
