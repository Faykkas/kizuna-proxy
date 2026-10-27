// Statuts d'une demande du site : ceux de l'ancienne admin, pour que les deux admins restent compatibles.
// (Fichier séparé de queries.ts, qui est réservé au serveur : ces valeurs servent aussi aux composants du navigateur.)

export const REQUEST_STATUSES = ["new", "read", "converted", "declined"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** Libellés français = clés de traduction (voir lib/ja-*.ts). */
export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  new: "Nouvelle",
  read: "Vue",
  converted: "Convertie",
  declined: "Refusée",
};
