// « Commission package » : chaque semaine, Kizuna encaisse un peu plus que le coût réel des colis
// envoyés. Cette marge est un GAIN (elle compte dans les commissions) mais n'est PAS une commande
// de client : elle ne doit pas gonfler le nombre de commandes, les moyennes par commande ni la
// liste des clients.
//
// Ces lignes sont enregistrées dans `orders` avec un nom de client du type
// « COMISSION PACKING 12/1 » ou « Comission PACKAGE WEEK » (sans email, prix articles à 0).
// Elles sont conservées telles quelles : on ne fait que les reconnaître.
//
// Fichier sans dépendance (partagé par l'ancienne admin et l'admin-v2).

const COMMISSION_PACKAGE_NAME = /^\s*comm?iss?ion\s+pack(?:age|ing)\b/i;

export function isCommissionPackage(order: { client_name?: string | null }): boolean {
  return COMMISSION_PACKAGE_NAME.test(order.client_name ?? "");
}
