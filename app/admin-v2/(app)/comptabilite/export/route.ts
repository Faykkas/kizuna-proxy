import { requireAccess } from "../../../lib/access";
import { createServerSupabase } from "../../../lib/supabase-server";
import { getL } from "../../../lib/lang-server";
import { buildReceipts, entityOn, receiptsToCsv } from "../../../lib/accounting";
import { loadEntitiesSafe, loadPaidLinksForJournal } from "../../../lib/queriesAccounting";

// Export CSV du journal des encaissements, pour le comptable.
//   /admin-v2/comptabilite/export?mois=2026-10   → un mois
//   /admin-v2/comptabilite/export?annee=2026     → une année
// Réservé aux administrateurs (contrôle côté serveur, comme toutes les pages). Rien n'est écrit en base.

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await requireAccess({ adminOnly: true });
  const url = new URL(request.url);
  const mois = url.searchParams.get("mois") ?? "";
  const annee = url.searchParams.get("annee") ?? "";

  let prefix: string;
  if (/^\d{4}-\d{2}$/.test(mois)) prefix = mois;
  else if (/^\d{4}$/.test(annee)) prefix = annee;
  else return new Response("Paramètre manquant : mois=AAAA-MM ou annee=AAAA", { status: 400 });

  const sb = await createServerSupabase();
  const [links, entities] = await Promise.all([loadPaidLinksForJournal(sb), loadEntitiesSafe(sb)]);
  const receipts = buildReceipts(links).filter((r) => r.dateJst.startsWith(prefix));
  const { t } = await getL(); // en-têtes et libellés dans la langue choisie (japonais pour le comptable)
  const csv = receiptsToCsv(receipts, (d) => entityOn(d, entities), t);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kizuna-journal-${prefix}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
