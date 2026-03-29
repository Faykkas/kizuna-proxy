// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { translations, detectLang, LANG_LABELS } from "./translations";
import type { Lang, T } from "./translations";

// ─── CAROUSEL SLIDES ─────────────────────────────────────────────────────────
const SLIDES = [
  { src: "/Ancora_order.jpg",      alt: "Ancora order", title: "Ancora Japan", sub: "Fountain pen ink · Shipped to Canada" },
  { src: "/yugioh_order.jpg",      alt: "Yu-Gi-Oh order", title: "Yu-Gi-Oh!", sub: "Rare cards · Shipped to USA" },
  { src: "/Jojo_order.jpg",        alt: "JoJo order", title: "JoJo's Bizarre Adventure", sub: "T-shirt · Shipped to USA" },
  { src: "/Harrypotter_order.jpg", alt: "Harry Potter order", title: "Lacoste × Harry Potter", sub: "T-shirts · Shipped to Greece" },
];

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <img src="/logo.png" alt="Kizuna Proxy"
      style={{ height: "46px", width: "auto", objectFit: "contain", mixBlendMode: "multiply" }} />
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
  const currentRef = useRef(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const goTo = useCallback((next: number) => {
    const n = (next + SLIDES.length) % SLIDES.length;
    currentRef.current = n;
    setCurrent(n);
  }, []);

  const move = useCallback((dir: number) => {
    goTo(currentRef.current + dir);
  }, [goTo]);

  useEffect(() => {
    autoRef.current = setInterval(() => move(1), 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [move]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [move]);

  useEffect(() => {
    const strip = thumbsRef.current;
    const active = strip?.querySelector<HTMLElement>(".thumb-active");
    if (strip && active) strip.scrollLeft = active.offsetLeft - strip.offsetWidth / 2 + active.offsetWidth / 2;
  }, [current]);

  const pauseAuto = () => { if (autoRef.current) clearInterval(autoRef.current); };
  const resumeAuto = () => { autoRef.current = setInterval(() => move(1), 5000); };

  return (
    <div className="carousel" onMouseEnter={pauseAuto} onMouseLeave={resumeAuto}>
      <div className="carousel-stage"
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1); }}>
        {SLIDES.map((s, i) => (
          <div key={i} className={`carousel-slide${i === current ? " active" : ""}`}>
            <img src={s.src} alt={s.alt} onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.setAttribute("style", "display:flex");
            }} />
            <div className="img-ph" style={{ display: "none" }}><span className="ph-jp">荷物</span></div>
            <div className="carousel-caption">
              <strong>{s.title}</strong>
              <span>{s.sub}</span>
            </div>
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
          <div key={i} className={`carousel-thumb${i === current ? " active thumb-active" : ""}`} onClick={() => goTo(i)}>
            <img src={s.src} alt={s.alt} onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.setAttribute("style", "display:flex");
            }} />
            <div className="thumb-ph" style={{ display: "none" }}>荷物</div>
          </div>
        ))}
      </div>
      <div className="carousel-dots">
        {SLIDES.map((_, i) => <div key={i} className={`carousel-dot${i === current ? " active" : ""}`} onClick={() => goTo(i)} />)}
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
    </button>
  );
}

