// @ts-nocheck
"use client";
import { useState } from "react";

const FAQS = [
  {
    category: "Getting started",
    items: [
      { q: "What is a Japan proxy service?", a: "A Japan proxy service buys items on your behalf from Japanese websites or physical stores in Tokyo. We act as your local representative — you send us what you want, we purchase it and ship it directly to you worldwide." },
      { q: "How do I place a request?", a: "Simply fill in the request form on our homepage or send us an email at kizunaproxy@gmail.com. Describe the item, share a link if you have one, and tell us where you want it shipped. We'll get back to you within 24 hours with a quote." },
      { q: "How long does it take to get a reply?", a: "We reply to all requests within 24 hours. For most online orders (Mercari, Yahoo Auctions), we purchase the same day once payment is confirmed." },
      { q: "Do I need a Japanese address or account?", a: "No — that's the whole point. We have Japanese accounts on all major platforms and a physical address in Tokyo. You just tell us what you want." },
    ]
  },
  {
    category: "Pricing",
    items: [
      { q: "How much does it cost?", a: "Our pricing is fully personalised — every request is different. Contact us with the details of your order and we'll send you a transparent quote with no hidden fees. For large orders, we apply a percentage-based fee rather than a flat rate per item." },
      { q: "Are there any hidden fees?", a: "Never. We communicate every cost clearly before you pay anything. Item price, service fee, and shipping are all broken down separately. What we quote is what you pay." },
      { q: "When do I pay?", a: "Payment is made in two parts: first the item price and service fee before we purchase, then the shipping costs once your item is ready to ship. We never ask for shipping payment before we have your item in hand." },
      { q: "Do you offer discounts for large orders?", a: "Yes — for orders with multiple items or high total value, we apply a reduced percentage fee rather than charging per item. Contact us and we'll work out the fairest arrangement for your specific order." },
    ]
  },
  {
    category: "Platforms & purchasing",
    items: [
      { q: "Can you buy from Mercari Japan?", a: "Yes — Mercari Japan is one of our most common requests. We handle all communication with sellers, payment, and shipping. Most Mercari orders are purchased the same day." },
      { q: "Can you buy from Yahoo Auctions Japan?", a: "Yes — we bid on Yahoo Auctions Japan on your behalf. Tell us the item, your maximum bid, and whether you want a real-time or sniper bid. We monitor the auction and notify you of the result." },
      { q: "Can you visit physical stores in Tokyo?", a: "Yes — this is one of our biggest advantages over automated proxy services. We visit Pokémon Center, Nintendo Store, Akihabara stores, Supreme Japan, and any other physical location in Tokyo. We can even do a live video call so you can shop in real time." },
      { q: "Can you attend exclusive events and drops?", a: "Yes — we queue at Supreme Japan drops, attend Pokémon Center event releases, and visit any Tokyo event or pop-up on your behalf. Contact us in advance with the event details so we can plan accordingly." },
      { q: "What platforms can you buy from?", a: "We purchase from Mercari Japan, Yahoo Auctions, Rakuten, Amazon Japan, Suruga-ya, Book Off, and virtually any Japanese website or physical store. If it exists in Japan, we can get it." },
    ]
  },
  {
    category: "Shipping",
    items: [
      { q: "Which countries do you ship to?", a: "We ship worldwide — USA, Canada, France, Germany, UK, Italy, Greece, Indonesia, South Korea, Australia and many more. If your country receives international mail, we can ship to you." },
      { q: "What shipping methods do you use?", a: "We use Japan Post EMS, FedEx International, DHL Express, and Yamato TA-Q-BIN depending on your destination, order value, and preference. We always discuss the best option with you before shipping." },
      { q: "How long does shipping take?", a: "Typically 5-10 business days via EMS to Europe and North America. FedEx and DHL are faster at 2-4 days. We always provide tracking so you can follow your package." },
      { q: "Do you insure packages?", a: "Standard insurance is included with FedEx and DHL. For high-value items, we recommend these carriers and can arrange additional coverage. We always photograph items before shipping." },
      { q: "How do you package fragile items?", a: "Carefully — we use appropriate padding, double-boxing when necessary, and photograph all items before sealing. For figures, collectibles, or electronics, we take extra precautions to ensure safe arrival." },
    ]
  },
  {
    category: "Trust & safety",
    items: [
      { q: "How do I know you're legitimate?", a: "We have 11 verified reviews on Reddit from real customers in USA, Canada, Greece, Indonesia and more — all with direct links to the original posts. We're also on Trustpilot. You can read every review and verify it yourself." },
      { q: "What if the item arrives damaged?", a: "We photograph everything before shipping. If an item arrives damaged due to our packaging, we work with you to find a solution. We take full responsibility for how we pack and ship your items." },
      { q: "What if the item I want is sold out?", a: "We tell you immediately and can suggest alternatives or keep searching. For limited releases, we recommend contacting us as early as possible before the drop date." },
      { q: "Can I see the item before it ships?", a: "Yes — we always send photos of your item once we have it in hand, before shipping. If anything looks different from the listing, we contact you before proceeding." },
    ]
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-page-item${open ? " open" : ""}`} onClick={() => setOpen(!open)}>
      <div className="faq-page-q">
        <span>{q}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0, color: "var(--red)" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && <div className="faq-page-a">{a}</div>}
    </div>
  );
}

export default function FaqClient() {
  return (
    <main style={{ minHeight:"100vh", background:"var(--beige)", padding:"6rem 2rem 8rem" }}>
      <div style={{ maxWidth:"800px", margin:"0 auto" }}>
        <div style={{ marginBottom:"4rem" }}>
          <p style={{ fontSize:".6rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--red)", marginBottom:"1rem", display:"flex", alignItems:"center", gap:".5rem" }}>
            <span style={{ display:"block", width:"20px", height:"1px", background:"var(--red)" }} />
            Frequently asked questions
          </p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,4vw,2.8rem)", fontWeight:300, color:"var(--ink)", marginBottom:"1rem" }}>
            Everything you need to <em style={{ color:"var(--red)", fontStyle:"italic" }}>know</em>
          </h1>
          <p style={{ fontSize:".88rem", color:"var(--warm)", fontWeight:300, lineHeight:1.8, maxWidth:"560px" }}>
            Can't find your answer here? Email us at <a href="mailto:kizunaproxy@gmail.com" style={{ color:"var(--red)" }}>kizunaproxy@gmail.com</a> — we reply within 24 hours.
          </p>
        </div>
        {FAQS.map((section, si) => (
          <div key={si} style={{ marginBottom:"3rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1rem" }}>
              <span style={{ fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--red)", fontWeight:500 }}>{section.category}</span>
              <span style={{ flex:1, height:"1px", background:"var(--border-gold)" }} />
            </div>
            <div style={{ border:"1px solid var(--border-gold)", background:"var(--white)" }}>
              {section.items.map((item, ii) => (
                <FaqItem key={ii} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
        <div style={{ padding:"2rem 2.5rem", background:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem", marginTop:"3rem" }}>
          <div>
            <strong style={{ display:"block", fontSize:".95rem", color:"var(--beige)", marginBottom:".3rem" }}>Still have a question?</strong>
            <p style={{ fontSize:".82rem", color:"rgba(255,255,255,.45)", margin:0, fontWeight:300 }}>We reply within 24 hours — no chatbots, real answers.</p>
          </div>
          <a href="mailto:kizunaproxy@gmail.com" style={{ background:"var(--red)", color:"#fff", padding:".7rem 1.6rem", fontSize:".65rem", letterSpacing:".14em", textTransform:"uppercase", fontFamily:"'Jost',sans-serif", fontWeight:600, textDecoration:"none" }}>
            Contact us →
          </a>
        </div>
        <div style={{ marginTop:"2rem", textAlign:"center" }}>
          <a href="/" style={{ fontSize:".72rem", color:"var(--warm)", textDecoration:"none", letterSpacing:".08em" }}>← Back to home</a>
        </div>
      </div>
    </main>
  );
}
