// @ts-nocheck
"use client";
import { useState } from "react";
import { translations, detectLang } from "../translations";
import SiteNav from "../components/SiteNav";

const FAQS = {
  en: [
    {
      category: "Getting started",
      items: [
        { q: "What is a Japan proxy service?", a: "A Japan proxy service buys items on your behalf from Japanese websites or physical stores in Tokyo. We act as your local representative — you send us what you want, we purchase it and ship it directly to you worldwide." },
        { q: "How do I place a request?", a: "Fill in the request form on our homepage or email us at kizunaproxy@gmail.com. Describe the item, share a link if you have one, and tell us where you want it shipped. We reply within 24 hours with a quote." },
        { q: "How long does it take to get a reply?", a: "We reply to all requests within 24 hours. For most online orders (Mercari, Yahoo Auctions), we purchase the same day once payment is confirmed." },
      ]
    },
    {
      category: "Pricing",
      items: [
        { q: "How much does it cost?", a: "Our pricing is fully personalised — every request is different. Contact us for a transparent quote with no hidden fees. For large orders, we apply a percentage-based fee rather than a flat rate per item." },
        { q: "Are there any hidden fees?", a: "Never. We communicate every cost clearly before you pay anything. Item price, service fee, and shipping are all broken down separately." },
        { q: "When do I pay?", a: "Payment in two parts: first the item price and service fee before we purchase, then shipping costs once your item is ready to ship." },
        { q: "Do you offer discounts for large orders?", a: "Yes — for orders with multiple items or high total value, we apply a reduced percentage fee. Contact us and we'll work out the fairest arrangement." },
      ]
    },
    {
      category: "Platforms & purchasing",
      items: [
        { q: "Can you buy from Mercari Japan?", a: "Yes — Mercari Japan is one of our most common requests. We handle all communication with sellers, payment, and shipping. Most Mercari orders are purchased the same day." },
        { q: "Can you buy from Yahoo Auctions Japan?", a: "Yes — we bid on Yahoo Auctions Japan on your behalf. Tell us the item, your maximum bid, and whether you want a real-time or sniper bid. We monitor the auction and notify you of the result." },
        { q: "Can you visit physical stores in Tokyo?", a: "Yes — this is one of our biggest advantages. We visit Pokémon Center, Nintendo Store, Akihabara stores, Supreme Japan, and any other physical location in Tokyo. We can even do a live video call so you can shop in real time." },
        { q: "Can you attend exclusive events and drops?", a: "Yes — we queue at Supreme Japan drops, attend Pokémon Center event releases, and visit any Tokyo event or pop-up on your behalf. Contact us in advance with the event details." },
      ]
    },
    {
      category: "Shipping",
      items: [
        { q: "Which countries do you ship to?", a: "We ship worldwide — USA, Canada, France, Germany, UK, Italy, Greece, Indonesia, South Korea, Australia and many more." },
        { q: "What shipping methods do you use?", a: "We use Japan Post EMS, FedEx International, DHL Express, and Yamato TA-Q-BIN depending on your destination, order value, and preference." },
        { q: "How long does shipping take?", a: "Typically 5-10 business days via EMS to Europe and North America. FedEx and DHL are faster at 2-4 days. We always provide tracking." },
        { q: "When are packages shipped?", a: "We consolidate and ship packages once a week from Tokyo. Orders placed early in the week ship the fastest." },
      ]
    },
    {
      category: "Trust & safety",
      items: [
        { q: "How do I know you're legitimate?", a: "We have verified reviews on Reddit from real customers in USA, Canada, Greece, Indonesia and more — all with direct links to the original posts. We're also on Trustpilot." },
        { q: "What if the item arrives damaged?", a: "We photograph everything before shipping. If an item arrives damaged due to our packaging, we work with you to find a solution." },
        { q: "Can I see the item before it ships?", a: "Yes — we always send photos of your item once we have it in hand, before shipping. If anything looks different from the listing, we contact you before proceeding." },
      ]
    },
  ],
  fr: [
    {
      category: "Pour commencer",
      items: [
        { q: "Qu'est-ce qu'un service proxy Japan ?", a: "Un service proxy achète des articles pour vous depuis des sites japonais ou des boutiques physiques à Tokyo. Nous agissons comme votre représentant local — vous nous dites ce que vous voulez, nous l'achetons et vous l'expédions directement." },
        { q: "Comment faire une demande ?", a: "Remplissez le formulaire sur notre page d'accueil ou envoyez-nous un email à kizunaproxy@gmail.com. Décrivez l'article, partagez un lien si vous en avez un. Nous répondons sous 24h avec un devis." },
        { q: "Combien de temps pour une réponse ?", a: "Nous répondons à toutes les demandes sous 24 heures. Pour la plupart des commandes en ligne, nous achetons le jour même une fois le paiement confirmé." },
      ]
    },
    {
      category: "Tarifs",
      items: [
        { q: "Combien ça coûte ?", a: "Nos tarifs sont entièrement personnalisés — chaque demande est différente. Contactez-nous pour un devis transparent sans frais cachés." },
        { q: "Y a-t-il des frais cachés ?", a: "Jamais. Nous communiquons chaque coût clairement avant tout paiement. Prix de l'article, frais de service et expédition sont détaillés séparément." },
        { q: "Quand est-ce que je paie ?", a: "En deux fois : d'abord le prix de l'article et les frais de service avant l'achat, puis les frais d'expédition une fois votre article prêt." },
        { q: "Des réductions pour les grandes commandes ?", a: "Oui — pour les commandes avec plusieurs articles ou de grande valeur, nous appliquons un pourcentage réduit. Contactez-nous pour le meilleur arrangement." },
      ]
    },
    {
      category: "Plateformes & achats",
      items: [
        { q: "Pouvez-vous acheter sur Mercari Japan ?", a: "Oui — Mercari Japan est l'une de nos demandes les plus courantes. Nous gérons toute la communication avec les vendeurs. La plupart des commandes sont achetées le jour même." },
        { q: "Pouvez-vous acheter sur Yahoo Auctions Japan ?", a: "Oui — nous enchérissons sur Yahoo Auctions Japan pour vous. Dites-nous votre enchère maximale et nous surveillons l'enchère." },
        { q: "Pouvez-vous visiter des boutiques à Tokyo ?", a: "Oui — c'est l'un de nos plus grands avantages. Pokémon Center, Nintendo Store, Supreme Japan, Akihabara et n'importe quelle boutique. On peut même faire du shopping en direct par appel vidéo." },
        { q: "Pouvez-vous assister à des événements exclusifs ?", a: "Oui — drops Supreme Japan, sorties Pokémon Center, pop-ups — nous y allons pour vous. Contactez-nous à l'avance avec les détails." },
      ]
    },
    {
      category: "Expédition",
      items: [
        { q: "Dans quels pays livrez-vous ?", a: "Nous livrons dans le monde entier — USA, Canada, France, Allemagne, Royaume-Uni, Italie, Grèce, Indonésie, Corée du Sud, Australie et bien plus." },
        { q: "Quels transporteurs utilisez-vous ?", a: "Japan Post EMS, FedEx International, DHL Express et Yamato TA-Q-BIN selon votre destination et préférence." },
        { q: "Combien de temps prend l'expédition ?", a: "5 à 10 jours ouvrés via EMS vers l'Europe et l'Amérique du Nord. FedEx et DHL sont plus rapides : 2 à 4 jours." },
        { q: "Quand les colis sont-ils expédiés ?", a: "Nous regroupons et expédions les colis une fois par semaine depuis Tokyo. Les commandes passées en début de semaine partent plus vite." },
      ]
    },
    {
      category: "Confiance & sécurité",
      items: [
        { q: "Comment savoir que vous êtes légitimes ?", a: "Nous avons des avis vérifiés sur Reddit de vrais clients aux USA, Canada, Grèce, Indonésie et plus — avec des liens directs vers les posts originaux. Nous sommes aussi sur Trustpilot." },
        { q: "Et si l'article arrive endommagé ?", a: "Nous photographions tout avant l'expédition. Si un article arrive endommagé à cause de notre emballage, nous trouvons une solution avec vous." },
        { q: "Puis-je voir l'article avant l'envoi ?", a: "Oui — nous envoyons toujours des photos de votre article une fois en main, avant expédition. Si quelque chose diffère de l'annonce, nous vous contactons avant de procéder." },
      ]
    },
  ],
};

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: open ? "var(--surface2)" : "var(--surface)",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        transition: "background .15s",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.1rem 1.5rem", gap: "1rem",
      }}>
        <span style={{ fontSize: ".88rem", fontWeight: 500, color: "var(--ink)", lineHeight: 1.4 }}>{q}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0, color: "var(--red)" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && (
        <div style={{ padding: ".25rem 1.5rem 1.1rem", fontSize: ".82rem", lineHeight: 1.85, color: "var(--warm)", fontWeight: 300 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function FaqClient() {
  const [lang] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("kizuna-lang") || detectLang();
  });

  const t = translations[lang as keyof typeof translations] || translations.en;
  const faqs = FAQS[lang as keyof typeof FAQS] || FAQS.en;

  return (
    <>
    <SiteNav />
    <main style={{ minHeight: "100vh", background: "var(--beige)", padding: "7rem 2rem 8rem" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        {/* Back */}
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", fontSize: ".65rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--mist)", textDecoration: "none", marginBottom: "3rem" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </a>

        {/* Header */}
        <p style={{ fontSize: ".6rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--red)", marginBottom: ".75rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
          <span style={{ display: "block", width: "20px", height: "1px", background: "var(--red)" }} />
          {t.faq?.label || "FAQ"}
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 300, color: "var(--ink)", marginBottom: ".75rem" }}>
          {t.faq?.title || "Common"} <em style={{ color: "var(--red)", fontStyle: "italic" }}>{t.faq?.titleEm || "questions"}</em>
        </h1>
        <p style={{ fontSize: ".88rem", color: "var(--warm)", fontWeight: 300, lineHeight: 1.8, marginBottom: "3rem" }}>
          Can't find your answer?{" "}
          <a href="mailto:kizunaproxy@gmail.com" style={{ color: "var(--red)", textDecoration: "none" }}>Email us</a>{" "}
          — we reply within 24 hours.
        </p>

        {/* FAQ sections */}
        {faqs.map((section, si) => (
          <div key={si} style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: ".58rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--red)", fontWeight: 500 }}>
                {section.category}
              </span>
              <span style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>
            <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
              {section.items.map((item, ii) => (
                <FaqItem key={ii} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div style={{
          padding: "2rem 2.5rem", background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "1rem", marginTop: "1rem",
        }}>
          <div>
            <strong style={{ display: "block", fontSize: ".95rem", color: "var(--ink)", marginBottom: ".3rem" }}>
              Still have a question?
            </strong>
            <p style={{ fontSize: ".82rem", color: "var(--mist)", margin: 0, fontWeight: 300 }}>
              We reply within 24 hours — real answers, no bots.
            </p>
          </div>
          <a href="mailto:kizunaproxy@gmail.com" style={{
            background: "var(--red)", color: "#fff", padding: ".65rem 1.4rem",
            fontSize: ".65rem", letterSpacing: ".1em", textTransform: "uppercase",
            fontFamily: "'Inter',sans-serif", fontWeight: 500, textDecoration: "none", borderRadius: "6px",
          }}>
            Contact us →
          </a>
        </div>
      </div>
    </main>
    </>
  );
}
