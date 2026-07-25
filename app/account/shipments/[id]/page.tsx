import type { Metadata } from "next";
import ShipmentDetailClient from "./ShipmentDetailClient";

export const metadata: Metadata = {
  title: "Package — Kizuna Proxy",
  robots: { index: false, follow: false },
};

export default async function ShipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShipmentDetailClient shipmentId={id} />;
}
