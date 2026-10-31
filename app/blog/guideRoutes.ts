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
import ComiketClient from "./comiket-japan-guide/ComiketClient";
import ComitiaClient from "./comitia-japan-guide/ComitiaClient";
import IchibanKujiClient from "./ichiban-kuji-japan-guide/IchibanKujiClient";
import AnimeEventsClient from "./tokyo-anime-events-guide/AnimeEventsClient";
import KpopClient from "./kpop-photocards-japan-guide/KpopClient";
import ForwardingClient from "./japan-package-forwarding-guide/ForwardingClient";
import DiscreetPickupClient from "./tokyo-discreet-pickup-service/DiscreetPickupClient";
import CoachOfficialClient from "./buy-coach-bags-japan/CoachOfficialClient";
import SanrioClient from "./buy-sanrio-japan/SanrioClient";
import OnitsukaClient from "./buy-onitsuka-tiger-japan/OnitsukaClient";
import PorterClient from "./buy-porter-yoshida-bags-japan/PorterClient";
import BiohazardClient from "./resident-evil-30th-anniversary-exhibition-tokyo/BiohazardClient";
import AgfClient from "./agf-ikebukuro-animate-girls-festival-2026/AgfClient";
import ChristmasClient from "./order-christmas-gifts-from-japan-2026/ChristmasClient";
import StarbucksXmasClient from "./starbucks-japan-christmas-2026-collection/StarbucksXmasClient";
import StarbucksJapanClient from "./buy-starbucks-japan-tumblers-guide/StarbucksJapanClient";
import FukubukuroClient from "./fukubukuro-japan-lucky-bags-2027-guide/FukubukuroClient";

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
  "comiket-japan-guide": { Component: ComiketClient, key: "comiket" },
  "comitia-japan-guide": { Component: ComitiaClient, key: "comitia" },
  "ichiban-kuji-japan-guide": { Component: IchibanKujiClient, key: "ichibanKuji" },
  "tokyo-anime-events-guide": { Component: AnimeEventsClient, key: "animeEvents" },
  "kpop-photocards-japan-guide": { Component: KpopClient, key: "kpop" },
  "japan-package-forwarding-guide": { Component: ForwardingClient, key: "forwarding" },
  "tokyo-discreet-pickup-service": { Component: DiscreetPickupClient, key: "discreetPickup" },
  "buy-coach-bags-japan": { Component: CoachOfficialClient, key: "coachOfficial" },
  "buy-sanrio-japan": { Component: SanrioClient, key: "sanrio" },
  "buy-onitsuka-tiger-japan": { Component: OnitsukaClient, key: "onitsukaTiger" },
  "buy-porter-yoshida-bags-japan": { Component: PorterClient, key: "porterYoshida" },
  "resident-evil-30th-anniversary-exhibition-tokyo": { Component: BiohazardClient, key: "biohazard30" },
  "agf-ikebukuro-animate-girls-festival-2026": { Component: AgfClient, key: "agf2026" },
  "order-christmas-gifts-from-japan-2026": { Component: ChristmasClient, key: "christmas2026" },
  "starbucks-japan-christmas-2026-collection": { Component: StarbucksXmasClient, key: "starbucksXmas2026" },
  "buy-starbucks-japan-tumblers-guide": { Component: StarbucksJapanClient, key: "starbucksJapan" },
  "fukubukuro-japan-lucky-bags-2027-guide": { Component: FukubukuroClient, key: "fukubukuro2027" },
};

export const BLOG_SLUGS = Object.keys(GUIDE_ROUTES);
