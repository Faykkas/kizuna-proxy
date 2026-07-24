import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign in — Kizuna Proxy",
  description: "Sign in to track your orders from Japan.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginClient />;
}
