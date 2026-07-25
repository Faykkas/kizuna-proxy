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
              <span className="px-head-bubble">No surprise at the door</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a><span>/</span><span>Shipping</span>
            </nav>
            <h1>What it <em>really</em> costs</h1>
            <p>
              Official Japan Post EMS rates, plus the import taxes nobody
              explains until the parcel is at your door.
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
              <p className="sec-label">Good to know</p>
              <h2>How shipping <em>works</em></h2>
            </div>

            <div className="ship-notes">
              <div className="ship-note">
                <h3>Why EMS</h3>
                <p>
                  It is the fastest tracked option Japan Post offers, and it
                  covers the parcel against loss up to ¥20,000 at no extra cost.
                  We can use cheaper services for light, low-value parcels —
                  ask and we&apos;ll compare.
                </p>
              </div>

              <div className="ship-note">
                <h3>Weight brackets</h3>
                <p>
                  EMS charges by bracket, not by the gram. A 520 g parcel costs
                  the same as a 600 g one, so it is often worth adding a second
                  item rather than sending two parcels.
                </p>
              </div>

              <div className="ship-note">
                <h3>Combining orders</h3>
                <p>
                  We hold your items in Tokyo and ship them together. Two
                  separate 800 g parcels to France cost ¥7,800; one 1.6 kg
                  parcel costs ¥5,550. You save the difference.
                </p>
              </div>

              <div className="ship-note">
                <h3>Declared value</h3>
                <p>
                  We declare the real value on every parcel. Under-declaring is
                  illegal, and it voids the insurance — if the parcel is lost,
                  you get back what was written, not what it was worth.
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
