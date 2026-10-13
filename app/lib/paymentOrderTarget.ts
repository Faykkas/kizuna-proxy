// Dans quelle commande un paiement par lien doit-il atterrir ?
//
// Trois cas, choisis à la CRÉATION du lien :
//   - une commande précise (link.target_order_id)  → on y ajoute le paiement, quel que soit son mois ou son statut ;
//   - « nouvelle commande » (link.new_order)         → on en crée toujours une ;
//   - rien de précisé                                → règle automatique : commande ouverte du client,
//                                                       du même mois pour un paiement d'articles
//                                                       (la livraison rejoint toujours la commande ouverte).
//
// Fichier sans dépendance, testable seul (voir paymentOrderTarget.test.ts).

export type CandidateOrder = {
  id: number;
  status: string | null;
  purchase_date: string | null;
  created_at: string | null;
};

export type LinkTarget = { target_order_id?: number | null; new_order?: boolean | null };

const CLOSED = ["Shipped", "Delivered", "Cancelled"];

export function resolveOpenOrder<T extends CandidateOrder>(args: {
  link: LinkTarget;
  /** Commandes du client, la plus récente d'abord. */
  existingOrders: T[];
  /** La commande demandée par id, si le lien en désigne une et qu'elle existe encore. */
  targetOrder: T | null;
  isShippingPayment: boolean;
  /** Mois courant « AAAA-MM ». */
  thisMonth: string;
}): T | null {
  const { link, existingOrders, targetOrder, isShippingPayment, thisMonth } = args;

  if (link.new_order) return null;

  // Choix explicite : on le respecte. Si la commande a disparu entre-temps, on retombe sur la règle automatique
  // plutôt que de perdre le paiement.
  if (link.target_order_id != null && targetOrder && targetOrder.id === link.target_order_id) return targetOrder;

  return (
    existingOrders.find(
      (o) =>
        !CLOSED.includes(o.status ?? "") &&
        (isShippingPayment || (o.purchase_date || o.created_at || "").slice(0, 7) === thisMonth),
    ) ?? null
  );
}
