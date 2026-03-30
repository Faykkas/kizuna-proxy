// @ts-nocheck
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tokyo Events & Exclusive Releases | Kizuna Proxy",
  description: "We attend exclusive events, limited pop-ups, and special releases in Tokyo on your behalf — Pokémon Center, Nintendo Store, Supreme drops, and more. Contact us privately for pricing and availability.",
  openGraph: {
    title: "Tokyo Events & Exclusive Releases — Kizuna Proxy",
    description: "Limited drops, pop-up events, special collaborations in Tokyo. We attend in person for you.",
    url: "https://kizunaproxy.com/events",
  },
};

export default function EventsPage() {
  return (
    <main className="blog-page">
      <div className="blog-wrap" style={{ maxWidth: "860px" }}>

        {/* Header */}
        <div className="blog-eyebrow">Tokyo Events · Exclusive Access</div>
        <h1>Tokyo Events &<br /><em>Exclusive Releases</em></h1>
        <p className="blog-lead">
          Some of the most sought-after items in Japan are never listed online — they only exist at specific events, pop-ups, and store openings. We are on the ground in Tokyo and can attend these for you.
        </p>

        <hr className="blog-hr" />

        {/* What we cover */}
        <h2>What We Cover</h2>
        <div className="ev-grid">
          {[
            {
              icon: "🎴",
              title: "Pokémon Center Events",
              desc: "Exclusive card releases, special booster packs, promo cards, and limited plush only available at official Pokémon Center Tokyo locations. Some sets sell out within hours of opening.",
            },
            {
              icon: "🎮",
              title: "Nintendo Store Tokyo",
              desc: "Japan-exclusive Switch games, limited hardware bundles, event-only merchandise, and collaborations only sold at Nintendo's flagship store in Shibuya Parco.",
            },
            {
              icon: "👟",
              title: "Supreme & Streetwear Drops",
              desc: "Weekly Supreme Japan drops, BAPE exclusives, Neighborhood collabs, and limited sneaker releases at stores in Harajuku, Shibuya, and Ura-Harajuku.",
            },
            {
              icon: "🏮",
              title: "Pop-up Events & Collabs",
              desc: "Anime collaborations, brand pop-ups, limited artist merchandise, Wonder Festival, and special event goods that disappear in a matter of hours.",
            },
            {
              icon: "🃏",
              title: "Card Game Tournaments & Events",
              desc: "Pokémon, One Piece TCG, Dragon Ball Super Card Game — exclusive promo cards and event merchandise available only to in-person attendees.",
            },
            {
              icon: "🏪",
              title: "Department Store Exclusives",
              desc: "Isetan, Mitsukoshi, Takashimaya — Japanese luxury department stores regularly host exclusive brand events and collabs unavailable anywhere else in the world.",
            },
          ].map((item, i) => (
            <div key={i} className="ev-card">
              <div className="ev-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        <hr className="blog-hr" />

        {/* How it works */}
        <h2>How It Works</h2>
        <div className="ev-steps">
          {[
            { n: "01", title: "Contact us privately", body: "Send us a message describing the event or item you are interested in. Include any details you have — dates, store name, item name, or links if available." },
            { n: "02", title: "We check availability", body: "We confirm whether we can attend the event, check queue requirements, opening times, and purchase limits. We give you a full picture before any commitment." },
            { n: "03", title: "Pricing & confirmation", body: "Event pricing is discussed case by case depending on the event type, queue time, and item cost. Everything is communicated transparently before you pay anything." },
            { n: "04", title: "We attend & ship", body: "On the day of the event, we queue and purchase your items in person. Once secured, we photograph everything and ship directly to you worldwide." },
          ].map(s => (
            <div key={s.n} className="ev-step">
              <div className="ev-step-num">{s.n}</div>
              <div>
                <strong>{s.title}</strong>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <hr className="blog-hr" />

        {/* Pricing note */}
        <div className="ev-pricing-note">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <strong>Pricing is discussed privately</strong>
            <p>Event service fees vary depending on the event, queue time required, purchase limits, and item cost. We do not publish a fixed price for events because every situation is different. Contact us directly and we will give you a clear, honest quote with no surprises.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="blog-cta" style={{ marginTop: "2.5rem" }}>
          <p>Interested in a Tokyo event?</p>
          <a href="/#request-wrap" className="btn btn-red">Contact us privately →</a>
        </div>

        <hr className="blog-hr" />

        {/* FAQ */}
        <h2>Frequently Asked Questions</h2>
        <div className="ev-faq">
          {[
            { q: "How far in advance should I contact you?", a: "As early as possible — ideally at least a week before the event. Some events require pre-registration or have limited attendance. The earlier you reach out, the better we can prepare." },
            { q: "What if the item sells out before you get there?", a: "We always let you know in advance if an item is likely to sell out quickly. In those cases, we arrive early or queue before opening. If we are unable to secure the item, you owe us nothing for the attempt." },
            { q: "Can you attend events outside Tokyo?", a: "Our primary coverage is Tokyo. Events in other cities (Osaka, Kyoto, Nagoya) may be possible but require additional discussion and will incur travel costs. Contact us to check." },
            { q: "Do you do live video calls during events?", a: "Yes — for certain events we can arrange a live video call so you can see the items in person before we purchase. This has been one of the most popular features with our clients." },
            { q: "Is there a minimum order for events?", a: "No minimum. Whether you want one promo card or a full haul from a store event, we handle every request with the same level of care." },
          ].map((item, i) => (
            <div key={i} className="ev-faq-item">
              <strong>{item.q}</strong>
              <p>{item.a}</p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
