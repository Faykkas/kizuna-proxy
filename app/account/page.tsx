import type { Metadata } from "next";
import AccountClient from "./AccountClient";

export const metadata: Metadata = {
  title: "My Orders — Kizuna Proxy",
  description: "Track your Japan proxy orders, view photos and pay shipping.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountClient />;
}
