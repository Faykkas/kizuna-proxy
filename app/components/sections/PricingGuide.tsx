// @ts-nocheck
"use client";

// Page Tarifs : toutes les prestations et leurs prix en yens, dans la langue du visiteur (textes : app/pricing/pricingCopy*.ts).
// Chaque prix vient du cahier des charges du propriétaire : ne rien inventer ici (pas de garantie, pas de remboursement
// ni de condition qui ne soit pas écrit dans les textes). Les prix de /reservation-assistance sont dans ReservationClient.
// Les montants en yens sont aussi affichés dans la monnaie du visiteur (indicatif, les paiements restent en JPY).

import ShippingPartners from "./ShippingPartners";
import CurrencyPicker from "../CurrencyPicker";
import { Icon } from "../PricingIcons";
import { pricingCopy } from "../../pricing/pricingCopy";
import { useLang } from "../useSiteState";
import { useCurrency } from "../../lib/useCurrency";
import { hasYen } from "../../lib/currency";

const MAIL = "mailto:kizunaproxy@gmail.com";

// Sections de la page : [ancre, icône]. L'ordre suit `nav` dans les textes.
const NAV = [["online", "cart"], ["in-store", "store"], ["coach", "bag"], ["business", "briefcase"], ["storage", "box"], ["pickup", "download"], ["seller", "chat"], ["requests", "clipboard"], ["terms", "shield"], ["faq", "help"]];

// Une ligne du récapitulatif = [ancre de la section, icône]. Même ordre que `overview.rows`.
const GLANCE = [["online", "cart"], ["online", "cart"], ["online", "bag"], ["in-store", "store"], ["coach", "bag"], ["business", "briefcase"], ["storage", "box"], ["pickup", "download"], ["pickup", "box"], ["seller", "chat"], ["seller", "calendar"], ["packaging", "gift"]];

function Card({ icon, title, price, from, sub, local, children, cta, href, featured }: any) {
  return (
    <article className={`pg-card${featured ? " pg-card-featured" : ""}`}>
      <div className="pg-card-head">
        <span className="pg-ico"><Icon name={icon} /></span>
        <h3>{title}</h3>
      </div>
      <div className="pg-price">
        {from ? <span className="pg-from">{from}</span> : null}
        {price}
      </div>
      {local ? <div className="pg-local">≈ {local}</div> : null}
      {sub ? <p className="pg-sub">{sub}</p> : null}
      <div className="pg-body">{children}</div>
      {cta ? <a className="btn btn-gold pg-cta" href={href}>{cta}</a> : null}
    </article>
  );
}

