// Images de l'accueil. UN SEUL endroit à modifier quand de nouvelles images arrivent.
// Photos de vraies commandes : public/home/ (optimisées, 1400 px max) et public/ (anciennes).
// `place` est facultatif : sans pays connu, la pastille affiche seulement « Livré ».

export type HomeImage = { src: string; alt: string };

// Collage de l'en-tête : 1 grande carte + 2 petites.
export const HERO_IMAGES: (HomeImage & { place?: string })[] = [
  { src: "/home/coach-trio.jpg", alt: "Three Coach bags bought in Tokyo and ready to ship" },
  { src: "/home/coach-zebra.jpg", alt: "Coach beaded zebra clutch" },
  { src: "/home/tapestry-umineko.jpg", alt: "Six Umineko B2 tapestries bought in Japan" },
];

// 6 catégories, dans le même ordre que HomeCopy.cats
export const CATEGORY_IMAGES: (HomeImage & { query: string })[] = [
  { src: "/yugioh_order.jpg", alt: "Trading cards", query: "Trading cards" },
  { src: "/home/coach-trio.jpg", alt: "Fashion, bags and collabs", query: "Fashion & collabs" },
  { src: "/kpop_card.jpg", alt: "K-pop and idols", query: "K-pop & idols" },
  { src: "/home/tapestry-hapisere.jpg", alt: "Anime and event goods", query: "Anime & event goods" },
  { src: "/butter_butler.jpg", alt: "Japanese sweets", query: "Japanese sweets" },
  { src: "/daruma_order.jpg", alt: "Traditional crafts", query: "Traditional crafts" },
];

// Commandes livrées (vraies photos clients) : titre, pays (facultatif)
export const DELIVERED: (HomeImage & { title: string; place?: string })[] = [
  { src: "/home/coach-zebra.jpg", alt: "Coach zebra clutch", title: "Coach beaded zebra clutch" },
  { src: "/home/coach-glove.jpg", alt: "Coach Repurposed baseball glove bag", title: "Coach Repurposed baseball glove bag" },
  { src: "/home/tapestry-umineko.jpg", alt: "Umineko tapestries", title: "Umineko B2 tapestries x6" },
  { src: "/Ancora_order.jpg", alt: "Ancora order", title: "Ancora Japan: fountain pen ink", place: "Canada" },
  { src: "/home/coach-sparkle.jpg", alt: "Coach crystal signature clutch", title: "Coach crystal signature clutch" },
  { src: "/home/tapestry-hapisere.jpg", alt: "Anime XL tapestries and cards", title: "Anime XL tapestries & cards" },
  { src: "/Jojo_order.jpg", alt: "JoJo order", title: "JoJo's Bizarre Adventure T-shirt", place: "USA" },
  { src: "/bushiroad_order.jpg", alt: "Bushiroad order", title: "Bushiroad official apparel", place: "Switzerland" },
];

// Boutiques affichées (noms seulement, en texte)
export const STORES = ["Mercari", "Yahoo! Auctions", "Rakuten", "Amazon Japan", "Suruga-ya", "Mandarake", "Pokémon Center", "Nintendo Store", "Yodobashi", "ZOZOTOWN", "Animate", "Uniqlo"];
