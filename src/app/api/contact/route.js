// app/api/contact/route.js (or route.ts with types)
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request) {
  try {
    const { name, email, subject, message, inquiryType } = await request.json();

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Hostinger SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // Hostinger prefers 465 + SSL
      auth: {
        user: process.env.SMTP_USER, // e.g. contact@yourdomain.com
        pass: process.env.SMTP_PASS, // mailbox password or app password
      },
    });

    // Optional: quick sanity check
    await transporter.verify();

    const safeMsg = escapeHtml(message).replace(/\n/g, '<br>');
    const safeName = escapeHtml(name);
    const safeSubject = escapeHtml(subject);
    const safeInquiry = escapeHtml(inquiryType || 'General Inquiry');

    // Enhanced email template with your brand colors and modern design
    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="x-apple-disable-message-reformatting">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact</title>
      </head>
      <body style="margin:0;padding:0;background:#F6F7F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <!-- Preheader (hidden) -->
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          New message from your website contact form.
        </div>
    
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F6F7F9;">
          <tr>
            <td align="center" style="padding:24px 16px;">
              <!-- Card -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;background:#FFFFFF;border:1px solid #ECEFF3;border-radius:14px;overflow:hidden;">
                <!-- Top bar -->
                <tr>
                  <td style="height:6px;background:#EA580C;"></td>
                </tr>
    
                <!-- Header -->
                <tr>
                  <td style="padding:22px 24px 8px 24px;">
                    <div style="font-weight:700;font-size:20px;color:#0F172A;margin:0;">New Contact Form Submission</div>
                    <div style="font-weight:500;font-size:13px;color:#64748B;margin-top:4px;">You’ve received a new message from your site.</div>
                  </td>
                </tr>
    
                <!-- Subject -->
                <tr>
                  <td style="padding:8px 24px 0 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF;border:1px solid #F1F5F9;border-radius:10px;">
                      <tr>
                        <td style="padding:14px 16px;">
                          <div style="font-weight:700;font-size:12px;color:#EA580C;letter-spacing:.02em;text-transform:uppercase;margin-bottom:6px;">Subject</div>
                          <div style="font-weight:600;font-size:16px;color:#111827;line-height:1.4;">${safeSubject}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
    
                <!-- Details -->
                <tr>
                  <td style="padding:12px 24px 0 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 8px;">
                      <tr>
                        <td style="background:#FAFBFC;border:1px solid #EDF2F7;border-radius:10px;padding:12px 14px;">
                          <div style="font-weight:600;font-size:14px;color:#0F172A;">${safeName}</div>
                          <div style="font-weight:500;font-size:12px;color:#64748B;margin-top:2px;">Name</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background:#FAFBFC;border:1px solid #EDF2F7;border-radius:10px;padding:12px 14px;">
                          <a href="mailto:${escapeHtml(email)}" style="font-weight:600;font-size:14px;color:#EA580C;text-decoration:none;">${escapeHtml(email)}</a>
                          <div style="font-weight:500;font-size:12px;color:#64748B;margin-top:2px;">Email</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background:#FAFBFC;border:1px solid #EDF2F7;border-radius:10px;padding:12px 14px;">
                          <span style="display:inline-block;background:#FEF3C7;color:#92400E;border-radius:8px;padding:4px 8px;font-weight:700;font-size:12px;">${safeInquiry}</span>
                          <div style="font-weight:500;font-size:12px;color:#64748B;margin-top:6px;">Inquiry Type</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
    
                <!-- Message -->
                <tr>
                  <td style="padding:12px 24px 0 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF;border:1px solid #F1F5F9;border-radius:10px;">
                      <tr>
                        <td style="padding:14px 16px;">
                          <div style="font-weight:700;font-size:12px;color:#0F172A;margin-bottom:8px;">Message</div>
                          <div style="background:#FAFBFC;border-left:4px solid #EA580C;border-radius:6px;padding:12px 14px;">
                            <div style="font-weight:400;font-size:14px;color:#334155;line-height:1.6;">${safeMsg}</div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
    
                <!-- CTA -->
                <tr>
                  <td align="center" style="padding:18px 24px 10px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td bgcolor="#EA580C" style="border-radius:10px;">
                          <a href="mailto:${escapeHtml(email)}?subject=${encodeURIComponent('Re: ' + (subject || 'Your message'))}"
                             style="display:inline-block;padding:12px 22px;font-weight:700;font-size:14px;color:#FFFFFF;text-decoration:none;border-radius:10px;background:#EA580C;">
                            Reply to ${safeName}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
    
                <!-- Footer -->
                <tr>
                  <td style="padding:6px 24px 22px 24px;border-top:1px solid #ECEFF3;">
                    <div style="text-align:center;font-weight:700;font-size:14px;color:#0F172A;">GiftSip</div>
                    <div style="text-align:center;font-weight:500;font-size:12px;color:#64748B;margin-top:4px;">Sent from your website contact form</div>
                    <div style="text-align:center;font-weight:500;font-size:12px;color:#94A3B8;margin-top:2px;">
                      ${new Date().toLocaleString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </td>
                </tr>
              </table>
              <!-- /Card -->
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;
    

    // Enhanced plain text version
    const text = `NEW CONTACT — GiftSip

    Subject:
    ${subject}
    
    From:
    ${name} <${email}>
    
    Inquiry Type:
    ${inquiryType || 'General Inquiry'}
    
    Message:
    ${message}
    
    —
    Sent via the GiftSip contact form on ${new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })}.
    Reply to ${name} by responding to this email.`;
    

    const mailOptions = {
      from: `${process.env.MAIL_FROM_NAME || 'GiftSip'} <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER, // your receiving inbox
      subject: `🎁 New Contact: ${subject}`,
      html,
      text,
      replyTo: email, // lets you reply directly to the sender
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}