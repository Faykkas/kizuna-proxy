// Côté navigateur : envoie une demande au serveur (/api/requests). Voir SendOutcome.
// En cas d'échec, l'appelant garde son plan B (envoi par email via Formspree).

import { supabase } from "./supabase";

export type SendOutcome = "ok" | "rejected" | "failed";

/** "ok" : enregistrée. "rejected" : refusée (données invalides, trop de demandes) — inutile de réessayer ailleurs. "failed" : panne (réseau/serveur) — plan B. */
export async function postRequest(row: Record<string, unknown>, extra: { website?: string } = {}): Promise<SendOutcome> {
  try {
    let accessToken: string | undefined;
    try {
      accessToken = (await supabase.auth.getSession()).data.session?.access_token;
    } catch {
      /* visiteur non connecté */
    }
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row, accessToken, ...extra }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok === true) return "ok";
    return res.status >= 400 && res.status < 500 ? "rejected" : "failed";
  } catch {
    return "failed";
  }
}
