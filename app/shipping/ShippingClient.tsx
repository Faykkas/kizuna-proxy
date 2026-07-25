// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import Maneki from "../components/pixel/Maneki";
import ShippingCalculator from "../components/ShippingCalculator";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

export default function ShippingClient() {
  const { t } = useLang();
  const s = t.shippingPage || {};
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="parcel" size={86} float />
              <span className="px-head-bubble">{s.heroBubble || "No surprise at the door"}</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">{t.pageHeroes?.home || "Home"}</a><span>/</span><span>{s.breadcrumb || "Shipping"}</span>
            </nav>
            <h1>{s.titleStart ?? "What it "}<em>{s.titleEm ?? "really"}</em>{s.titleEnd ?? " costs"}</h1>
            <p>
              {s.lead || "Official Japan Post EMS rates, plus the import taxes nobody explains until the parcel is at your door."}
            </p>
          </div>
        </header>

        <section className="section">
          <div className="wrap">
            <ShippingCalculator />
          </div>
        </section>

        <section className="section reveal">
          <div className="wrap">
            <div className="sec-head">
              <p className="sec-label">{s.goodToKnow || "Good to know"}</p>
              <h2>{s.howWorksStart || "How shipping "}<em>{s.howWorksEm || "works"}</em></h2>
            </div>

            <div className="ship-notes">
              <div className="ship-note">
                <h3>{s.whyEms || "Why EMS"}</h3>
                <p>
                  {s.whyEmsBody || "It is the fastest tracked option Japan Post offers, and it covers the parcel against loss up to ¥20,000 at no extra cost. We can use cheaper services for light, low-value parcels — ask and we'll compare."}
                </p>
              </div>

              <div className="ship-note">
                <h3>{s.weightBrackets || "Weight brackets"}</h3>
                <p>
                  {s.weightBracketsBody || "EMS charges by bracket, not by the gram. A 520 g parcel costs the same as a 600 g one, so it is often worth adding a second item rather than sending two parcels."}
                </p>
              </div>

              <div className="ship-note">
                <h3>{s.combiningOrders || "Combining orders"}</h3>
                <p>
                  {s.combiningOrdersBody || "We hold your items in Tokyo and ship them together. Two separate 800 g parcels to France cost ¥7,800; one 1.6 kg parcel costs ¥5,550. You save the difference."}
                </p>
              </div>

              <div className="ship-note">
                <h3>{s.declaredValue || "Declared value"}</h3>
                <p>
                  {s.declaredValueBody || "We declare the real value on every parcel. Under-declaring is illegal, and it voids the insurance — if the parcel is lost, you get back what was written, not what it was worth."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
