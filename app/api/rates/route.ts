import { NextResponse } from "next/server";

// Taux de change JPY → monnaies du monde (open.er-api.com, gratuit, mis à jour une fois par jour) + pays du visiteur
// (en-tête Vercel). Les taux sont mis en cache 6 h côté serveur ; la réponse dépend du visiteur, donc privée côté navigateur.

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const country = (req.headers.get("x-vercel-ip-country") || "").toUpperCase() || null;
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/JPY", { next: { revalidate: 21600 } });
    const j = await r.json();
    if (j?.result !== "success" || !j.rates) throw new Error("bad rates");
    return NextResponse.json(
      { rates: j.rates, updated: j.time_last_update_utc || null, country },
      { headers: { "Cache-Control": "private, max-age=1800" } }
    );
  } catch {
    // Sans taux, la page reste en yens (aucun montant converti n'est affiché).
    return NextResponse.json({ rates: null, updated: null, country }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
