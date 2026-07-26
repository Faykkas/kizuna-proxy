// @ts-nocheck
// app/blog/guideRoutes.ts
//
// Single source of truth mapping a blog slug to its Client Component and its
// key in guideTranslations. Used by the [locale]/[slug] route to resolve
// both which component to render and which translated content to pull.

import PokemonCardsClient from "./best-pokemon-cards-japan-2026/PokemonCardsClient";
import AnimeFiguresClient from "./anime-figures-japan-guide/AnimeFiguresClient";
import MercariClient from "./how-to-buy-from-mercari-japan/MercariClient";
import ShippingGuideClient from "./japan-shipping-guide-2026/ShippingGuideClient";
import TcgClient from "./japanese-trading-cards-guide-2026/TcgClient";
import NikeClient from "./nike-japan-exclusives-guide/NikeClient";
import PokemonCenterClient from "./pokemon-center-tokyo-exclusives/PokemonCenterClient";
import SupremeClient from "./supreme-japan-drops-guide/SupremeClient";
import YahooClient from "./yahoo-auctions-japan-guide/YahooClient";

export const GUIDE_ROUTES = {
  "best-pokemon-cards-japan-2026": { Component: PokemonCardsClient, key: "pokemonCards" },
  "anime-figures-japan-guide": { Component: AnimeFiguresClient, key: "animeFigures" },
  "how-to-buy-from-mercari-japan": { Component: MercariClient, key: "mercari" },
  "japan-shipping-guide-2026": { Component: ShippingGuideClient, key: "shippingGuide" },
  "japanese-trading-cards-guide-2026": { Component: TcgClient, key: "tcg" },
  "nike-japan-exclusives-guide": { Component: NikeClient, key: "nike" },
  "pokemon-center-tokyo-exclusives": { Component: PokemonCenterClient, key: "pokemonCenter" },
  "supreme-japan-drops-guide": { Component: SupremeClient, key: "supreme" },
  "yahoo-auctions-japan-guide": { Component: YahooClient, key: "yahoo" },
};

export const BLOG_SLUGS = Object.keys(GUIDE_ROUTES);
