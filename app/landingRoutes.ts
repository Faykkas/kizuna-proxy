// @ts-nocheck
// app/landingRoutes.ts
//
// Single source of truth mapping a top-level SEO landing page slug to its
// Client Component and its key in landingTranslations. Used by the
// [locale]/[slug] route to resolve both which component to render and
// which translated content to pull.

import TokyoInStoreClient from "./tokyo-in-store-personal-shopper/TokyoInStoreClient";
import PopUpProxyClient from "./japan-pop-up-store-proxy/PopUpProxyClient";
import CardProxyClient from "./pokemon-one-piece-card-proxy-japan/CardProxyClient";

export const LANDING_ROUTES = {
  "tokyo-in-store-personal-shopper": { Component: TokyoInStoreClient, key: "tokyoInStore" },
  "japan-pop-up-store-proxy": { Component: PopUpProxyClient, key: "popUpProxy" },
  "pokemon-one-piece-card-proxy-japan": { Component: CardProxyClient, key: "cardProxy" },
};

export const LANDING_SLUGS = Object.keys(LANDING_ROUTES);
