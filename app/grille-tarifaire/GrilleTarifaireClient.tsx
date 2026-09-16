// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import Maneki from "../components/pixel/Maneki";
import { BackToTop, useScrollReveal } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";

const CATEGORIES = [
  {
    title: "Achats en boutique",
    desc: "Repérage et achat d'articles dans les magasins physiques, à Tokyo comme partout au Japon.",
    lines: [
      { label: "Frais de réservation / déplacement", price: "¥5 000", note: "par boutique — à régler au plus vite, avant la visite. Réserve votre créneau, même si l'article est finalement épuisé." },
      { label: "Frais d'achat en boutique", price: "¥1 000", note: "par article acheté" },
    ],
    footnote: "À partir de 5 articles achetés en une seule commande, une réduction est appliquée sur le tarif par article — nous consulter pour le détail selon la quantité.",
  },
  {
    title: "Événements à forte demande",
    desc: "Loteries, réservations, pop-up stores et ventes exclusives très demandées.",
    lines: [
      { label: "Frais d'accès en boutique", price: "¥8 000", note: "par événement" },
      { label: "Frais d'achat", price: "¥1 000", note: "par article acheté" },
    ],
    footnote: "Si un article s'avère finalement indisponible durant l'événement, les frais de réservation sont remboursés à 50% — nous nous serons tout de même déplacés sur place (remboursement net des frais PayPal).",
  },
  {
    title: "Achats en ligne",
    desc: "Mercari, Yahoo! Flea Market, Yahoo! Auctions et autres boutiques japonaises en ligne.",
    lines: [
      { label: "Commande occasionnelle (1 article)", price: "dès ¥3 000", note: "peut être plus élevé selon la valeur ou la complexité de la commande" },
      { label: "Achats actifs / réguliers sur marketplaces", price: "¥1 000", note: "par article acheté" },
    ],
  },
  {
    title: "Entreprises & grosses commandes",
    desc: "Kizuna travaille déjà avec plusieurs entreprises à travers le monde.",
    lines: [
      { label: "Commission", price: "10%", note: "sur la valeur de la marchandise achetée" },
      { label: "Achat + expédition", price: "inclus", note: "nous achetons la marchandise et l'expédions n'importe où dans le monde" },
    ],
  },
];

export default function GrilleTarifaireClient() {
  const { t } = useLang();
  const announce = useAnnounce();
  useScrollReveal();

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main>
        <header className="page-head">
          <div className="page-head-kana" aria-hidden="true">価</div>
          <div className="page-head-inner">
            <div className="px-head-mascot">
              <Maneki prop="coins" size={86} float />
              <span className="px-head-bubble">Tarifs à jour</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Accueil</a><span>/</span><span>Grille tarifaire</span>
            </nav>
            <h1>Grille <em>tarifaire</em></h1>
            <p>Le détail de nos tarifs par type de service. Un devis précis est toujours confirmé avant paiement.</p>
          </div>
        </header>

        <section className="section reveal">
          <div className="wrap">
            <div className="tarif-highlight">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              <div>
                <strong>Assistance incluse, sans frais caché</strong>
                <p>Nous sommes basés au Japon : appels aux boutiques, prise de renseignements, photos en magasin... tout est inclus dans les frais annoncés ci-dessous. Vous ne payez rien d'autre jusqu'à l'arrivée du colis chez vous.</p>
              </div>
            </div>

            <div className="tarif-cards">
              {CATEGORIES.map((cat, i) => (
                <div className="tarif-card" key={i}>
                  <h3>{cat.title}</h3>
                  <p className="tarif-card-desc">{cat.desc}</p>
                  <div className="tarif-lines">
                    {cat.lines.map((l, j) => (
                      <div className="tarif-line" key={j}>
                        <div className="tarif-line-top">
                          <span className="tarif-line-label">{l.label}</span>
                          <span className="tarif-line-price">{l.price}</span>
                        </div>
                        {l.note && <p className="tarif-line-note">{l.note}</p>}
                      </div>
                    ))}
                  </div>
                  {cat.footnote && <p className="tarif-card-footnote">{cat.footnote}</p>}
                </div>
              ))}
            </div>

            <div className="shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>Ces tarifs n'incluent pas les frais d'expédition internationale. Le prix dépend du poids du colis, nous ne pouvons donc pas fournir de tarif fixe à l'avance — il est communiqué avant tout paiement.</span>
            </div>

            <div className="shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span><strong>Résidents américains</strong> — les taxes douanières sont réglées via Zonos. Si vous souhaitez déclarer une valeur réduite sur le colis, Kizuna peut le faire à votre demande, mais décline toute responsabilité en cas de problème lié à cette déclaration.</span>
            </div>

            <div className="shipping-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              <span>Tous les remboursements sont effectués nets des frais PayPal.</span>
            </div>

            <div className="pcg-cta">
              <div className="pcg-cta-left">
                <strong>Une question sur votre commande ?</strong>
                <p>Contactez-nous directement, nous confirmons toujours le tarif exact avant tout paiement.</p>
              </div>
              <a href="mailto:kizunaproxy@gmail.com" className="btn btn-gold">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Nous contacter
              </a>
              <a href="/request" className="btn btn-outline">Faire une demande</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
