// @ts-nocheck
// app/api/notify-waitlist/route.ts
//
// Fires an email to the business owner whenever someone joins the Kizuna
// Box waitlist. Called from BoxClient.tsx right after the email is saved —
// best effort only: if this fails, the signup itself is already safely in
// the database, so we log and move on rather than surface an error.
//
// Environment variables required (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY   from resend.com → API Keys
//   NOTIFY_EMAIL     where the notification should land

import { Resend } from "resend";

export async function POST(request) {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.error("RESEND_API_KEY not configured — skipping notification email");
      return Response.json({ ok: false }, { status: 503 });
    }

    const { email } = await request.json();

    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: "Kizuna Proxy <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL || "kizunaproxy@gmail.com",
      subject: `Kizuna Box — new waitlist signup`,
      text: `${email} just joined the Kizuna Box waitlist.`,
    });

    if (error) {
      console.error("Resend send failed:", error);
      return Response.json({ ok: false }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("notify-waitlist route error:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
