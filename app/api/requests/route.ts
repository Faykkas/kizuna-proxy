import { createClient } from "@supabase/supabase-js";
import { cleanRequest, type RequestRow } from "../../lib/requestIntake";
import { notifyOwner } from "../../lib/notifyRequest";

// Réception des demandes du site (formulaire complet, mini-formulaire, formulaire business).
// Ordre voulu : 1) contrôler, 2) ENREGISTRER (source de vérité), 3) prévenir (Discord + email), 4) répondre.
// Une panne de notification ne fait jamais perdre la demande ; une panne d'enregistrement renvoie une erreur
// au navigateur, qui bascule alors sur l'envoi par email (Formspree) — voir app/lib/sendRequest.ts.

export const runtime = "nodejs";

const MAX_BODY = 30_000;
const PER_EMAIL_PER_HOUR = 5;

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return Response.json({ ok: false, error: "Message trop long." }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  // Champ piège : un humain ne le voit pas. On répond « ok » pour ne rien apprendre aux robots, sans rien enregistrer.
  if (typeof body.website === "string" && body.website) return Response.json({ ok: true });
  if (typeof body.company_website === "string" && body.company_website) return Response.json({ ok: true });

  const cleaned = cleanRequest(body.row);
  if (!cleaned.ok) return Response.json({ ok: false, error: cleaned.error }, { status: 400 });
  const row: RequestRow = cleaned.row;

  const db = admin();
  if (!db) {
    console.error("requests: SUPABASE_SECRET_KEY manquante");
    return Response.json({ ok: false, error: "Service indisponible." }, { status: 503 });
  }

  // Client connecté : on retrouve son compte à partir de sa session (jamais à partir d'un identifiant envoyé tel quel).
  if (typeof body.accessToken === "string" && body.accessToken) {
    const { data } = await db.auth.getUser(body.accessToken);
    if (data?.user) row.customer_id = data.user.id;
  }

  // Limites : pas plus de N demandes par email et par heure ; une même demande envoyée deux fois d'affilée n'est gardée qu'une fois.
  const since = (ms: number) => new Date(Date.now() - ms).toISOString();
  const { data: recent, error: recentErr } = await db
    .from("requests")
    .select("id,items,created_at")
    .eq("email", row.email)
    .gte("created_at", since(3_600_000))
    .order("created_at", { ascending: false })
    .limit(PER_EMAIL_PER_HOUR + 1);
  if (!recentErr && recent) {
    const duplicate = recent.find((r) => r.items === row.items && Date.parse(r.created_at) > Date.now() - 600_000);
    if (duplicate) return Response.json({ ok: true, id: duplicate.id, duplicate: true });
    if (recent.length >= PER_EMAIL_PER_HOUR) return Response.json({ ok: false, error: "Trop de demandes, réessayez plus tard." }, { status: 429 });
  }

  const { data, error } = await db.from("requests").insert(row).select("id").single();
  if (error || !data) {
    console.error("requests insert failed:", error);
    return Response.json({ ok: false, error: "Enregistrement impossible." }, { status: 500 });
  }

  const notified = await notifyOwner(row); // ne lève jamais d'erreur
  if (notified.discord === "failed" && notified.email === "failed") {
    console.error("requests: demande", data.id, "enregistrée mais AUCUNE notification n'est partie");
  }

  return Response.json({ ok: true, id: data.id });
}
