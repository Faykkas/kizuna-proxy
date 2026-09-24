// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import { BackToTop } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";
import { useLanguage } from "../lib/language";
import { reopenCookiePreferences } from "../components/CookieConsent";

const LAST_UPDATED = "September 24, 2026";

const EN = (
  <>
    <div className="blog-eyebrow">Legal</div>
    <h1>Privacy <em>& Cookie Policy</em></h1>
    <p className="blog-lead">
      Kizuna Proxy is a small, Tokyo-based personal shopping service. This page explains what personal data
      we collect when you use kizunaproxy.com, why we collect it, who we share it with, and how you can
      control it. Last updated: {LAST_UPDATED}.
    </p>
    <hr className="blog-hr" />

    <h2>Who we are</h2>
    <p>
      "Kizuna Proxy", "we", "us" refers to the personal shopping service operated from Tokyo, Japan,
      reachable at <a href="mailto:kizunaproxy@gmail.com">kizunaproxy@gmail.com</a> or 1-12-4 Ginza N&amp;E
      BLD. 6F, Chuo-ku, Tokyo 104-0061, Japan. If you have any question about this policy or your data,
      that email is the fastest way to reach us.
    </p>

    <h2>What we collect</h2>
    <ul className="blog-list">
      <li><strong>Contact details</strong> — name, email address, phone number, and delivery address, given when you submit a request, create an account, or pay through a payment link.</li>
      <li><strong>Order details</strong> — what you want us to buy, item links, budget, quantity, platform, and any notes you add.</li>
      <li><strong>Communication</strong> — messages you send us by email, WhatsApp, or Discord, so we can answer and keep a record of what was agreed.</li>
      <li><strong>Account data</strong> — if you create a customer account, your email and a securely hashed password (we never see or store the password itself).</li>
      <li><strong>Payment information</strong> — we never see or store your card number. Payments are processed entirely by PayPal, which shares with us only the payer's name, email, and the shipping address you confirm at checkout.</li>
      <li><strong>Basic technical data</strong> — anonymised, cookie-free visit statistics from Vercel Analytics, and your saved language preference.</li>
    </ul>

    <h2>Why we collect it</h2>
    <p>
      Strictly to run the service you asked for: sourcing and buying your item, communicating with you about
      it, arranging payment and shipping, providing customer support, and keeping the accounting records
      Japanese law requires us to keep. We don't use your data for advertising, and we don't sell it to
      anyone.
    </p>

    <h2>Who we share it with</h2>
    <ul className="blog-list">
      <li><strong>PayPal</strong> — to process your payment. PayPal's own privacy policy applies to that transaction.</li>
      <li><strong>Supabase</strong> — our database and account-login provider, which stores your order and account data securely.</li>
      <li><strong>Vercel</strong> — our hosting provider, which also provides the anonymised visit statistics mentioned above.</li>
      <li><strong>Resend</strong> — sends us an email notification when you submit a request. It only ever sends to our own inbox, never to a third party.</li>
      <li><strong>Trustpilot</strong> — only if you accept optional cookies (see below), to let you leave a review.</li>
    </ul>
    <p>
      Some of these providers process data on servers outside Japan or the EU/EEA (for example, in the
      United States). Each of them maintains its own safeguards for international transfers; we don't
      transfer your data anywhere ourselves beyond using these services.
    </p>

    <h2>Cookies</h2>
    <p>We use a small number of cookies and local-storage entries:</p>
    <ul className="blog-list">
      <li><strong>Necessary</strong> — your sign-in session (Supabase Auth) and your saved language, so the site works and remembers your preferences. These always apply and can't be turned off without breaking the site.</li>
      <li><strong>Optional</strong> — Trustpilot's invite widget, which can set its own cookies. It only loads after you accept it in the cookie banner.</li>
      <li><strong>Analytics</strong> — Vercel Analytics, which is cookie-free and doesn't identify you individually.</li>
    </ul>
    <p>
      You can change your cookie choice at any time — {" "}
      <button
        type="button"
        onClick={() => reopenCookiePreferences()}
        style={{ background: "none", border: "none", padding: 0, color: "var(--red)", textDecoration: "underline", cursor: "pointer", font: "inherit" }}
      >
        open cookie preferences
      </button>.
    </p>

    <h2>How long we keep it</h2>
    <p>
      We keep order and account data for as long as your account is active, plus the period Japanese
      accounting and tax law requires us to retain business records. If you ask us to delete your account,
      we remove what we're not legally required to keep.
    </p>

    <h2>Your rights</h2>
    <p>
      You can ask us at any time to see what data we hold about you, correct it, or delete it — email{" "}
      <a href="mailto:kizunaproxy@gmail.com">kizunaproxy@gmail.com</a> and we'll reply within a few days.
      If you're in the EU/EEA or UK, this includes the rights available to you under GDPR/UK GDPR; if
      you're in Japan, the rights available to you under the Act on the Protection of Personal Information.
    </p>

    <h2>Changes to this policy</h2>
    <p>
      If we change how we handle your data, we'll update this page and the date at the top. Significant
      changes will also be flagged the next time you visit.
    </p>

    <hr className="blog-hr" />
    <div className="blog-cta">
      <p>Questions about your data?</p>
      <a href="mailto:kizunaproxy@gmail.com" className="btn btn-gold">Contact us →</a>
    </div>
  </>
);

