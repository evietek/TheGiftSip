export async function ppCaptureOrder(orderID) {
  const base = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

  const res = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(
        process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET
      ).toString("base64")}`,
      "Content-Type": "application/json", // still ok to include
    },
    body: null, // ❌ must not send `{}` or any body
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal capture failed: ${res.status} ${err}`);
  }

  return res.json();
}