function Section({ id, label, title, intro, children }: any) {
  return (
    <section id={id} className="section-sm pg-section reveal">
      <div className="wrap">
        <div className="sec-head">
          <p className="sec-label">{label}</p>
          <h2>{title}</h2>
          {intro ? <p className="desc">{intro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function Panel({ icon, title, warn, children }: any) {
  return (
    <div className={`pg-panel${warn ? " pg-panel-warn" : ""}`}>
      <div className="pg-panel-head">
        {icon ? <span className="pg-ico pg-ico-sm"><Icon name={icon} size={18} /></span> : null}
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return <ul className="pg-list">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

function Example({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="pg-example">
      <strong>{title}</strong>
      <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </div>
  );
}

export default function PricingGuide({ t }: { t: any }) {
  const { lang } = useLang();
  const c = pricingCopy(lang);
  const cur = useCurrency(lang);
  // Conversion indicative d'un texte contenant des yens ; vide quand il n'y a rien à convertir.
  const local = (text: string) => (cur.active && hasYen(text) ? cur.conv(text) : "");

  return (
    <>
      {/* Introduction, monnaie, accès rapide */}
      <section className="section-sm pg-intro">
        <div className="wrap">
          <p className="pg-lead">{c.lead}</p>
          <CurrencyPicker cur={cur} copy={c.cur} lang={lang} />
          <nav className="pg-nav" aria-label={c.overview.title}>
            {NAV.map(([id, icon], i) => <a key={id} href={`#${id}`}><Icon name={icon} size={15} />{c.nav[i]}</a>)}
          </nav>
        </div>
      </section>

      {/* Récapitulatif */}
      <section className="section-sm pg-section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{c.overview.label}</p>
            <h2>{c.overview.title}</h2>
            <p className="desc">{c.overview.note}</p>
          </div>
          <div className="pg-glance">
            {c.overview.rows.map(([label, value], i) => (
              <a key={label} href={`#${GLANCE[i][0]}`} className="pg-tile">
                <span className="pg-ico"><Icon name={GLANCE[i][1]} /></span>
                <span className="pg-tile-text">
                  <span className="pg-tile-label">{label}</span>
                  <strong>{value}</strong>
                  {local(value) ? <span className="pg-local">≈ {local(value)}</span> : null}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Achats en ligne */}
      <Section id="online" label={c.online.label} title={c.online.title} intro={c.online.intro}>
        <div className="pg-grid">
          <Card icon="cart" title={c.online.standard.title} price={c.online.standard.price} local={local(c.online.standard.price)} sub={c.online.standard.sub} cta={c.online.standard.cta} href="/request">
            <ul className="pg-table">
              {c.online.standard.rows.map(([k, v]) => (
                <li key={k}><span>{k}</span><strong>{v}{local(v) ? <em className="pg-local">≈ {local(v)}</em> : null}</strong></li>
              ))}
            </ul>
            <p>{c.online.standard.text}</p>
            <p className="pg-links"><a href="/blog/how-to-buy-from-mercari-japan">{c.online.standard.guide}</a></p>
          </Card>

          <Card icon="bag" title={c.online.onitsuka.title} price={c.online.onitsuka.price} local={local(c.online.onitsuka.price)} sub={c.online.onitsuka.sub} featured cta={c.online.onitsuka.cta} href="/request">
            <Example title={c.online.onitsuka.exTitle} items={c.online.onitsuka.ex} />
            <p>{c.online.onitsuka.text}</p>
            <p className="pg-links"><a href="/blog/buy-onitsuka-tiger-japan">{c.online.onitsuka.guide}</a></p>
          </Card>
        </div>
      </Section>

      {/* Achats en boutique */}
      <Section id="in-store" label={c.instore.label} title={c.instore.title} intro={c.instore.intro}>
        <div className="pg-grid">
          <Card icon="calendar" title={c.instore.reservation.title} price={c.instore.reservation.price} local={local(c.instore.reservation.price)} sub={c.instore.reservation.sub}>
            <p>{c.instore.reservation.text}</p>
          </Card>
          <Card icon="bag" title={c.instore.item.title} price={c.instore.item.price} local={local(c.instore.item.price)} sub={c.instore.item.sub}>
            <p>{c.instore.item.text}</p>
          </Card>
        </div>

        <div className="pg-split">
          <Panel icon="shield" title={c.instore.refund.title}><p>{c.instore.refund.text}</p></Panel>
          <Panel icon="clipboard" title={c.instore.list.title}>
            <p>{c.instore.list.intro}</p>
            <List items={c.instore.list.items} />
          </Panel>
          <Panel icon="globe" title={c.instore.offline.title}><p>{c.instore.offline.text}</p></Panel>
        </div>
        <p className="pg-note"><span className="pg-ico pg-ico-sm"><Icon name="ticket" size={18} /></span>{c.policy.items[0][1]}</p>
        <p className="pg-actions">
          <a className="btn btn-gold" href={`${MAIL}?subject=In-store%20shopping%20request`}>{c.instore.cta}</a>
          <a className="btn btn-outline" href="/tokyo-in-store-personal-shopper">{c.instore.link}</a>
        </p>
      </Section>

      {/* Coach */}
      <Section id="coach" label={c.coach.label} title={c.coach.title} intro={c.coach.intro}>
        <div className="pg-grid">
          <Card icon="bag" title={c.coach.card.title} price={c.coach.card.price} sub={c.coach.card.sub} cta={c.coach.card.cta} href="/request">
            <Example title={c.coach.card.exTitle} items={c.coach.card.ex} />
            <p>{c.coach.card.text}</p>
            <p className="pg-links"><a href="/blog/buy-coach-bags-japan">{c.coach.card.guide}</a></p>
          </Card>
        </div>
      </Section>

      {/* Entreprises */}
      <Section id="business" label={c.business.label} title={c.business.title} intro={c.business.intro}>
        <div className="pg-grid">
          <Card icon="briefcase" title={c.business.card.title} price={c.business.card.price} sub={c.business.card.sub} cta={c.business.card.cta} href="/business-sourcing">
            <p>{c.business.card.t1}</p>
            <p>{c.business.card.t2}</p>
          </Card>
        </div>
      </Section>

      {/* Stockage */}
      <Section id="storage" label={c.storage.label} title={c.storage.title} intro={c.storage.intro}>
        <div className="pg-grid">
          <Card icon="box" title={c.storage.card.title} price={c.storage.card.price} from={c.storage.card.from} local={local(c.storage.card.price)} sub={c.storage.card.sub} cta={c.storage.card.cta} href="/request">
            <p>{c.storage.card.text}</p>
            <List items={c.storage.card.ex} />
            <p>{c.storage.card.text2}</p>
            <p className="pg-links"><a href="/blog/japan-package-forwarding-guide">{c.storage.card.guide}</a></p>
          </Card>
        </div>
      </Section>

      {/* Retrait en magasin + réception de colis */}
      <Section id="pickup" label={c.pickup.label} title={c.pickup.title}>
        <div className="pg-grid">
          <Card icon="download" title={c.pickup.a.title} price={c.pickup.a.price} local={local(c.pickup.a.price)} sub={c.pickup.a.sub} cta={c.pickup.a.cta} href="/request">
            <p>{c.pickup.a.t1}</p>
            <p>{c.pickup.a.t2}</p>
          </Card>
          <Card icon="box" title={c.pickup.b.title} price={c.pickup.b.price} local={local(c.pickup.b.price)} sub={c.pickup.b.sub} cta={c.pickup.b.cta} href="/request">
            <p>{c.pickup.b.t1}</p>
            <p>{c.pickup.b.t2}</p>
          </Card>
        </div>
      </Section>

      {/* Messages aux vendeurs + réservation hôtel/restaurant */}
      <Section id="seller" label={c.seller.label} title={c.seller.title}>
        <div className="pg-grid">
          <Card icon="chat" title={c.seller.a.title} price={c.seller.a.price} local={local(c.seller.a.price)} sub={c.seller.a.sub}>
            <p>{c.seller.a.intro}</p>
            <List items={c.seller.a.items} />
            <p>{c.seller.a.text}</p>
          </Card>
          <Card icon="calendar" title={c.seller.b.title} price={c.seller.b.price} local={local(c.seller.b.price)} sub={c.seller.b.sub} cta={c.seller.b.cta} href="/reservation-assistance">
            <p>{c.seller.b.text}</p>
          </Card>
        </div>
      </Section>

      {/* Emballage */}
      <section id="packaging" className="section-sm pg-section reveal">
        <div className="wrap">
          <div className="pg-banner">
            <div>
              <span className="pg-ico pg-ico-lg"><Icon name="gift" size={30} /></span>
              <p className="sec-label">{c.packaging.label}</p>
              <h2>{c.packaging.title}</h2>
              <span className="pg-free">{c.packaging.badge}</span>
              <p>{c.packaging.text}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Produits non pris en charge */}
      <Section id="restricted" label={c.restricted.label} title={c.restricted.title} intro={c.restricted.intro}>
        <ul className="pg-chips">
          {c.restricted.items.map((i) => <li key={i}><Icon name="ban" size={16} />{i}</li>)}
        </ul>
        <p className="pg-small">{c.restricted.note}</p>
      </Section>

      {/* Comment envoyer une demande précise */}
      <Section id="requests" label={c.requests.label} title={c.requests.title} intro={c.requests.intro}>
        <div className="pg-split">
          <Panel icon="clipboard" title={c.requests.a.title}><List items={c.requests.a.items} /></Panel>
          <Panel icon="ban" title={c.requests.b.title} warn>
            <blockquote>{c.requests.b.quote}</blockquote>
            <p>{c.requests.b.text}</p>
          </Panel>
          <Panel icon="pin" title={c.requests.c.title}><p>{c.requests.c.text}</p></Panel>
        </div>
        <p className="pg-actions"><a className="btn btn-gold" href="/request">{c.requests.cta}</a></p>
      </Section>

      {/* Conditions importantes + conditions générales */}
      <Section id="terms" label={c.policy.label} title={c.policy.title}>
        <div className="pg-policy">
          {c.policy.items.map(([head, text], i) => (
            <div key={head} className="pg-policy-item">
              <span className="pg-ico"><Icon name={["ticket", "card", "pin"][i]} /></span>
              <h3>{head}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="sec-head pg-terms-head">
          <p className="sec-label">{c.terms.label}</p>
          <h2>{c.terms.title}</h2>
        </div>
        <ul className="pg-terms">
          {c.terms.items.map((i) => <li key={i}>{i}</li>)}
        </ul>
      </Section>

      {/* FAQ */}
      <Section id="faq" label={c.faq.label} title={c.faq.title}>
        <div className="pg-faq">
          {c.faq.items.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <p className="pg-small">{c.faq.more.pre} <a href="/faq">{c.faq.more.faq}</a> · <a href="/shipping">{c.faq.more.ship}</a> · <a href="/how-it-works">{c.faq.more.how}</a></p>
      </Section>

      {/* Appel final */}
      <section className="section-sm reveal">
        <div className="wrap">
          <div className="pcg-cta">
            <div className="pcg-cta-left">
              <strong>{c.final.title}</strong>
              <p>{c.final.text}</p>
            </div>
            <a href="/request" className="btn btn-gold">{c.final.cta1}</a>
            <a href={MAIL} className="btn btn-outline">{c.final.cta2}</a>
          </div>
        </div>
      </section>

      <section className="section-sm reveal">
        <div className="wrap">
          <ShippingPartners t={t} />
        </div>
      </section>
    </>
  );
}
