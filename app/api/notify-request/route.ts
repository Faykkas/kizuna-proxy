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

    const {
      name, email, country, items, budget, contact, quantity, purchaseType, deadline, partialOk,
      // Business sourcing form only — absent on the consumer request form
      leadType, businessName, businessWebsite, businessType, productCategory,
      recurringSourcing, contactPlatform, discoverySource,
      utmSource, utmMedium, utmCampaign, utmContent, utmTerm,
    } = await request.json();

    const isBusiness = leadType === "business";

    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: "Kizuna Proxy <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL || "kizunaproxy@gmail.com",
      subject: isBusiness
        ? `Nouvelle demande B2B — ${businessName || name || email}`
        : `Nouvelle requête — ${name || email}`,
      text: [
        `De : ${name || "—"} <${email}>`,
        `Pays : ${country || "—"}`,
        isBusiness ? `Entreprise : ${businessName || "—"}` : null,
        isBusiness && businessWebsite ? `Site / profil : ${businessWebsite}` : null,
        isBusiness && businessType ? `Type d'entreprise : ${businessType}` : null,
        isBusiness && productCategory ? `Catégorie produit : ${productCategory}` : null,
        isBusiness && contactPlatform ? `Plateforme de contact préférée : ${contactPlatform}` : null,
        isBusiness && recurringSourcing ? `Sourcing récurrent : ${recurringSourcing}` : null,
        isBusiness && discoverySource ? `Découvert via : ${discoverySource}` : null,
        !isBusiness && quantity ? `Quantité : ${quantity}` : null,
        !isBusiness && purchaseType ? `Type d'achat : ${purchaseType === "visit" ? "Visite en boutique" : "Achat en ligne"}` : null,
        isBusiness && quantity ? `Quantités souhaitées : ${quantity}` : null,
        deadline ? `Date limite : ${deadline}` : null,
        budget ? `Budget : ${budget}` : null,
        contact ? `Contact préféré : ${contact}` : null,
        `Envoi partiel accepté : ${partialOk ? "Oui" : "Non"}`,
        (utmSource || utmMedium || utmCampaign || utmContent || utmTerm)
          ? `UTM : source=${utmSource || "—"} medium=${utmMedium || "—"} campaign=${utmCampaign || "—"} content=${utmContent || "—"} term=${utmTerm || "—"}`
          : null,
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
