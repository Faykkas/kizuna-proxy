// Photo de couverture de chaque guide (licence Unsplash, voir docs/photo-credits.md). UN SEUL endroit à modifier.
// Utilisée en haut de l'article (GuideCover, via la mise en page du blog) et en vignette sur /blog.

export const GUIDE_PHOTOS: Record<string, string> = {
  "how-to-buy-from-mercari-japan": "/photos/guide-mercari.jpg",
  "yahoo-auctions-japan-guide": "/photos/guide-yahoo.jpg",
  "best-pokemon-cards-japan-2026": "/photos/pokemon-cards.jpg",
  "pokemon-center-tokyo-exclusives": "/photos/plush-wall.jpg",
  "supreme-japan-drops-guide": "/photos/guide-supreme.jpg",
  "nike-japan-exclusives-guide": "/photos/guide-nike.jpg",
  "anime-figures-japan-guide": "/photos/anime-figures-wall.jpg",
  "japanese-trading-cards-guide-2026": "/photos/pokemon-cards-pokeball.jpg",
  "japan-shipping-guide-2026": "/photos/guide-airplane.jpg",
  "comiket-japan-guide": "/photos/guide-manga-shelf.jpg",
  "comitia-japan-guide": "/photos/guide-manga-drawings.jpg",
  "ichiban-kuji-japan-guide": "/photos/gachapon-row.jpg",
  "tokyo-anime-events-guide": "/photos/akihabara-night.jpg",
  "kpop-photocards-japan-guide": "/photos/guide-kpop.jpg",
  "japan-package-forwarding-guide": "/photos/parcels-pile.jpg",
  "tokyo-discreet-pickup-service": "/photos/guide-lockers.jpg",
  "buy-coach-bags-japan": "/photos/coach-tag.jpg",
  "buy-sanrio-japan": "/photos/washi-tape.jpg",
  "buy-onitsuka-tiger-japan": "/photos/guide-onitsuka.jpg",
  "buy-porter-yoshida-bags-japan": "/photos/leather-bag.jpg",
  "resident-evil-30th-anniversary-exhibition-tokyo": "/photos/guide-exhibition.jpg",
  "agf-ikebukuro-animate-girls-festival-2026": "/photos/guide-ikebukuro.jpg",
  "order-christmas-gifts-from-japan-2026": "/photos/guide-illumination.jpg",
  "starbucks-japan-christmas-2026-collection": "/photos/guide-xmas-coffee.jpg",
  "buy-starbucks-japan-tumblers-guide": "/photos/guide-tumbler.jpg",
  "fukubukuro-japan-lucky-bags-2027-guide": "/photos/guide-shopping-bags.jpg",
};

/** Photo d'un guide à partir de l'adresse (/blog/slug ou /blog/fr/slug). */
export function guidePhotoForPath(pathname: string): string | null {
  const slug = (pathname || "").split("/").filter(Boolean).pop() || "";
  return GUIDE_PHOTOS[slug] || null;
}
