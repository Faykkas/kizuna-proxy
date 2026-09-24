// @ts-nocheck
"use client";

import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AnnounceBar from "../components/AnnounceBar";
import { BackToTop } from "../components/ui";
import { useLang, useAnnounce } from "../components/useSiteState";
import { useLanguage } from "../lib/language";
import { reopenCookiePreferences } from "../components/CookieConsent";
import { privacyPolicyTranslations } from "../privacyPolicyTranslations";

const LAST_UPDATED = "September 24, 2026";
const ADDRESS = "1-12-4 Ginza N&E BLD. 6F, Chuo-ku, Tokyo 104-0061, Japan";

const cookieBtnStyle = { background: "none", border: "none", padding: 0, color: "var(--red)", textDecoration: "underline", cursor: "pointer", font: "inherit" };

// Splits a string on {email}/{address}/{cookieBtn} tokens and swaps each for
// the matching clickable element, so the surrounding prose stays fully
// translatable while the interactive/contact bits stay real.
function renderTokens(str, p) {
  return str.split(/(\{email\}|\{address\}|\{cookieBtn\})/g).map((part, i) => {
    if (part === "{email}") return <a key={i} href="mailto:kizunaproxy@gmail.com">kizunaproxy@gmail.com</a>;
    if (part === "{address}") return <span key={i}>{ADDRESS}</span>;
    if (part === "{cookieBtn}") return <button key={i} type="button" onClick={() => reopenCookiePreferences()} style={cookieBtnStyle}>{p.cookieBtnLabel}</button>;
    return part;
  });
}

export default function PrivacyPolicyClient() {
  const { t } = useLang();
  const { lang } = useLanguage();
  const announce = useAnnounce();
  const p = privacyPolicyTranslations[lang] || privacyPolicyTranslations.en;

  return (
    <>
      <AnnounceBar announce={announce} />
      <SiteNav />
      <main className="blog-page">
        <div className="blog-wrap">
          <div className="blog-eyebrow">{p.eyebrow}</div>
          <h1>{p.title}<em>{p.titleEm}</em></h1>
          <p className="blog-lead">{renderTokens(p.lead.replace("{date}", LAST_UPDATED), p)}</p>
          <hr className="blog-hr" />

          <h2>{p.whoTitle}</h2>
          <p>{renderTokens(p.whoBody, p)}</p>

          <h2>{p.whatTitle}</h2>
          <ul className="blog-list">
            {p.whatList.map((item, i) => (
              <li key={i}><strong>{item.strong}</strong> {item.text}</li>
            ))}
          </ul>

          <h2>{p.whyTitle}</h2>
          <p>{p.whyBody}</p>

          <h2>{p.shareTitle}</h2>
          <ul className="blog-list">
            {p.shareList.map((item, i) => (
              <li key={i}><strong>{item.strong}</strong> {item.text}</li>
            ))}
          </ul>
          <p>{p.shareNote}</p>

          <h2>{p.cookiesTitle}</h2>
          <p>{p.cookiesIntro}</p>
          <ul className="blog-list">
            {p.cookiesList.map((item, i) => (
              <li key={i}><strong>{item.strong}</strong> {item.text}</li>
            ))}
          </ul>
          <p>{renderTokens(p.cookiesChange, p)}</p>

          <h2>{p.retentionTitle}</h2>
          <p>{p.retentionBody}</p>

          <h2>{p.rightsTitle}</h2>
          <p>{renderTokens(p.rightsBody, p)}</p>

          <h2>{p.changesTitle}</h2>
          <p>{p.changesBody}</p>

          <hr className="blog-hr" />
          <div className="blog-cta">
            <p>{p.ctaText}</p>
            <a href="mailto:kizunaproxy@gmail.com" className="btn btn-gold">{p.ctaBtn}</a>
          </div>
        </div>
      </main>
      <SiteFooter t={t} />
      <BackToTop />
    </>
  );
}
