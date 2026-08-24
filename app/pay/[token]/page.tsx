import type { Metadata } from "next";
import PayLinkClient from "./PayLinkClient";

export const metadata: Metadata = {
  title: "Payment — Kizuna Proxy",
  robots: { index: false, follow: false },
};

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PayLinkClient token={token} />;
}
