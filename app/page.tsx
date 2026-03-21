"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { translations, detectLang, LANG_LABELS, type Lang, type T } from "./translations";

// ─── CAROUSEL SLIDES ─────────────────────────────────────────────────────────
const SLIDES = [
  { src: "/gallery1.png", alt: "Order prepared for shipping" },
  { src: "/gallery2.png", alt: "Parcel ready to ship" },
  { src: "/gallery3.png", alt: "Items carefully packed" },
];

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <img src="/logo.png" alt="Kizuna Proxy"
      style={{ height: "58px", width: "auto", objectFit: "contain", filter: "drop-shadow(0 1px 3px rgba(13,11,9,.15))" }} />
  );
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
function IconInstagram({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconTiktok({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}
function StarIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
}
function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("revealed"); observer.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── DARK MODE ────────────────────────────────────────────────────────────────
function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("kizuna-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = useCallback(() => {
    setDark(d => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("kizuna-theme", next ? "dark" : "light");
      return next;
    });
  }, []);
  return [dark, toggle];
}

// ─── CAROUSEL ─────────────────────────────────────────────────────────────────
function Carousel() {
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((next: number) => {
    if (isAnimating || next === current) return;
    setAnimDir(next > current ? "left" : "right");
    setIsAnimating(true);
    setCurrent(next);
    setTimeout(() => { setIsAnimating(false); setAnimDir(null); }, 580);
  }, [isAnimating, current]);

  const move = useCallback((dir: number) => {
    goTo((current + dir + SLIDES.length) % SLIDES.length);
  }, [current, goTo]);

  const startAuto = useCallback(() => { autoRef.current = setInterval(() => move(1), 5000); }, [move]);
  const stopAuto = useCallback(() => { if (autoRef.current) clearInterval(autoRef.current); }, []);

  useEffect(() => { startAuto(); return stopAuto; }, [startAuto, stopAuto]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") move(-1); if (e.key === "ArrowRight") move(1); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [move]);
  useEffect(() => {
    const strip = thumbsRef.current;
    const active = strip?.querySelector<HTMLElement>(".thumb-active");
    if (strip && active) strip.scrollLeft = active.offsetLeft - strip.offsetWidth / 2 + active.offsetWidth / 2;
  }, [current]);

  const touchStartX = useRef(0);
  return (
    <div className="carousel" onMouseEnter={stopAuto} onMouseLeave={startAuto}>
      <div className="carousel-stage"
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1); }}>
        {SLIDES.map((s, i) => (
          <div key={i} className={["carousel-slide", i === current ? "active" : "",
            isAnimating && i === (current - (animDir === "left" ? 1 : -1) + SLIDES.length) % SLIDES.length
              ? animDir === "left" ? "exit-left" : "exit-right" : ""].join(" ").trim()}>
            <img src={s.src} alt={s.alt} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.setAttribute("style", "display:flex"); }} />
            <div className="img-ph" style={{ display: "none" }}><span className="ph-jp">荷物</span><span className="ph-lbl">{s.src.split("/").pop()}</span></div>
          </div>
        ))}
        <div className="carousel-counter">{current + 1} / {SLIDES.length}</div>
      </div>
      <button className="carousel-btn prev" onClick={() => move(-1)} aria-label="Previous">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><polyline points="11 4 6 9 11 14" /></svg>
      </button>
      <button className="carousel-btn next" onClick={() => move(1)} aria-label="Next">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><polyline points="7 4 12 9 7 14" /></svg>
      </button>
      <div className="carousel-thumbs" ref={thumbsRef}>
        {SLIDES.map((s, i) => (
          <div key={i} className={`carousel-thumb ${i === current ? "active thumb-active" : ""}`} onClick={() => goTo(i)}>
            <img src={s.src} alt={s.alt} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.setAttribute("style", "display:flex"); }} />
            <div className="thumb-ph" style={{ display: "none" }}>荷物</div>
          </div>
        ))}
      </div>
      <div className="carousel-dots">
        {SLIDES.map((_, i) => <div key={i} className={`carousel-dot ${i === current ? "active" : ""}`} onClick={() => goTo(i)} />)}
      </div>
    </div>
  );
}