const FR = (
  <>
    <div className="blog-eyebrow">Mentions légales</div>
    <h1>Politique de confidentialité <em>&amp; cookies</em></h1>
    <p className="blog-lead">
      Kizuna Proxy est un petit service d'achat personnel basé à Tokyo. Cette page explique quelles
      données personnelles nous collectons lorsque vous utilisez kizunaproxy.com, pourquoi, avec qui nous
      les partageons, et comment vous pouvez les contrôler. Dernière mise à jour : {LAST_UPDATED}.
    </p>
    <hr className="blog-hr" />

    <h2>Qui nous sommes</h2>
    <p>
      « Kizuna Proxy », « nous » désigne le service d'achat personnel opéré depuis Tokyo, Japon, joignable à{" "}
      <a href="mailto:kizunaproxy@gmail.com">kizunaproxy@gmail.com</a> ou au 1-12-4 Ginza N&amp;E BLD. 6F,
      Chuo-ku, Tokyo 104-0061, Japon. Pour toute question sur cette politique ou vos données, cet email est
      le moyen le plus rapide de nous joindre.
    </p>

    <h2>Ce que nous collectons</h2>
    <ul className="blog-list">
      <li><strong>Coordonnées</strong> — nom, email, numéro de téléphone et adresse de livraison, fournis lors d'une demande, de la création d'un compte, ou d'un paiement via un lien de paiement.</li>
      <li><strong>Détails de commande</strong> — ce que vous souhaitez acheter, liens d'articles, budget, quantité, plateforme, et toute note que vous ajoutez.</li>
      <li><strong>Communication</strong> — les messages que vous nous envoyez par email, WhatsApp ou Discord, pour pouvoir vous répondre et garder une trace de ce qui a été convenu.</li>
      <li><strong>Données de compte</strong> — si vous créez un compte client, votre email et un mot de passe stocké de façon sécurisée et chiffrée (nous ne voyons ni ne stockons jamais le mot de passe lui-même).</li>
      <li><strong>Informations de paiement</strong> — nous ne voyons ni ne stockons jamais votre numéro de carte. Les paiements sont entièrement traités par PayPal, qui nous transmet uniquement le nom, l'email et l'adresse de livraison confirmés par le payeur.</li>
      <li><strong>Données techniques basiques</strong> — statistiques de visite anonymisées et sans cookie via Vercel Analytics, et votre préférence de langue enregistrée.</li>
    </ul>

    <h2>Pourquoi nous les collectons</h2>
    <p>
      Uniquement pour assurer le service que vous nous avez demandé : rechercher et acheter votre article,
      communiquer avec vous à ce sujet, organiser le paiement et l'expédition, assurer le support client, et
      tenir les registres comptables exigés par la loi japonaise. Nous n'utilisons jamais vos données à des
      fins publicitaires, et nous ne les vendons à personne.
    </p>

    <h2>Avec qui nous les partageons</h2>
    <ul className="blog-list">
      <li><strong>PayPal</strong> — pour traiter votre paiement. La politique de confidentialité de PayPal s'applique à cette transaction.</li>
      <li><strong>Supabase</strong> — notre fournisseur de base de données et de connexion, qui stocke vos données de commande et de compte de façon sécurisée.</li>
      <li><strong>Vercel</strong> — notre hébergeur, qui fournit également les statistiques de visite anonymisées mentionnées ci-dessus.</li>
      <li><strong>Resend</strong> — nous envoie une notification email lorsque vous soumettez une demande. Cet envoi va uniquement vers notre propre boîte mail, jamais vers un tiers.</li>
      <li><strong>Trustpilot</strong> — uniquement si vous acceptez les cookies optionnels (voir ci-dessous), pour vous permettre de laisser un avis.</li>
    </ul>
    <p>
      Certains de ces prestataires traitent les données sur des serveurs situés hors du Japon ou de l'UE/EEE
      (par exemple aux États-Unis). Chacun applique ses propres garanties pour les transferts
      internationaux ; nous ne transférons nous-mêmes vos données nulle part au-delà de l'usage de ces
      services.
    </p>

    <h2>Cookies</h2>
    <p>Nous utilisons un petit nombre de cookies et d'entrées de stockage local :</p>
    <ul className="blog-list">
      <li><strong>Nécessaires</strong> — votre session de connexion (Supabase Auth) et votre langue enregistrée, pour que le site fonctionne et retienne vos préférences. Ils s'appliquent toujours et ne peuvent pas être désactivés sans casser le site.</li>
      <li><strong>Optionnels</strong> — le widget d'invitation Trustpilot, qui peut poser ses propres cookies. Il ne se charge qu'après votre acceptation dans le bandeau cookies.</li>
      <li><strong>Analytique</strong> — Vercel Analytics, qui ne pose pas de cookie et ne vous identifie pas individuellement.</li>
    </ul>
    <p>
      Vous pouvez modifier votre choix de cookies à tout moment —{" "}
      <button
        type="button"
        onClick={() => reopenCookiePreferences()}
        style={{ background: "none", border: "none", padding: 0, color: "var(--red)", textDecoration: "underline", cursor: "pointer", font: "inherit" }}
      >
        ouvrir les préférences cookies
      </button>.
    </p>

    <h2>Combien de temps nous les conservons</h2>
    <p>
      Nous conservons les données de commande et de compte tant que votre compte est actif, plus la durée
      exigée par le droit comptable et fiscal japonais pour la conservation des documents commerciaux. Si
      vous nous demandez de supprimer votre compte, nous effaçons ce que nous ne sommes pas légalement
      tenus de conserver.
    </p>

    <h2>Vos droits</h2>
    <p>
      Vous pouvez à tout moment nous demander de voir quelles données nous détenons sur vous, de les
      corriger ou de les supprimer — écrivez à{" "}
      <a href="mailto:kizunaproxy@gmail.com">kizunaproxy@gmail.com</a> et nous répondrons sous quelques
      jours. Si vous êtes dans l'UE/EEE ou au Royaume-Uni, cela inclut les droits prévus par le RGPD ; si
      vous êtes au Japon, les droits prévus par la loi japonaise sur la protection des informations
      personnelles.
    </p>

    <h2>Modifications de cette politique</h2>
    <p>
      Si nous changeons la façon dont nous traitons vos données, nous mettrons à jour cette page ainsi que
      la date en haut. Les changements importants seront également signalés lors de votre prochaine visite.
    </p>

    <hr className="blog-hr" />
    <div className="blog-cta">
      <p>Une question sur vos données ?</p>
      <a href="mailto:kizunaproxy@gmail.com" className="btn btn-gold">Nous contacter →</a>
    </div>
  </>
);

export default function PrivacyPolicyClient() {
  const { t } = useLang();
  const { lang } = useLanguage();
  const announce = useAnnounce();
  const content = lang === "fr" ? FR : EN;

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main className="blog-page">
        <div className="blog-wrap">
          {lang !== "en" && lang !== "fr" && (
            <p style={{ fontSize: ".75rem", color: "var(--mist)", marginBottom: "1rem" }}>
              This policy is available in English and French. Contact us if you need it in another language.
            </p>
          )}
          {content}
        </div>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
