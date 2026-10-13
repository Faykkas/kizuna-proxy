// Champs modifiables d'une commande et leur validation (côté serveur).
//
// Liste blanche : seuls ces champs peuvent être écrits depuis l'admin-v2. Les valeurs viennent du
// navigateur, donc rien n'est pris tel quel : types, longueurs, formats et statuts sont vérifiés.
// Sans dépendance, testable seul.

export const ORDER_STATUSES = [
  "Pending",
  "Purchasing",
  "Awaiting Event",
  "Purchased",
  "Seller Shipped",
  "Received in Japan",
  "Photos Uploaded",
  "Packing",
  "Awaiting Shipping Payment",
  "Shipped",
  "Delivered",
  "Action Required",
  "Cancelled",
];

type Kind = "text" | "longtext" | "email" | "int" | "bool" | "date" | "status" | "uuid";

const FIELDS: Record<string, { kind: Kind; max?: number }> = {
  client_name: { kind: "text", max: 160 },
  client_email: { kind: "email" },
  client_phone: { kind: "text", max: 60 },
  customer_id: { kind: "uuid" },
  platform: { kind: "text", max: 60 },
  communication: { kind: "text", max: 60 },
  items: { kind: "longtext", max: 8000 },
  item_price_jpy: { kind: "int" },
  service_fee_jpy: { kind: "int" },
  shipping_cost_jpy: { kind: "int" },
  shipping_paid: { kind: "bool" },
  payment_method: { kind: "text", max: 120 },
  payment_received: { kind: "bool" },
  status: { kind: "status" },
  purchase_date: { kind: "date" },
  shipping_method: { kind: "text", max: 80 },
  tracking_number: { kind: "text", max: 120 },
  delivery_country: { kind: "text", max: 80 },
  shipping_address: { kind: "longtext", max: 1000 },
  event_name: { kind: "text", max: 200 },
  event_date: { kind: "date" },
  event_status: { kind: "text", max: 120 },
  event_result: { kind: "text", max: 200 },
  notes: { kind: "longtext", max: 4000 },
  admin_notes: { kind: "longtext", max: 12000 },
};

export const EDITABLE_FIELDS = Object.keys(FIELDS);

const MAX_YEN = 100_000_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Clean = Record<string, string | number | boolean | null>;

export function validateOrderChanges(input: Record<string, unknown>): { ok: true; clean: Clean } | { ok: false; error: string } {
  const clean: Clean = {};
  for (const [key, raw] of Object.entries(input ?? {})) {
    const def = FIELDS[key];
    if (!def) return { ok: false, error: `Champ non modifiable : ${key}` };

    switch (def.kind) {
      case "int": {
        const s = String(raw ?? "").trim();
        if (s === "") { clean[key] = 0; break; }
        if (!/^-?\d+$/.test(s)) return { ok: false, error: `${key} : entier de yens uniquement.` };
        const n = Number(s);
        if (Math.abs(n) > MAX_YEN) return { ok: false, error: `${key} : montant trop grand.` };
        clean[key] = n;
        break;
      }
      case "bool":
        clean[key] = raw === true || raw === "true";
        break;
      case "date": {
        const s = String(raw ?? "").trim();
        if (s === "") { clean[key] = null; break; }
        if (!DATE_RE.test(s) || Number.isNaN(Date.parse(s))) return { ok: false, error: `${key} : date invalide (AAAA-MM-JJ).` };
        clean[key] = s;
        break;
      }
      case "status": {
        const s = String(raw ?? "");
        if (!ORDER_STATUSES.includes(s)) return { ok: false, error: `Statut inconnu : ${s}` };
        clean[key] = s;
        break;
      }
      case "email": {
        const s = String(raw ?? "").trim();
        if (s === "") { clean[key] = null; break; }
        if (!EMAIL_RE.test(s) || s.length > 200) return { ok: false, error: "Adresse email invalide." };
        clean[key] = s;
        break;
      }
      case "uuid": {
        const s = String(raw ?? "").trim();
        if (s === "") { clean[key] = null; break; }
        if (!UUID_RE.test(s)) return { ok: false, error: "Compte client invalide." };
        clean[key] = s;
        break;
      }
      default: {
        const s = String(raw ?? "").trim();
        if (s.length > (def.max ?? 500)) return { ok: false, error: `${key} : texte trop long (${def.max ?? 500} caractères maximum).` };
        clean[key] = s === "" ? null : s;
      }
    }
  }
  return { ok: true, clean };
}

/** Champs réellement modifiés entre l'original et le formulaire (comparaison sur les valeurs de base). */
export function diffFields(original: Record<string, unknown>, current: Record<string, unknown>): { changes: Record<string, unknown>; before: Record<string, unknown> } {
  const changes: Record<string, unknown> = {};
  const before: Record<string, unknown> = {};
  const norm = (v: unknown) => (v === undefined || v === null || v === "" ? "" : String(v));
  for (const key of EDITABLE_FIELDS) {
    if (!(key in current)) continue;
    if (norm(original[key]) !== norm(current[key])) {
      changes[key] = current[key];
      before[key] = original[key] ?? null;
    }
  }
  return { changes, before };
}

/**
 * Conflit : un champ qu'on veut modifier a changé en base depuis le chargement du formulaire
 * (typiquement un paiement fusionné automatiquement dans la commande entre-temps).
 */
export function findConflicts(before: Record<string, unknown>, currentRow: Record<string, unknown>): string[] {
  const norm = (v: unknown) => (v === undefined || v === null || v === "" ? "" : String(v));
  return Object.keys(before).filter((k) => norm(before[k]) !== norm(currentRow[k]));
}