// ─── FORM ─────────────────────────────────────────────────────────────────────
const FORMSPREE_ID = "https://formspree.io/f/mlgpvrvo";
type FormState = { name: string; email: string; contact: string; platform: string; itemLink: string; country: string; message: string; };
const emptyForm: FormState = { name: "", email: "", contact: "", platform: "", itemLink: "", country: "", message: "" };

function RequestForm({ t }: { t: T }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const r = t.request;

  function update<K extends keyof FormState>(k: K, v: string) {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  }
  function validate() {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = r.errName;
    if (!form.email.trim()) e.email = r.errEmail;
    else if (!form.email.includes("@")) e.email = r.errEmailInvalid;
    if (!form.contact.trim()) e.contact = r.errContact;
    if (!form.country.trim()) e.country = r.errCountry;
    if (!form.message.trim()) e.message = r.errMessage;
    setErrors(e); return Object.keys(e).length === 0;
  }
  async function handleSubmit() {
    if (!validate()) return;
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ID, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, contact: form.contact, platform: form.platform, item_link: form.itemLink, country: form.country, message: form.message }),
      });
      if (res.ok) { setStatus("success"); setForm(emptyForm); } else setStatus("error");
    } catch { setStatus("error"); }
  }

  if (status === "success") {
    return (
      <div className="req-form" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", gap: "1rem", textAlign: "center" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3a7d44" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600, color: "var(--ink)" }}>{r.successTitle}</p>
        <p style={{ fontSize: ".9rem", color: "var(--warm)", fontWeight: 300 }}>{r.successDesc}</p>
        <button className="btn btn-ghost" onClick={() => setStatus("idle")} style={{ marginTop: ".5rem" }}>{r.successBtn}</button>
      </div>
    );
  }
  return (
    <div className="req-form">
      <div className="f-row">
        <div className="f-field"><label>{r.fieldName}</label><input type="text" placeholder="Your name" value={form.name} onChange={e => update("name", e.target.value)} />{errors.name && <span className="f-err">{errors.name}</span>}</div>
        <div className="f-field"><label>{r.fieldEmail}</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => update("email", e.target.value)} />{errors.email && <span className="f-err">{errors.email}</span>}</div>
      </div>
      <div className="f-field">
        <label>{r.fieldContact} <span style={{ fontWeight: 300, textTransform: "none", letterSpacing: 0, color: "var(--warm)", fontSize: ".62rem" }}>{r.fieldContactHint}</span></label>
        <input type="text" placeholder={r.fieldContactPlaceholder} value={form.contact} onChange={e => update("contact", e.target.value)} />
        {errors.contact && <span className="f-err">{errors.contact}</span>}
      </div>
      <div className="f-field"><label>{r.fieldPlatform}</label><input type="text" placeholder={r.fieldPlatformPlaceholder} value={form.platform} onChange={e => update("platform", e.target.value)} /></div>
      <div className="f-field"><label>{r.fieldLink}</label><input type="text" placeholder="https://…" value={form.itemLink} onChange={e => update("itemLink", e.target.value)} /></div>
      <div className="f-field"><label>{r.fieldCountry}</label><input type="text" placeholder={r.fieldCountryPlaceholder} value={form.country} onChange={e => update("country", e.target.value)} />{errors.country && <span className="f-err">{errors.country}</span>}</div>
      <div className="f-field"><label>{r.fieldMessage}</label><textarea rows={6} placeholder={r.fieldMessagePlaceholder} value={form.message} onChange={e => update("message", e.target.value)} />{errors.message && <span className="f-err">{errors.message}</span>}</div>
      {status === "error" && <p style={{ fontSize: ".78rem", color: "var(--red)", marginBottom: ".5rem" }}>{r.errorMsg}</p>}
      <div className="f-actions">
        <span className="f-note">{r.footNote}</span>
        <button type="button" className="btn btn-red" onClick={handleSubmit} disabled={status === "sending"}>
          {status === "sending" ? r.sending : r.submit}
        </button>
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FaqSection({ t }: { t: T }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="faq-list">
      {t.faq.items.map((item, i) => (
        <div key={i} className={`faq-item ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? null : i)}>
          <div className="faq-q">
            <span>{item.q}</span>
            <svg className="faq-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          {open === i && <div className="faq-a"><p>{item.a}</p></div>}
        </div>
      ))}
    </div>
  );
}

// ─── BACK TO TOP ──────────────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const h = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  useEffect(() => {
    document.querySelector(".trustpilot-float")?.classList.toggle("visible", visible);
  }, [visible]);
  return (
    <button className={`back-to-top ${visible ? "visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
    </button>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [dark, toggleDark] = useDarkMode();
  const [langOpen, setLangOpen] = useState(false);
  useScrollReveal();

  useEffect(() => {
    setLang(detectLang());
  }, []);

  const t = translations[lang];

  const navLinks = [
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#about", label: t.nav.about },
    { href: "#what-we-buy", label: t.nav.whatWeBuy },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#photos", label: t.nav.gallery },
    { href: "#faq", label: t.nav.faq },
  ];

  const whatWeBuy = [
    { img: "/buy-mercari.png",   title: "Mercari Japan",             desc: t.lang === "fr" ? "La plus grande marketplace de seconde main au Japon." : "Japan's largest secondhand marketplace.", tags: ["メルカリ", "Secondhand", "Rare finds"] },
    { img: "/buy-yahoo.png",     title: "Yahoo Auctions Japan",      desc: t.lang === "fr" ? "Des millions d'annonces quotidiennes." : "Bid on millions of listings daily.", tags: ["ヤフオク", "Auctions", "Collectibles"] },
    { img: "/buy-sneakers.jpg",  title: "Limited & Exclusive Drops", desc: t.lang === "fr" ? "Nike Japan, Supreme, BAPE — on fait la queue pour vous." : "Nike Japan exclusives, Supreme, BAPE — we queue for you.", tags: ["Nike Japan", "Supreme", "BAPE"] },
    { img: "/buy-pokemon.jpg",   title: "Pokémon & Anime Goods",     desc: t.lang === "fr" ? "Cartes Pokémon japonaises, figurines One Piece, Dragon Ball." : "Japanese Pokémon cards, One Piece figures, Dragon Ball merch.", tags: ["Pokémon Cards", "One Piece", "Dragon Ball"] },
    { img: "/buy-nintendo.png",  title: "Games & Electronics",       desc: t.lang === "fr" ? "Jeux Nintendo exclusifs au Japon, consoles rétro, PlayStation." : "Nintendo Switch Japan-exclusive titles, retro consoles, PlayStation.", tags: ["Nintendo", "PlayStation", "Retro"] },
    { img: "/buy-akihabara.jpg", title: "Tokyo Store Visits",        desc: t.lang === "fr" ? "Akihabara, Shibuya, Harajuku — on visite les boutiques pour vous." : "Akihabara, Shibuya, Harajuku — we visit any store for you.", tags: ["Akihabara", "Shibuya", "Harajuku"] },
  ];

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <a href="#" className="logo">
            <LogoMark />
            <div className="logo-wordmark">
              <div className="logo-name"><span className="r">Kizuna</span> Proxy</div>
              <div className="logo-sub">Tokyo Proxy Service</div>
            </div>
          </a>
          <ul className="nav-links">
            {navLinks.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
            <li><a href="#request-wrap" className="nav-cta">{t.nav.request}</a></li>
          </ul>
          <div className="nav-controls">
            {/* Dark mode toggle */}
            <button className="icon-btn" onClick={toggleDark} aria-label="Toggle dark mode" title={dark ? "Light mode" : "Dark mode"}>
              {dark ? <IconSun /> : <IconMoon />}
            </button>
            {/* Language selector */}
            <div className="lang-selector" onMouseLeave={() => setLangOpen(false)}>
              <button className="icon-btn lang-btn" onClick={() => setLangOpen(v => !v)} aria-label="Change language">
                <span>{LANG_LABELS[lang]}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {langOpen && (
                <div className="lang-dropdown">
                  {(Object.keys(LANG_LABELS) as Lang[]).map(l => (
                    <button key={l} className={`lang-option ${l === lang ? "active" : ""}`} onClick={() => { setLang(l); setLangOpen(false); }}>
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)} aria-label="Menu">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="5" x2="17" y2="5" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="15" x2="17" y2="15" />
              </svg>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="mobile-menu">
            {navLinks.map(l => <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</a>)}
            <a href="#request-wrap" className="nav-cta" onClick={() => setMobileOpen(false)}>{t.nav.request}</a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <div className="hero">
        <div>
          <div className="eyebrow"><div className="eyebrow-line" /><span>{t.hero.eyebrow}</span></div>
          <h1>
            {t.hero.title1}<br />
            <em>{t.hero.title2}</em>
            <span className="jp-sub">{t.hero.jpSub}</span>
          </h1>
          <div className="hero-social-row">
            <span className="social-label">{t.hero.followUs}</span>
            <div className="social-links hero-social">
              <a className="social-link" href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram /></a>
              <a className="social-link" href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><IconTiktok /></a>
            </div>
          </div>
          <p className="hero-desc">{t.hero.desc}</p>
          <div className="hero-actions">
            <a href="#request-wrap" className="btn btn-red">{t.hero.cta}</a>
            <a href="#pricing" className="btn btn-ghost">{t.hero.ctaSecondary}</a>
          </div>
          <div className="hero-pills">
            <div className="hero-pill"><strong>{t.hero.pill1Title}</strong><span>{t.hero.pill1Sub}</span></div>
            <div className="hero-pill"><strong>{t.hero.pill2Title}</strong><span>{t.hero.pill2Sub}</span></div>
            <div className="hero-pill"><strong>{t.hero.pill3Title}</strong><span>{t.hero.pill3Sub}</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-img">
            <img src="/Slide1.png" alt="Kizuna Proxy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.setAttribute("style", "display:flex"); }} />
            <div className="img-ph" style={{ display: "none" }}><span className="ph-jp">東京</span><span className="ph-lbl">Slide1.png</span></div>
          </div>
        </div>
      </div>

      <div className="wrap"><hr className="hr" /></div>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section reveal">
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">{t.howItWorks.label}</p>
            <h2>{t.howItWorks.title}</h2>
            <p className="sec-desc">{t.howItWorks.desc}</p>
          </div>
          <div className="steps">
            {[
              { n: "01", title: t.howItWorks.step1Title, body: t.howItWorks.step1Body },
              { n: "02", title: t.howItWorks.step2Title, body: t.howItWorks.step2Body },
              { n: "03", title: t.howItWorks.step3Title, body: t.howItWorks.step3Body },
            ].map(s => (
              <div key={s.n} className="step"><div className="step-bar" /><div className="step-num">{s.n}</div><h3>{s.title}</h3><p>{s.body}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section reveal">
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">{t.about.label}</p>
            <h2>{t.about.title} <em>{t.about.titleEm}</em></h2>
          </div>
          <div className="about-grid">
            <div>
              <div className="about-body">
                <p>{t.about.p1}</p><p>{t.about.p2}</p><p>{t.about.p3}</p><p>{t.about.p4}</p><p>{t.about.p5}</p>
                <div className="about-pull"><p>&ldquo;{t.about.pull}&rdquo;</p></div>
              </div>
            </div>
            <div className="about-img">
              <img src="/Slide2.png" alt="About Kizuna Proxy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.setAttribute("style", "display:flex"); }} />
              <div className="img-ph" style={{ display: "none" }}><span className="ph-jp" style={{ fontSize: "2.5rem" }}>絆</span><span className="ph-lbl">Slide2.png</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE BUY */}
      <section id="what-we-buy" className="section reveal">
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">{t.whatWeBuy.label}</p>
            <h2>{t.whatWeBuy.title} <em>{t.whatWeBuy.titleEm}</em></h2>
            <p className="sec-desc">{t.whatWeBuy.desc}</p>
          </div>
          <div className="wbuy-grid">
            {whatWeBuy.map((item, i) => (
              <div key={i} className="wbuy-card">
                <div className="wbuy-img"><img src={item.img} alt={item.title} /></div>
                <div className="wbuy-body">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <div className="wbuy-tags">{item.tags.map(tag => <span key={tag} className="wbuy-tag">{tag}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section reveal">
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">{t.pricing.label}</p>
            <h2>{t.pricing.title} <em>{t.pricing.titleEm}</em></h2>
            <p className="sec-desc">{t.pricing.desc}</p>
          </div>
          <div className="pricing-grid">
            <div className="p-card online"><div className="p-accent" /><p className="p-tag">{t.pricing.onlineTag}</p><p className="p-price">¥1,500</p><p className="p-unit">{t.pricing.perItem}</p><p className="p-desc">{t.pricing.onlineDesc}</p></div>
            <div className="p-card store"><div className="p-accent" /><p className="p-tag">{t.pricing.storeTag}</p><p className="p-price">¥3,000</p><p className="p-unit">{t.pricing.perItem}</p><p className="p-desc">{t.pricing.storeDesc}</p></div>
          </div>
          <p className="p-note">{t.pricing.note}</p>
        </div>
      </section>

      {/* GALLERY */}
      <section id="photos" className="section reveal" style={{ background: "var(--cream)" }}>
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">{t.gallery.label}</p>
            <h2>{t.gallery.title} <em>{t.gallery.titleEm}</em></h2>
            <p className="sec-desc">{t.gallery.desc}</p>
          </div>
          <Carousel />
        </div>
      </section>

      {/* REQUEST */}
      <section id="request-wrap" className="reveal">
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">{t.request.label}</p>
            <h2>{t.request.title} <em>{t.request.titleEm}</em></h2>
            <p className="sec-desc">{t.request.desc}</p>
          </div>
          <div className="req-layout">
            <div className="req-side">
              <p>{t.request.sideDesc}</p>
              {[
                { title: t.request.detail1Title, sub: t.request.detail1Sub },
                { title: t.request.detail2Title, sub: t.request.detail2Sub },
                { title: t.request.detail3Title, sub: t.request.detail3Sub },
                { title: t.request.detail4Title, sub: t.request.detail4Sub },
              ].map(d => (
                <div key={d.title} className="req-detail">
                  <div className="rd-dot" />
                  <div className="rd-text"><strong>{d.title}</strong><span>{d.sub}</span></div>
                </div>
              ))}
            </div>
            <RequestForm t={t} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section reveal" style={{ background: "var(--cream)" }}>
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">{t.faq.label}</p>
            <h2>{t.faq.title} <em>{t.faq.titleEm}</em></h2>
            <p className="sec-desc">{t.faq.desc}</p>
          </div>
          <FaqSection t={t} />
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo"><span className="r">Kizuna</span> Proxy</div>
          <p>{t.footer.rights}</p>
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap" }}>
            <p>contact@kizunaproxy.com</p>
            <span style={{ width: "1px", height: "12px", background: "rgba(250,248,244,.15)" }} />
            <div className="social-links">
              <a className="social-link" href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram size={14} /></a>
              <a className="social-link" href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><IconTiktok size={14} /></a>
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />

      {/* FLOATING TRUSTPILOT */}
      <a href="https://fr.trustpilot.com/review/kizunaproxy.com" target="_blank" rel="noopener noreferrer" className="trustpilot-float" aria-label="See our reviews on Trustpilot">
        <div className="tp-stars"><StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>
        <span>{t.trustpilot}</span>
      </a>
    </>
  );
}
