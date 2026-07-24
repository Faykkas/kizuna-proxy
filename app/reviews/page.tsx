import type { Metadata } from "next";
import ReviewsClient from "./ReviewsClient";

export const metadata: Metadata = {
  title: "Customer Reviews — Trusted by Collectors Worldwide | Kizuna Proxy",
  description: "Read verified Reddit and Trustpilot reviews of Kizuna Proxy from customers in the USA, Canada, France, Germany, Greece, Indonesia and more. 5.0 average rating.",
  alternates: { canonical: "https://kizunaproxy.com/reviews" },
  openGraph: {
    title: "Customer Reviews — Kizuna Proxy",
    description: "Read verified Reddit and Trustpilot reviews of Kizuna Proxy from customers in the USA, Canada, France, Germany, Greece, Indonesia and more. 5.0 average rating.",
    url: "https://kizunaproxy.com/reviews",
  },
};

export default function ReviewsPage() {
  return <ReviewsClient />;
}
