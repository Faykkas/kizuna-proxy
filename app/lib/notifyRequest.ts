import "server-only";
import { Resend } from "resend";
import { discordPayload, originOf, type RequestRow } from "./requestIntake";

// Prévient le propriétaire d'une nouvelle demande, par DEUX canaux indépendants :
//   - Discord (variable DISCORD_WEBHOOK_URL) : message instantané sur le téléphone ;
//   - email (RESEND_API_KEY, NOTIFY_EMAIL) : comme avant.
// Chaque canal est tenté séparément et ne bloque jamais l'autre. La demande est déjà enregistrée en base
// quand on arrive ici : un échec de notification ne la perd pas (elle reste visible dans l'admin, page « Demandes »).

const ADMIN_URL = "https://kizunaproxy.com/admin-v2/demandes";
const TIMEOUT_MS = 5000;

export type NotifyResult = { discord: "sent" | "skipped" | "failed"; email: "sent" | "skipped" | "failed" };

async function viaDiscord(row: RequestRow): Promise<NotifyResult["discord"]> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return "skipped";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload(row, ADMIN_URL)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) console.error("Discord webhook refused:", res.status);
    return res.ok ? "sent" : "failed";
  } catch (e) {
    console.error("Discord webhook error:", e);
    return "failed";
  }
}

async function viaEmail(row: RequestRow): Promise<NotifyResult["email"]> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return "skipped";
  try {
    const business = row.lead_type === "business";
    const { error } = await new Resend(key).emails.send({
      from: "Kizuna Proxy <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL || "kizunaproxy@gmail.com",
      replyTo: row.email,
      subject: business ? `Nouvelle demande B2B — ${row.business_name || row.name}` : `Nouvelle requête — ${row.name}`,
      text: [
        `De : ${row.name} <${row.email}>`,
        `Pays : ${row.country || "—"}`,
        business ? `Entreprise : ${row.business_name || "—"}` : null,
        row.quantity ? `Quantité : ${row.quantity}` : null,
        row.deadline ? `Date limite : ${row.deadline}` : null,
        row.budget ? `Budget : ${row.budget}` : null,
        row.notes ? `Notes : ${row.notes}` : null,
        `Origine : ${originOf(row)}`,
        "",
        row.items,
        "",
        `Voir et traiter dans l'admin : ${ADMIN_URL}`,
      ].filter((l) => l !== null).join("\n"),
    });
    if (error) console.error("Resend send failed:", error);
    return error ? "failed" : "sent";
  } catch (e) {
    console.error("Resend error:", e);
    return "failed";
  }
}

export async function notifyOwner(row: RequestRow): Promise<NotifyResult> {
  const [discord, email] = await Promise.all([viaDiscord(row), viaEmail(row)]);
  return { discord, email };
}
