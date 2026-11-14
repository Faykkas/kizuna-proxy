// Images de l'accueil. UN SEUL endroit à modifier quand de nouvelles images arrivent.
//   public/home/   : vraies photos de commandes (seules à porter la pastille « Livré »)
//   public/photos/ : photos libres de droits (licence Unsplash, usage commercial autorisé) : décor et vitrine.
//                    Jamais présentées comme des commandes livrées. Auteurs dans PHOTO_CREDITS.
// `place` est facultatif : sans pays connu, la pastille affiche seulement « Livré ».

export type HomeImage = { src: string; alt: string };

// Fond plein écran de l'en-tête et bandeau « Tokyo »
export const HERO_BG = "/photos/akihabara-night.jpg";
export const BAND_BG = "/photos/shibuya-neon.jpg";

// Collage de l'en-tête : 1 grande carte + 2 petites (VRAIES commandes livrées).
export const HERO_IMAGES: (HomeImage & { place?: string })[] = [
  { src: "/home/coach-trio.jpg", alt: "Three Coach bags bought in Tokyo and ready to ship" },
  { src: "/home/coach-zebra.jpg", alt: "Coach beaded zebra clutch" },
  { src: "/home/tapestry-umineko.jpg", alt: "Six Umineko B2 tapestries bought in Japan" },
];

// 8 catégories, dans le même ordre que HomeCopy.cats
export const CATEGORY_IMAGES: (HomeImage & { query: string })[] = [
  { src: "/photos/pokemon-cards-pokeball.jpg", alt: "Japanese trading cards", query: "Trading cards" },
  { src: "/photos/one-piece-figures.jpg", alt: "Anime figures", query: "Anime figures" },
  { src: "/photos/gachapon.jpg", alt: "Gachapon capsule toy machines in Tokyo", query: "Gachapon & capsule toys" },
  { src: "/photos/plush-wall.jpg", alt: "Wall of plush toys", query: "Kawaii & plush" },
  { src: "/photos/coach-tag.jpg", alt: "Designer leather bag", query: "Luxury bags" },
  { src: "/photos/sneakers-box.jpg", alt: "Sneakers in their box", query: "Sneakers & streetwear" },
  { src: "/photos/sweets-shop.jpg", alt: "Traditional Japanese sweets shop", query: "Japanese sweets" },
  { src: "/photos/lantern-alley.jpg", alt: "Tokyo alley with red lanterns", query: "Traditional Japan" },
];

// Mosaïque « le meilleur du Japon » : 10 produits, même ordre que HomeCopy.picks. `big` = tuile double.
export const JAPAN_PICKS: (HomeImage & { query: string; big?: boolean })[] = [
  { src: "/photos/vintage-camera.jpg", alt: "Vintage Japanese film camera", query: "Vintage camera", big: true },
  { src: "/photos/japanese-skincare.jpg", alt: "Japanese skincare bottles", query: "Japanese skincare" },
  { src: "/photos/matcha-powder.jpg", alt: "Matcha green tea powder", query: "Matcha" },
  { src: "/photos/ceramics.jpg", alt: "Handmade Japanese ceramics", query: "Japanese ceramics" },
  { src: "/photos/famicom-games.jpg", alt: "Japanese retro game cartridges", query: "Retro games", big: true },
  { src: "/photos/vinyl-record.jpg", alt: "Vinyl record on a turntable", query: "Japanese vinyl records" },
  { src: "/photos/tamagotchi.jpg", alt: "Virtual pet toy", query: "Tamagotchi" },
  { src: "/photos/luxury-watch.jpg", alt: "Luxury wristwatch", query: "Watch" },
  { src: "/photos/leather-bag.jpg", alt: "Black leather handbag", query: "Leather bag" },
  { src: "/photos/retro-computers.jpg", alt: "Retro computers in neon light", query: "Retro tech" },
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

// Photographes Unsplash (crédit affiché en bas de l'accueil ; la licence ne l'exige pas, c'est une politesse).
export const PHOTO_CREDITS = [
  "Pat Krupa", "Jezael Melgoza", "Thimo Pedersen", "Melvin Chavez", "Perry Merrity II", "Raymond Yeung", "Barry A",
  "Karsten Winegeart", "Fratto Kenchiku", "Denys Nevozhai", "Caramel", "Mobina Ghazazani", "Madeline Liu",
  "william wallace", "Garvit Nama", "Pedram Farjam", "Ela De Pure", "Kairi Kaljo", "Geraldine Lewa", "Nick Hamze",
  "Jakob Rosen", "COSMOH", "Lorenzo Herrera", "Fumiaki Hayashi",
  "Rohit Choudhari", "Satoshi Nitawaki", "Louie Martinez", "Erik Eastman",
]; // détail fichier par fichier : docs/photo-credits.md
