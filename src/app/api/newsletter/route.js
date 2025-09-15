export const runtime = "nodejs"; // nodemailer needs Node (not Edge)

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // true for 465 (SSL), false for 587/25
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const toAddress = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
    const now = new Date();

    await transporter.sendMail({
      from: `"GiftSip" <${process.env.SMTP_USER}>`, // keep same-domain as SMTP user
      to: toAddress,
      replyTo: email, // reply straight to subscriber
      subject: "New Newsletter Subscription - GiftSip",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#ea580c; border-bottom:2px solid #ea580c; padding-bottom:10px;">
            New Newsletter Subscription
          </h2>
          <div style="background:#f8f9fa; padding:20px; border-radius:8px; margin:20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>When:</strong> ${now.toLocaleString()}</p>
            <p style="margin-top:16px; color:#555;">
              Submitted from the GiftSip website footer.
            </p>
          </div>
        </div>
      `,
      text: `New subscription from ${email} at ${now.toLocaleString()}`,
    });

    return NextResponse.json(
      { message: "Newsletter subscription successful" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Newsletter error:", err);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}