// ─── REAL REVIEWS DATA ───────────────────────────────────────────────────────
const REAL_REVIEWS = [
  {
    name: "u/grimmia",
    country: "🇬🇷 Greece",
    stars: 5,
    link: "https://www.reddit.com/r/internationalshopper/comments/1s4x1fw/wonderful_experience_with_ufaycas_from_jp_to_gr/",
    title: "Wonderful experience — JP to GR",
    text: "She handled personal shopping for me in Tokyo and visited the Sonic Store, the Pokémon Center, and the Nintendo Store with absolute success! We even did live shopping through a video call, and it genuinely felt like I was there with her. They were extremely polite, professional, and offered very good prices. Communication was clear and immediate, which made me trust them completely. I highly recommend them without any hesitation.",
  },
  {
    name: "u/Calm-Leather-1018",
    country: "🇺🇸 USA",
    stars: 5,
    link: "https://www.reddit.com/r/internationalshopper/comments/1s4ktd9/service_review_faycas/",
    title: "Service review",
    text: "I've never used a proxy seller before but there were some Japanese exclusive collab items I wanted from a fashion brand and luckily I came in contact with them. The process was simple and I never felt as though I was overpaying compared to using one of the many popular proxy sites. If you want your Japanese merch, think u/Faycas as a reliable proxy seller ❤️",
  },
  {
    name: "u/Salty-Lemon8781",
    country: "🇨🇦 Canada",
    stars: 5,
    link: "https://www.reddit.com/r/internationalshopper/comments/1s2zphf/positive_review_for_ufaycas/",
    title: "Positive review",
    text: "Faycas and his girlfriend are the best if you need an item purchased/shipped from Japan. They are extremely helpful, polite, trustworthy, and just great people in general. They arranged the purchase of a vintage item for me, took great care to pack it, and they made the whole process very easy. I will use their services again ❤️",
  },
  {
    name: "u/No_Seaworthiness7119",
    country: "🇺🇸 USA",
    stars: 5,
    link: "https://www.reddit.com/r/internationalshopper/comments/1s693xk/review_for_faycas_japan_us/",
    title: "Flawless experience — JP to US",
    text: "Had a wonderful experience! The service was very fast and the shipment arrived quickly, with no issues and the items were so carefully packaged. Timeline: 3/15 ordered → 3/18 shipped → 3/24 delivered. This was a flawless experience and I cannot recommend the service highly enough. (If you've ever tried these cookies, they're amazing. Have u/Faycas ship you a box!)",
  },
  {
    name: "u/BamBim09",
    country: "🇮🇩 Indonesia",
    stars: 5,
    link: "https://www.reddit.com/r/internationalshopper/comments/1s5uh7d/trustworthy_japan_international_shopper_u_faycas/",
    title: "Trustworthy Japan shopper",
    text: "I was finding a book that came out in 2011 and they immediately found the one that still had its bonus included, which is very rare. Got only positive experience. Fast response, nice person... I am thinking of buying with them again next month.",
  },
];

