// Calcul PROVISOIRE des commissions, à partir des données existantes.
//
// Reprend EXACTEMENT la formule de l'ancienne admin (onglet Stats), pour que
// les deux interfaces affichent les mêmes chiffres pendant la transition :
//   - commandes « gagnées » : statut ni « Pending » ni « Cancelled » ;
//   - frais de service : service_fee_jpy, groupés par mois de purchase_date ;
//   - marge PayPal : (frais PayPal facturés − frais réels) des liens payés,
//     groupée par mois de paid_at.
//
// Ce n'est PAS le futur registre financier (phase 1), qui distinguera
// commissions prévues / facturées / encaissées / remboursées.
//
// Fichier volontairement sans dépendance, pour être testable seul
// (node --test app/admin-v2/lib/commissions.test.ts).

export type OrderLite = {
  status: string | null;
  purchase_date: string | null;
  service_fee_jpy: number | null;
};

export type PaidLinkLite = {
  paid_at: string | null;
  paypal_fee_jpy: number | null;
  paypal_real_fee_jpy: number | null;
};

export type MonthCommission = {
  month: string; // AAAA-MM
  serviceFees: number;
  paypalMargin: number;
  total: number;
  orderCount: number;
};

export type CommissionReport = {
  months: MonthCommission[]; // triés par mois croissant
  anomalies: string[];
};

export function isEarnedStatus(status: string | null): boolean {
  return status !== "Pending" && status !== "Cancelled";
}

function yen(value: unknown, label: string, anomalies: string[]): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    anomalies.push(`${label} : valeur illisible (${String(value)})`);
    return 0;
  }
  if (!Number.isInteger(n)) {
    anomalies.push(`${label} : montant non entier (${n}), arrondi`);
    return Math.round(n);
  }
  return n;
}

export function computeCommissions(orders: OrderLite[], links: PaidLinkLite[]): CommissionReport {
  const anomalies: string[] = [];
  const byMonth = new Map<string, MonthCommission>();
  const get = (month: string) => {
    let m = byMonth.get(month);
    if (!m) {
      m = { month, serviceFees: 0, paypalMargin: 0, total: 0, orderCount: 0 };
      byMonth.set(month, m);
    }
    return m;
  };

  for (const o of orders) {
    if (!isEarnedStatus(o.status) || !o.purchase_date) continue;
    const m = get(o.purchase_date.slice(0, 7));
    m.serviceFees += yen(o.service_fee_jpy, "service_fee_jpy", anomalies);
    m.orderCount += 1;
  }

  for (const l of links) {
    // Seuls les liens dont le frais réel est connu comptent (comme l'ancienne admin).
    if (!l.paid_at || l.paypal_real_fee_jpy == null) continue;
    const charged = yen(l.paypal_fee_jpy, "paypal_fee_jpy", anomalies);
    if (charged <= 0) continue;
    const real = yen(l.paypal_real_fee_jpy, "paypal_real_fee_jpy", anomalies);
    get(l.paid_at.slice(0, 7)).paypalMargin += charged - real;
  }

  const months = [...byMonth.values()]
    .map((m) => ({ ...m, total: m.serviceFees + m.paypalMargin }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return { months, anomalies };
}

/** Mois courant (AAAA-MM) à Tokyo. */
export function currentMonthJst(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 7);
}

/** Les n derniers mois (jusqu'au mois donné inclus), du plus ancien au plus récent. */
export function lastMonths(endMonth: string, n: number): string[] {
  const [y, m] = endMonth.split("-").map(Number);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    out.push(d.toISOString().slice(0, 7));
  }
  return out;
}
