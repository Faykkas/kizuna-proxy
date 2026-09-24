import type { Metadata } from "next";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

export const metadata: Metadata = {
  title: "Privacy & Cookie Policy | Kizuna Proxy",
  description: "What personal data Kizuna Proxy collects, why, who we share it with, and how to control your cookie preferences.",
  alternates: { canonical: "https://kizunaproxy.com/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
