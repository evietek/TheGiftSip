import { NextResponse } from "next/server";

export const runtime = "nodejs";          // needed for Buffer
export const dynamic = "force-dynamic";   // don't static-optimize this route

async function ppCaptureOrder(orderID) {
  const base = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

  const res = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
        ).toString("base64"),
      "Content-Type": "application/json", // ok to include, but body must be empty
    },
    // IMPORTANT: no body for capture (don’t send {}).
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

// Optional: block GETs explicitly
export function GET() {
  return NextResponse.json(
    { error: "Use POST for capture" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
