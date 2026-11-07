// Images de l'accueil. UN SEUL endroit à modifier quand de nouvelles images arrivent :
// remplacez le chemin (ex. "/home/cat-cards.jpg") par le fichier déposé dans public/home/.
// Aujourd'hui : vraies photos de commandes (public/). Format conseillé : portrait 3:4 (cartes, héros), 1200 px de large mini.

export type HomeImage = { src: string; alt: string };

// Collage de l'en-tête : 1 grande carte + 2 petites. `flag` + `place` = pastille « Livré » (pays d'arrivée de la vraie commande).
export const HERO_IMAGES: (HomeImage & { flag: string; place: string })[] = [
  { src: "/kpop_card.jpg", alt: "Ateez K-pop cards bought in Tokyo", flag: "🇺🇸", place: "USA" },
  { src: "/yugioh_order.jpg", alt: "Yu-Gi-Oh! Limit Over Collection box", flag: "🇺🇸", place: "USA" },
  { src: "/Harrypotter_order.jpg", alt: "Lacoste x Harry Potter Harajuku apparel", flag: "🇬🇷", place: "Greece" },
];

// 6 catégories, dans le même ordre que HomeCopy.cats
export const CATEGORY_IMAGES: (HomeImage & { query: string })[] = [
  { src: "/yugioh_order.jpg", alt: "Trading cards", query: "Trading cards" },
  { src: "/Harrypotter_order.jpg", alt: "Fashion and collabs", query: "Fashion & collabs" },
  { src: "/kpop_card.jpg", alt: "K-pop and idols", query: "K-pop & idols" },
  { src: "/call_order.jpg", alt: "Anime and event goods", query: "Anime & event goods" },
  { src: "/butter_butler.jpg", alt: "Japanese sweets", query: "Japanese sweets" },
  { src: "/daruma_order.jpg", alt: "Traditional crafts", query: "Traditional crafts" },
];

// Commandes livrées (vraies photos clients) : titre, pays
export const DELIVERED: (HomeImage & { title: string; flag: string; place: string })[] = [
  { src: "/Ancora_order.jpg", alt: "Ancora order", title: "Ancora Japan: fountain pen ink", flag: "🇨🇦", place: "Canada" },
  { src: "/Jojo_order.jpg", alt: "JoJo order", title: "JoJo's Bizarre Adventure T-shirt", flag: "🇺🇸", place: "USA" },
  { src: "/bushiroad_order.jpg", alt: "Bushiroad order", title: "Bushiroad official apparel", flag: "🇨🇭", place: "Switzerland" },
  { src: "/order_magicharm.jpg", alt: "Magic Charm order", title: "Magic Charm pullovers & goodies", flag: "🇺🇸", place: "USA" },
  { src: "/daruma_order.jpg", alt: "Daruma order", title: "Traditional Tokyo daruma x3", flag: "🇨🇦", place: "Canada" },
  { src: "/butter_butler.jpg", alt: "Butter Butler order", title: "Butter Butler chocolates", flag: "🇺🇸", place: "USA" },
  { src: "/call_order.jpg", alt: "Call of the Night order", title: "Call of the Night: Tokyo event exclusive", flag: "🇺🇸", place: "USA" },
  { src: "/Harrypotter_order.jpg", alt: "Harry Potter order", title: "Lacoste x Harry Potter", flag: "🇬🇷", place: "Greece" },
];

// Boutiques affichées (noms seulement, en texte)
export const STORES = ["Mercari", "Yahoo! Auctions", "Rakuten", "Amazon Japan", "Suruga-ya", "Mandarake", "Pokémon Center", "Nintendo Store", "Yodobashi", "ZOZOTOWN", "Animate", "Uniqlo"];
