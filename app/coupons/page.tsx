import type { Metadata } from "next";
import CouponsClient from "./CouponsClient";

const TITLE = "Coupons: ¥500 off Japan proxy service fees, Christmas code & review coupons | Kizuna Proxy";
const DESC =
  "Kizuna Proxy coupons: a ¥500 Christmas code, plus a personal ¥500 coupon for your Trustpilot review and ¥500 (¥750 with photos) for your Reddit review. Applied to our service fee on the payment page.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "https://kizunaproxy.com/coupons" },
  openGraph: {
    images: ["https://kizunaproxy.com/og-image.png"],
    title: "Kizuna Proxy coupons: save on our service fee",
    description: DESC,
    url: "https://kizunaproxy.com/coupons",
  },
};

export default function CouponsPage() {
  return <CouponsClient />;
}
