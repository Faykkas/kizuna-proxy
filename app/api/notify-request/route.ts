// @ts-nocheck
// app/api/notify-request/route.ts
//
// Fires an email to the business owner whenever a new request comes in.
// Called from RequestForm.tsx right after the request is saved — best
// effort only: if this fails, the request itself is already safely in the
// database, so we log and move on rather than surface an error to the
// customer.
//
// Environment variables required (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY   from resend.com → API Keys
//   NOTIFY_EMAIL     where the notification should land (defaults to the
//                    Resend account's own address if not verified for a
//                    custom domain — the "from" below uses their test
//                    sender, which only delivers to that account's email)

import { Resend } from "resend";

export async function POST(request) {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.error("RESEND_API_KEY not configured — skipping notification email");
      return Response.json({ ok: false }, { status: 503 });
    }

    const { name, email, country, items, budget, contact } = await request.json();

    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: "Kizuna Proxy <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL || "kizunaproxy@gmail.com",
      subject: `Nouvelle requête — ${name || email}`,
      text: [
        `De : ${name || "—"} <${email}>`,
        `Pays : ${country || "—"}`,
        budget ? `Budget : ${budget}` : null,
        contact ? `Contact préféré : ${contact}` : null,
        "",
        items || "",
      ].filter(Boolean).join("\n"),
    });

    if (error) {
      console.error("Resend send failed:", error);
      return Response.json({ ok: false }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("notify-request route error:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