// ─── REVIEWS CAROUSEL ────────────────────────────────────────────────────────
function ReviewsCarousel() {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const autoRef = useRef(null);
  const trackRef = useRef(null);

  const goTo = useCallback((n) => {
    const next = (n + REAL_REVIEWS.length) % REAL_REVIEWS.length;
    currentRef.current = next;
    setCurrent(next);
  }, []);

  const move = useCallback((dir) => { goTo(currentRef.current + dir); }, [goTo]);

  useEffect(() => {
    autoRef.current = setInterval(() => move(1), 5000);
    return () => clearInterval(autoRef.current);
  }, [move]);

  const pauseAuto = () => clearInterval(autoRef.current);
  const resumeAuto = () => { autoRef.current = setInterval(() => move(1), 5000); };

  return (
    <div className="rcarousel" onMouseEnter={pauseAuto} onMouseLeave={resumeAuto}>
      <div className="rcarousel-track" ref={trackRef}>
        {REAL_REVIEWS.map((r, i) => (
          <div key={i} className={`rcarousel-card${i === current ? " active" : ""}`}>
            <div className="rcard-top">
              <div className="rcard-stars">{"★".repeat(r.stars)}</div>
              <a href={r.link} target="_blank" rel="noopener noreferrer" className="rcard-source">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                <span>Reddit</span>
              </a>
            </div>
            <h3 className="rcard-title">{r.title}</h3>
            <p className="rcard-text">&ldquo;{r.text}&rdquo;</p>
            <div className="rcard-footer">
              <strong className="rcard-name">{r.name}</strong>
              <span className="rcard-country">{r.country}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="rcarousel-nav">
        <button className="rcarousel-btn" onClick={() => move(-1)} aria-label="Previous">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="rcarousel-dots">
          {REAL_REVIEWS.map((_, i) => (
            <button key={i} className={`rcarousel-dot${i === current ? " active" : ""}`} onClick={() => goTo(i)} aria-label={`Review ${i + 1}`} />
          ))}
        </div>
        <button className="rcarousel-btn" onClick={() => move(1)} aria-label="Next">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, toggleDark] = useDarkMode();
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState<string>("en");

  useScrollReveal();

  useEffect(() => {
    const saved = localStorage.getItem("kizuna-lang");
    if (saved) setLang(saved);
    else setLang(detectLang());
  }, []);

  const t = translations[lang];

  const navLinks = [
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#about", label: t.nav.about },
    { href: "#what-we-buy", label: t.nav.whatWeBuy },
    { href: "#reviews", label: "Reviews" },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#photos", label: t.nav.gallery },
    { href: "#faq", label: t.nav.faq },
  ];

  const wbuyImgs = ["/buy-mercari.png", "/buy-yahoo.png", "/buy-sneakers.jpg", "/buy-pokemon.jpg", "/buy-nintendo.png", "/buy-akihabara.jpg"];
  const wbuyTags = [["メルカリ","Secondhand","Rare finds"],["ヤフオク","Auctions","Collectibles"],["Nike Japan","Supreme","BAPE"],["Pokémon Cards","One Piece","Dragon Ball"],["Nintendo","PlayStation","Retro"],["Akihabara","Shibuya","Harajuku"]];

  return (
    <>
      {/* ANNOUNCEMENT BANNER */}
      <div className="announce-bar">
        <div className="announce-inner">
          <span className="announce-pill">Coming soon</span>
          <span className="announce-text">🍡 Japanese snack boxes — curated in Tokyo, delivered to your door.</span>
        </div>
      </div>

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
            {/* Dark mode toggle - single button */}
            <button className="icon-btn" onClick={toggleDark} aria-label="Toggle dark mode">
              {dark ? <IconSun /> : <IconMoon />}
            </button>
            {/* Language selector */}
            <div className="lang-selector">
              <button className="icon-btn lang-btn" onClick={() => setLangOpen(v => !v)} aria-label="Change language">
                <span>{LANG_LABELS[lang]}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {langOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setLangOpen(false)} />
                  <div className="lang-dropdown">
                    {Object.keys(LANG_LABELS).map(l => (
                      <button key={l} className={`lang-option ${l === lang ? "active" : ""}`} onClick={() => { setLang(l); localStorage.setItem("kizuna-lang", l); setLangOpen(false); }}>
                        {LANG_LABELS[l]}
                      </button>
                    ))}
                  </div>
                </>
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

      {/* TRUST BAR - top of page */}
      <div className="trust-bar">
        <div className="wrap">
          <div className="trust-inner">
            <div className="trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>100% secure payments</span>
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Reply within 24 hours</span>
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <span>PayPal buyer protection</span>
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span>Worldwide shipping</span>
            </div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="hero">
        <div>
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

      {/* REVIEWS */}
      <section id="reviews" className="section reveal">
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">{t.reviews.label}</p>
            <h2>{t.reviews.title} <em>{t.reviews.titleEm}</em></h2>
          </div>
          {/* Score summary */}
          <div className="reviews-score">
            <div className="reviews-score-num">5.0</div>
            <div className="reviews-score-right">
              <div className="reviews-score-stars">★★★★★</div>
              <p className="reviews-score-label">{t.reviews.basedOn}</p>
              <div className="reviews-bars">
                {[{n:5,w:"100%"},{n:4,w:"0%"},{n:3,w:"0%"},{n:2,w:"0%"},{n:1,w:"0%"}].map(b => (
                  <div key={b.n} className="reviews-bar-row">
                    <span>{b.n}★</span>
                    <div className="reviews-bar-track"><div className="reviews-bar-fill" style={{width: b.w}} /></div>
                    <span>{b.w}</span>
                  </div>
                ))}
              </div>
            </div>
            <a href="https://www.reddit.com/r/internationalshopper/" target="_blank" rel="noopener noreferrer" className="reviews-source-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
              <span>Verified on Reddit</span>
            </a>
          </div>
          {/* Reviews carousel */}
          <ReviewsCarousel />
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
                <div className="about-pull"><p>{t.about.pull}</p></div>
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
            {(t.whatWeBuy.items || []).map((item, i) => (
              <div key={i} className="wbuy-card">
                <div className="wbuy-img"><img src={wbuyImgs[i]} alt={item.title} /></div>
                <div className="wbuy-body">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <div className="wbuy-tags">{(wbuyTags[i] || []).map(tag => <span key={tag} className="wbuy-tag">{tag}</span>)}</div>
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
    </>
  );
}
