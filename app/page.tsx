// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { translations, detectLang, LANG_LABELS } from "./translations";
import type { Lang, T } from "./translations";

const CalendarSection = dynamic(() => import("./calendar"), {
  ssr: false,
  loading: () => <div style={{padding:"3rem",textAlign:"center",color:"var(--warm)"}}>Loading…</div>
});

const NewsSection = dynamic(() => import("./news"), {
  ssr: false,
  loading: () => <div style={{padding:"2rem",textAlign:"center",color:"var(--warm)"}}>Loading…</div>
});

// ─── SLIDES ──────────────────────────────────────────────────────────────────
const SLIDES = [
  { src: "/Ancora_order.jpg",      alt: "Ancora order",        title: "Ancora Japan",               sub: "Fountain pen ink · Canada" },
  { src: "/yugioh_order.jpg",      alt: "Yu-Gi-Oh order",      title: "Yu-Gi-Oh!",                  sub: "Rare cards · USA" },
  { src: "/Jojo_order.jpg",        alt: "JoJo order",          title: "JoJo's Bizarre Adventure",   sub: "T-shirt · USA" },
  { src: "/Harrypotter_order.jpg", alt: "Harry Potter order",  title: "Lacoste × Harry Potter",     sub: "T-shirts · Greece" },
  { src: "/call_order.jpg",        alt: "Call of the Night",   title: "Call of the Night — Event",  sub: "Tokyo exclusive · USA" },
  { src: "/daruma_order.jpg",      alt: "Daruma order",        title: "Daruma × 3",                 sub: "Traditional Tokyo · Canada" },
  { src: "/bushiroad_order.jpg",   alt: "Bushiroad order",     title: "Bushiroad Apparel",          sub: "Official merch · Switzerland" },
  { src: "/order_magicharm.jpg",   alt: "Magic Charm order",   title: "Pullovers & Goodies",        sub: "Magic Charm · USA" },
  { src: "/butter_butler.jpg",     alt: "Butter Butler order", title: "Butter Butler Chocolates",   sub: "Japanese sweets · USA" },
  { src: "/kpop_card.jpg",         alt: "Ateez K-pop cards",   title: "Ateez — K-pop Cards",        sub: "Official cards · USA" },
];

// ─── REAL REVIEWS ────────────────────────────────────────────────────────────
const REAL_REVIEWS = [
  { name: "u/grimmia",             country: "🇬🇷 Greece",    stars: 5, link: "https://www.reddit.com/r/internationalshopper/comments/1s4x1fw/", title: "Wonderful experience — JP to GR", text: "She handled personal shopping for me in Tokyo and visited the Sonic Store, the Pokémon Center, and the Nintendo Store with absolute success! We even did live shopping through a video call, and it genuinely felt like I was there with her. Extremely polite, professional, very good prices. Communication was clear and immediate, which made me trust them completely." },
  { name: "u/Calm-Leather-1018",   country: "🇺🇸 USA",      stars: 5, link: "https://www.reddit.com/r/internationalshopper/comments/1s4ktd9/", title: "Service review", text: "I've never used a proxy seller before but there were some Japanese exclusive collab items I wanted from a fashion brand and luckily I came in contact with them. The process was simple and I never felt as though I was overpaying. If you want your Japanese merch, think u/Faycas as a reliable proxy seller ❤️" },
  { name: "u/Salty-Lemon8781",     country: "🇨🇦 Canada",   stars: 5, link: "https://www.reddit.com/r/internationalshopper/comments/1s2zphf/", title: "Positive review", text: "Faycas and his girlfriend are the best if you need an item purchased/shipped from Japan. They are extremely helpful, polite, trustworthy, and just great people in general. They arranged the purchase of a vintage item for me, took great care to pack it, and made the whole process very easy. I will use their services again ❤️" },
  { name: "u/No_Seaworthiness7119",country: "🇺🇸 USA",      stars: 5, link: "https://www.reddit.com/r/internationalshopper/comments/1s693xk/", title: "Flawless experience — JP to US", text: "Had a wonderful experience! The service was very fast and the shipment arrived quickly, with no issues and the items were so carefully packaged. Timeline: 3/15 ordered → 3/18 shipped → 3/24 delivered. This was a flawless experience and I cannot recommend the service highly enough." },
  { name: "u/BamBim09",            country: "🇮🇩 Indonesia", stars: 5, link: "https://www.reddit.com/r/internationalshopper/comments/1s5uh7d/", title: "Trustworthy Japan shopper", text: "I was finding a book that came out in 2011 and they immediately found the one that still had its bonus included, which is very rare. Got only positive experience. Fast response, nice person... I am thinking of buying with them again next month." },
  { name: "u/Snupkin",             country: "🇨🇦 Canada",   stars: 5, link: "https://www.reddit.com/r/internationalshopper/comments/1saw3vr/", title: "Supremely positive experience", text: "Made a request to purchase a local product in store from Japan and ship to Canada. Very helpful and made the process smooth and painless. Fast responses, flexible shipping, securely packaged fragile items, progress updates, friendly service — the whole experience was great and I felt they went above and beyond." },
  { name: "u/ItsBlueDew",          country: "🇺🇸 USA",      stars: 5, link: "https://www.reddit.com/r/internationalshopper/comments/1sc0rk4/", title: "Excellent experience — trading cards", text: "I had an overall excellent experience using their service. Any questions I had, they were able to answer. I purchased a box of trading cards and it was packaged very well. Photos were sent to me when they arrived at the store, and they even checked other stores. I would buy from them again. Highly recommend." },
];

// ─── ICONS ───────────────────────────────────────────────────────────────────
function IconInstagram({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
}
function IconTiktok({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>;
}
function IconSun() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function IconMoon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); }
    }), { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useDarkMode() {
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

// ─── FILMSTRIP CAROUSEL ───────────────────────────────────────────────────────
function Carousel() {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const autoRef = useRef(null);
  const touchStartX = useRef(0);

  const goTo = useCallback((n) => {
    const next = (n + SLIDES.length) % SLIDES.length;
    currentRef.current = next;
    setCurrent(next);
  }, []);
  const move = useCallback((dir) => goTo(currentRef.current + dir), [goTo]);

  useEffect(() => {
    autoRef.current = setInterval(() => move(1), 6000);
    return () => clearInterval(autoRef.current);
  }, [move]);

  const pause  = () => clearInterval(autoRef.current);
  const resume = () => { autoRef.current = setInterval(() => move(1), 6000); };
  const prev   = (current - 1 + SLIDES.length) % SLIDES.length;
  const next   = (current + 1) % SLIDES.length;

  return (
    <div className="filmstrip" onMouseEnter={pause} onMouseLeave={resume}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStartX.current; if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1); }}>
      <div className="filmstrip-stage">
        <div className="filmstrip-side" onClick={() => move(-1)}>
          <img src={SLIDES[prev].src} alt={SLIDES[prev].alt} onError={e => { (e.target as HTMLImageElement).style.opacity="0"; }} />
          <div className="filmstrip-prev-overlay" />
        </div>
        <div className="filmstrip-main">
          {SLIDES.map((s, i) => (
            <div key={i} className={`filmstrip-slide${i === current ? " active" : ""}`}>
              <img src={s.src} alt={s.alt} onError={e => { (e.target as HTMLImageElement).style.opacity="0"; }} />
              <div className="filmstrip-caption">
                <div className="filmstrip-caption-inner">
                  <strong>{s.title}</strong>
                  <span>{s.sub}</span>
                </div>
                <div className="filmstrip-counter">{current + 1} / {SLIDES.length}</div>
              </div>
            </div>
          ))}
          <button className="filmstrip-btn filmstrip-btn-prev" onClick={() => move(-1)} aria-label="Previous">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="filmstrip-btn filmstrip-btn-next" onClick={() => move(1)} aria-label="Next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div className="filmstrip-side" onClick={() => move(1)}>
          <img src={SLIDES[next].src} alt={SLIDES[next].alt} onError={e => { (e.target as HTMLImageElement).style.opacity="0"; }} />
          <div className="filmstrip-next-overlay" />
        </div>
      </div>
      <div className="filmstrip-dots">
        {SLIDES.map((_, i) => <button key={i} className={`filmstrip-dot${i === current ? " active" : ""}`} onClick={() => goTo(i)} aria-label={`Slide ${i+1}`} />)}
      </div>
    </div>
  );
}

// ─── REVIEWS CAROUSEL ────────────────────────────────────────────────────────
function ReviewsCarousel() {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const autoRef = useRef(null);

  const goTo = useCallback((n) => {
    const next = (n + REAL_REVIEWS.length) % REAL_REVIEWS.length;
    currentRef.current = next;
    setCurrent(next);
  }, []);
  const move = useCallback((dir) => goTo(currentRef.current + dir), [goTo]);

  useEffect(() => {
    autoRef.current = setInterval(() => move(1), 5000);
    return () => clearInterval(autoRef.current);
  }, [move]);

  const pause  = () => clearInterval(autoRef.current);
  const resume = () => { autoRef.current = setInterval(() => move(1), 5000); };
  const r = REAL_REVIEWS[current];

  return (
    <div className="rcarousel" onMouseEnter={pause} onMouseLeave={resume}>
      <div className="rcarousel-track">
        {REAL_REVIEWS.map((rev, i) => (
          <div key={i} className={`rcarousel-card${i === current ? " active" : ""}`}>
            <div className="rcard-top">
              <div className="rcard-stars">{"★".repeat(rev.stars)}</div>
              <a href={rev.link} target="_blank" rel="noopener noreferrer" className="rcard-source">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                <span>Reddit</span>
              </a>
            </div>
            <h3 className="rcard-title">{rev.title}</h3>
            <p className="rcard-text">&ldquo;{rev.text}&rdquo;</p>
            <div className="rcard-footer">
              <strong className="rcard-name">{rev.name}</strong>
              <span className="rcard-country">{rev.country}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="rcarousel-nav">
        <button className="rcarousel-btn" onClick={() => move(-1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="rcarousel-dots">
          {REAL_REVIEWS.map((_, i) => <button key={i} className={`rcarousel-dot${i === current ? " active" : ""}`} onClick={() => goTo(i)} />)}
        </div>
        <button className="rcarousel-btn" onClick={() => move(1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
}

// ─── ANIMATED PRICE ──────────────────────────────────────────────────────────
function AnimatedPrice({ target }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const duration = 1400;
      let start = 0;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.floor(ease * target));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

// ─── REQUEST FORM ────────────────────────────────────────────────────────────
const FORMSPREE_ID = "https://formspree.io/f/mlgpvrvo";
const emptyForm = { name: "", email: "", contact: "", platform: "", itemLink: "", country: "", message: "" };

function RequestForm({ t }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const r = t.request;

  function update(k, v) { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: "" })); }
  function validate() {
    const e = {};
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

  if (status === "success") return (
    <div className="req-form" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"320px", gap:"1rem", textAlign:"center" }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", color:"var(--ink)" }}>{r.successTitle}</p>
      <p style={{ fontSize:".9rem", color:"var(--warm)", fontWeight:300 }}>{r.successDesc}</p>
      <button className="btn btn-outline" onClick={() => setStatus("idle")}>{r.successBtn}</button>
    </div>
  );

  return (
    <div className="req-form">
      <div className="f-row">
        <div className="f-field"><label>{r.fieldName}</label><input type="text" value={form.name} onChange={e => update("name", e.target.value)} />{errors.name && <span className="f-err">{errors.name}</span>}</div>
        <div className="f-field"><label>{r.fieldEmail}</label><input type="email" value={form.email} onChange={e => update("email", e.target.value)} />{errors.email && <span className="f-err">{errors.email}</span>}</div>
      </div>
      <div className="f-field"><label>{r.fieldContact} <span style={{textTransform:"none",letterSpacing:0,fontSize:".62rem",color:"var(--warm)"}}>{r.fieldContactHint}</span></label><input type="text" placeholder={r.fieldContactPlaceholder} value={form.contact} onChange={e => update("contact", e.target.value)} />{errors.contact && <span className="f-err">{errors.contact}</span>}</div>
      <div className="f-row">
        <div className="f-field"><label>{r.fieldPlatform}</label><input type="text" placeholder={r.fieldPlatformPlaceholder} value={form.platform} onChange={e => update("platform", e.target.value)} /></div>
        <div className="f-field"><label>{r.fieldLink}</label><input type="text" placeholder="https://…" value={form.itemLink} onChange={e => update("itemLink", e.target.value)} /></div>
      </div>
      <div className="f-field"><label>{r.fieldCountry}</label><input type="text" placeholder={r.fieldCountryPlaceholder} value={form.country} onChange={e => update("country", e.target.value)} />{errors.country && <span className="f-err">{errors.country}</span>}</div>
      <div className="f-field"><label>{r.fieldMessage}</label><textarea rows={6} placeholder={r.fieldMessagePlaceholder} value={form.message} onChange={e => update("message", e.target.value)} />{errors.message && <span className="f-err">{errors.message}</span>}</div>
      {status === "error" && <p style={{fontSize:".78rem",color:"var(--red)",marginBottom:".5rem"}}>{r.errorMsg}</p>}
      <div className="f-actions">
        <span className="f-note">{r.footNote}</span>
        <button className="btn btn-gold" onClick={handleSubmit} disabled={status === "sending"}>{status === "sending" ? r.sending : r.submit}</button>
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FaqSection({ t }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="faq-list">
      {t.faq.items.map((item, i) => (
        <div key={i} className={`faq-item${open === i ? " open" : ""}`} onClick={() => setOpen(open === i ? null : i)}>
          <div className="faq-q">
            <span>{item.q}</span>
            <svg className="faq-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {open === i && <div className="faq-a"><p>{item.a}</p></div>}
        </div>
      ))}
    </div>
  );
}

// ─── BACK TO TOP ─────────────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const h = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <button className={`back-to-top${visible ? " visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
    </button>
  );
}

// ─── CUSTOM CHAT BUTTON ──────────────────────────────────────────────────────
function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleChat() {
    if (typeof window === "undefined" || !window.Tawk_API) return;
    if (isOpen) {
      window.Tawk_API.minimize();
      setIsOpen(false);
    } else {
      window.Tawk_API.maximize();
      setIsOpen(true);
    }
    // Always keep the default widget hidden
    setTimeout(() => {
      if (window.Tawk_API?.hideWidget) window.Tawk_API.hideWidget();
    }, 100);
  }

  // Keep hiding the default widget continuously
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.Tawk_API?.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      className={`chat-btn${isOpen ? " open" : ""}`}
      onClick={toggleChat}
      aria-label="Open support chat"
    >
      {isOpen ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="chat-btn-label">Support</span>
        </>
      )}
    </button>
  );
}

// ─── EVENTS FLOAT ────────────────────────────────────────────────────────────
function EventsFloat() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => { if (!dismissed) setVisible(true); }, 4000);
    const onScroll = () => { if (window.scrollY > 300 && !dismissed) setVisible(true); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, [dismissed]);
  if (dismissed) return null;
  return (
    <div className={`events-float${visible ? " visible" : ""}`}>
      <button className="events-float-close" onClick={() => { setVisible(false); setTimeout(() => setDismissed(true), 400); }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div className="events-float-icon">🎌</div>
      <div className="events-float-body">
        <strong>Tokyo Events</strong>
        <p>Pokémon Center, Nintendo, Supreme drops & more — we attend in person.</p>
        <a href="/events" className="events-float-btn">Learn more <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></a>
      </div>
    </div>
  );
}

// ─── HERO CANVAS ANIMATION ───────────────────────────────────────────────────
function useSakuraCanvas() {
  useEffect(() => {
    const cv = document.getElementById("hero-canvas") as HTMLCanvasElement;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;

    let W = 0, H = 0, raf: number, t = 0, spawnT = 0;

    function resize() {
      W = cv.offsetWidth; H = cv.offsetHeight;
      cv.width  = W * devicePixelRatio;
      cv.height = H * devicePixelRatio;
      cx.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    const G1='#c9a96e', G2='#b8976a', G4='#a07840';

    // ── KIZUNA LETTER PATHS ────────────────────────────────────────────────
    const LETTERS: Record<string, {x:number;y:number}[][]> = {
      K: [
        [{x:.1,y:.05},{x:.1,y:.5}],[{x:.1,y:.5},{x:.1,y:.95}],
        [{x:.1,y:.5},{x:.85,y:.05}],[{x:.1,y:.5},{x:.85,y:.95}],
      ],
      I: [
        [{x:.5,y:.05},{x:.5,y:.95}],
        [{x:.2,y:.05},{x:.8,y:.05}],[{x:.2,y:.95},{x:.8,y:.95}],
      ],
      Z: [
        [{x:.1,y:.05},{x:.9,y:.05}],
        [{x:.9,y:.05},{x:.1,y:.95}],
        [{x:.1,y:.95},{x:.9,y:.95}],
      ],
      U: [[{x:.1,y:.05},{x:.1,y:.7},{x:.15,y:.85},{x:.3,y:.93},{x:.5,y:.95},{x:.7,y:.93},{x:.85,y:.85},{x:.9,y:.7},{x:.9,y:.05}]],
      N: [
        [{x:.1,y:.95},{x:.1,y:.05}],
        [{x:.1,y:.05},{x:.9,y:.95}],
        [{x:.9,y:.95},{x:.9,y:.05}],
      ],
      A: [
        [{x:.5,y:.05},{x:.1,y:.95}],[{x:.5,y:.05},{x:.9,y:.95}],
        [{x:.25,y:.58},{x:.75,y:.58}],
      ],
    };

    const WORD = ['K','I','Z','U','N','A'];

    type Stroke = { pts:{x:number;y:number}[]; prog:number; op:number; hold:number; phase:string; w:number; };

    function buildWord(): Stroke[] {
      const lw = Math.min(W * .13, 85);
      const lh = lw * 1.4;
      const gap = lw * .3;
      const totalW = WORD.length * lw + (WORD.length - 1) * gap;
      let ox = (W - totalW) / 2;
      const sy = H * .04;  // very top
      const all: Stroke[] = [];
      WORD.forEach(letter => {
        (LETTERS[letter] || []).forEach(stroke => {
          all.push({
            pts: stroke.map(p => ({ x: ox + p.x * lw, y: sy + p.y * lh })),
            prog: 0, op: 0, hold: 0, phase: 'wait', w: 1.2 + Math.random() * .6,
          });
        });
        ox += lw + gap;
      });
      return all;
    }

    let wordStrokes: Stroke[] = [];
    let wordIdx = 0, wordTimer = 0;

    function initWord() {
      wordStrokes = buildWord();
      wordIdx = 0; wordTimer = 0;
    }

    // ── PETALS ────────────────────────────────────────────────────────────
    const petals = Array.from({ length: 35 }, () => ({
      x: Math.random() * 1400 - 100, y: Math.random() * 800,
      sz: 3.5 + Math.random() * 7.5,
      vy: .28 + Math.random() * .6, vx: (Math.random() - .5) * .35,
      a: Math.random() * Math.PI * 2, sp: (Math.random() - .5) * .02,
      sw: Math.random() * Math.PI * 2, ss: .007 + Math.random() * .013,
      op: .15 + Math.random() * .35,
    }));

    function drawPetal(x: number, y: number, sz: number, a: number, op: number) {
      cx.save(); cx.translate(x, y); cx.rotate(a);
      cx.globalAlpha = op;
      const g = cx.createRadialGradient(0, -sz*.25, 0, 0, 0, sz*1.1);
      g.addColorStop(0, '#f0dfc0'); g.addColorStop(.5, G1); g.addColorStop(1, G4);
      cx.fillStyle = g;
      cx.beginPath();
      cx.moveTo(0, -sz);
      cx.bezierCurveTo(sz*.72, -sz*.38, sz*.72, sz*.38, 0, sz*.28);
      cx.bezierCurveTo(-sz*.72, sz*.38, -sz*.72, -sz*.38, 0, -sz);
      cx.fill();
      cx.restore();
    }

    // ── AMBIENT STROKES ────────────────────────────────────────────────────
    const AMBIENT_PATHS = [
      [[.04,.2],[.18,.18],[.32,.19],[.46,.21]],
      [[.54,.38],[.64,.35],[.76,.36],[.88,.38]],
      [[.06,.75],[.18,.71],[.32,.68],[.44,.7]],
      [[.58,.82],[.7,.78],[.82,.79],[.92,.81]],
      [[.12,.52],[.2,.47],[.28,.45]],
    ];
    const ambient: Stroke[] = [];
    let ambientTimer = 0;

    function spawnAmbient() {
      const def = AMBIENT_PATHS[Math.floor(Math.random() * AMBIENT_PATHS.length)];
      const ox = (Math.random() - .5) * .1, oy = (Math.random() - .5) * .15;
      ambient.push({
        pts: def.map((p: number[]) => ({ x: (p[0]+ox)*W, y: (p[1]+oy)*H })),
        prog: 0, op: 0, hold: 0, phase: 'draw', w: .5 + Math.random() * .9,
      });
    }

    function drawStroke(s: Stroke) {
      if (!s.pts || s.pts.length < 2) return;
      cx.save();
      cx.globalAlpha = s.op;
      cx.strokeStyle = G2;
      cx.lineWidth = s.w;
      cx.lineCap = 'round'; cx.lineJoin = 'round';
      cx.beginPath();
      cx.moveTo(s.pts[0].x, s.pts[0].y);
      const drawn = Math.min(s.prog, s.pts.length - 1);
      for (let i = 0; i < drawn; i++) {
        const f = Math.min(drawn - i, 1);
        const p0 = s.pts[i], p1 = s.pts[i+1];
        cx.lineTo(p0.x + (p1.x-p0.x)*f, p0.y + (p1.y-p0.y)*f);
      }
      cx.stroke();
      cx.restore();
    }

    // ── MON CIRCLES ────────────────────────────────────────────────────────
    const mons = Array.from({ length: 4 }, () => ({
      x: .1 + Math.random() * .8, y: .1 + Math.random() * .8,
      r: 14 + Math.random() * 22,
      op: .05 + Math.random() * .07,
      ph: Math.random() * Math.PI * 2,
    }));

    function draw() {
      cx.clearRect(0, 0, W, H);
      t += .012; spawnT += .012; ambientTimer += .012;

      // Radial warm glow
      const rg = cx.createRadialGradient(W*.5, H*.4, 0, W*.5, H*.4, W*.7);
      rg.addColorStop(0, 'rgba(232,213,176,0.07)');
      rg.addColorStop(1, 'rgba(184,151,106,0.0)');
      cx.fillStyle = rg; cx.fillRect(0, 0, W, H);

      // Mon circles
      mons.forEach(m => {
        const fy = Math.sin(t*.4 + m.ph) * 3;
        cx.save();
        cx.globalAlpha = m.op + Math.sin(t*.3 + m.ph) * .02;
        cx.strokeStyle = G1; cx.lineWidth = .7;
        cx.beginPath(); cx.arc(m.x*W, m.y*H+fy, m.r, 0, Math.PI*2); cx.stroke();
        cx.globalAlpha *= .5;
        cx.beginPath(); cx.arc(m.x*W, m.y*H+fy, m.r*.55, 0, Math.PI*2); cx.stroke();
        cx.restore();
      });

      // Ambient strokes
      if (ambientTimer > 4 + Math.random() * 3) {
        ambientTimer = 0;
        if (ambient.length < 4) spawnAmbient();
      }
      for (let i = ambient.length - 1; i >= 0; i--) {
        const s = ambient[i];
        if (s.phase === 'draw') { s.prog += .03; s.op = Math.min(s.op+.01, .1); if (s.prog >= s.pts.length-1) { s.prog = s.pts.length-1; s.phase = 'hold'; } }
        else if (s.phase === 'hold') { s.hold += .012; if (s.hold > 3.5) s.phase = 'fade'; }
        else { s.op -= .003; if (s.op <= 0) { ambient.splice(i, 1); continue; } }
        drawStroke(s);
      }

      // KIZUNA word
      wordTimer += .012;
      if (wordTimer > .32 && wordIdx < wordStrokes.length) {
        wordStrokes[wordIdx].phase = 'draw';
        wordIdx++;
        wordTimer = 0;
      }
      wordStrokes.forEach(s => {
        if (s.phase === 'draw') {
          s.prog += .06;
          s.op = Math.min(s.op + .025, .55);
          if (s.prog >= s.pts.length - 1) { s.prog = s.pts.length - 1; s.phase = 'hold'; }
        }
        if (s.phase !== 'wait') drawStroke(s);
      });

      // Petals
      petals.forEach(p => {
        p.sw += p.ss; p.y += p.vy; p.x += p.vx + Math.sin(p.sw) * .55; p.a += p.sp;
        drawPetal(p.x, p.y, p.sz, p.a, p.op);
        if (p.y > H+20) { p.y = -15; p.x = Math.random() * W; }
        if (p.x > W+20) p.x = -20;
        if (p.x < -20) p.x = W+20;
      });

      raf = requestAnimationFrame(draw);
    }

    setTimeout(() => { initWord(); spawnAmbient(); spawnAmbient(); }, 600);
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("en");

  useScrollReveal();
  useSakuraCanvas();

  useEffect(() => {
    const saved = localStorage.getItem("kizuna-lang");
    if (saved) setLang(saved);
    else setLang(detectLang());
  }, []);

  const t = translations[lang];

  const navLinks = [
    { href: "#calendar", label: t.calendar?.label || "Availability" },
    { href: "#pricing",  label: t.nav.pricing },
    { href: "/events",   label: "Events 🎌" },
  ];

  const wbuyImgs = ["/buy-mercari.png","/buy-yahoo.png","/buy-sneakers.jpg","/buy-pokemon.jpg","/buy-nintendo.png","/buy-akihabara.jpg"];

  return (
    <>
      {/* ANNOUNCE */}
      <div className="announce-bar">
        <div className="announce-inner">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{color:"var(--gold)",flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span className="announce-pill">{t.announce?.pill || "Notice"}</span>
          <span className="announce-text">{t.announce?.text || "Orders will be paused from"} <strong>{t.announce?.from || "April 20"}</strong> → <strong>{t.announce?.to || "June 1 included"}</strong> {t.announce?.text2 || "— no new requests will be accepted during this period."}</span>
        </div>
      </div>

      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <a href="#" className="logo">
            <img src="/logo.png" alt="Kizuna Proxy" style={{height:"42px",width:"auto",objectFit:"contain"}} />
            <div>
              <div className="logo-name"><span className="g">Kizuna</span> Proxy</div>
              <div className="logo-sub">Tokyo Proxy Service</div>
            </div>
          </a>
          <ul className="nav-links">
            {navLinks.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
          </ul>
          <div className="nav-controls">
            <a href="#request-wrap" className="nav-cta">{t.nav.request}</a>
            <div className="lang-selector">
              <button className="icon-btn lang-btn" onClick={() => setLangOpen(v => !v)}>
                <span style={{fontSize:".65rem",letterSpacing:".1em"}}>{LANG_LABELS[lang]}</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {langOpen && (
                <>
                  <div style={{position:"fixed",inset:0,zIndex:199}} onClick={() => setLangOpen(false)} />
                  <div className="lang-dropdown">
                    {Object.keys(LANG_LABELS).map(l => (
                      <button key={l} className={`lang-option${l === lang ? " active" : ""}`} onClick={() => { setLang(l); localStorage.setItem("kizuna-lang", l); setLangOpen(false); }}>{LANG_LABELS[l]}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)}>
              <span/><span/><span/>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="mobile-menu">
            {navLinks.map(l => <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</a>)}
            <a href="#request-wrap" className="nav-cta" style={{textAlign:"center"}} onClick={() => setMobileOpen(false)}>{t.nav.request}</a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="hero-center">
        <canvas id="hero-canvas" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}} />
        <div className="hero-center-inner">
          <div className="hero-kana">絆</div>
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" />
            <span>{t.hero.eyebrow}</span>
            <div className="hero-eyebrow-line" />
          </div>
          <h1>{t.hero.title1} <em>{t.hero.title2}</em></h1>
          <p className="hero-desc">{t.hero.desc}</p>
          <div className="hero-btns hero-btns-center">
            <a href="#request-wrap" className="btn btn-gold">{t.hero.cta}</a>
            <a href="#pricing" className="btn btn-outline">{t.hero.ctaSecondary}</a>
          </div>
          <div className="hero-stats hero-stats-center">
            <div className="hero-stat">
              <strong>7</strong>
              <span>Reviews</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <strong>5.0 ★</strong>
              <span>Rating</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <strong>20+</strong>
              <span>Countries</span>
            </div>
          </div>
          <div className="hero-social-row hero-social-center">
            <span className="social-label">{t.hero.followUs}</span>
            <a className="hero-social-link" href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer"><IconInstagram /></a>
            <a className="hero-social-link" href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer"><IconTiktok /></a>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-inner">
          <div className="trust-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>100% secure payments</span>
          </div>
          <div className="trust-sep" />
          <div className="trust-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Reply within 24h</span>
          </div>
          <div className="trust-sep" />
          <div className="trust-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span>PayPal buyer protection</span>
          </div>
          <div className="trust-sep" />
          <div className="trust-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>Worldwide shipping</span>
          </div>
        </div>
      </div>

      {/* NEWS */}
      <section id="news" className="section-sm reveal">
        <div className="wrap">
          <div className="sec-head" style={{marginBottom:"2rem"}}>
            <p className="sec-label">{t.news?.label || "Latest news"}</p>
            <h2>{t.news?.title || "Updates &"} <em>{t.news?.titleEm || "announcements"}</em></h2>
          </div>
          <NewsSection />
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.whatWeBuy?.label}</p>
            <h2>{t.whatWeBuy?.title} <em>{t.whatWeBuy?.titleEm}</em></h2>
            <p className="desc">{t.whatWeBuy?.desc}</p>
          </div>
          <div className="services-grid">
            {(t.whatWeBuy?.items || []).map((item, i) => (
              <div key={i} className="svc-card">
                <div className="svc-num">0{i+1}</div>
                <div className="svc-icon">{["🛒","🏷️","👟","🎴","🎮","🏪"][i]}</div>
                <div className="svc-title">{item.title}</div>
                <div className="svc-desc">{item.desc}</div>
                <div className="svc-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALENDAR */}
      <section id="calendar" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.calendar?.label}</p>
            <h2>{t.calendar?.title} <em>{t.calendar?.titleEm}</em></h2>
            <p className="desc">{t.calendar?.desc}</p>
          </div>
          <div className="cal-tz-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{t.calendar?.tzNote} <strong>Japan Standard Time (JST, UTC+9)</strong></span>
          </div>
          <CalendarSection
            upcomingLabel={t.calendar?.upcoming}
            noEventsLabel={t.calendar?.noEvents}
            noUpcomingLabel={t.calendar?.noUpcoming}
            lang={lang}
          />
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.reviews?.label}</p>
            <h2>{t.reviews?.title} <em>{t.reviews?.titleEm}</em></h2>
          </div>

          {/* Score header */}
          <div className="reviews-header">
            <div className="reviews-score-block">
              <div className="reviews-big-num">5.0</div>
              <div>
                <div className="reviews-big-stars">★★★★★</div>
                <div className="reviews-big-label">{t.reviews?.basedOn}</div>
                <div className="reviews-count">7 verified reviews</div>
              </div>
            </div>
            <a href="https://www.reddit.com/r/internationalshopper/" target="_blank" rel="noopener noreferrer" className="reviews-reddit-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{color:"#ff4500"}}><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
              <span>All reviews verified on Reddit</span>
            </a>
          </div>

          {/* Cards grid */}
          <div className="reviews-cards-grid">
            {REAL_REVIEWS.map((r, i) => (
              <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="review-card-new">
                <div className="rcn-top">
                  <div className="rcn-stars">{"★".repeat(r.stars)}</div>
                  <div className="rcn-country">{r.country}</div>
                </div>
                <h3 className="rcn-title">{r.title}</h3>
                <p className="rcn-text">&ldquo;{r.text}&rdquo;</p>
                <div className="rcn-footer">
                  <div className="rcn-avatar">{r.name.replace("u/","").charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="rcn-name">{r.name}</div>
                    <div className="rcn-source">via Reddit</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{marginLeft:"auto",color:"var(--gold)",opacity:.5}}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.pricing?.label}</p>
            <h2>{t.pricing?.title} <em>{t.pricing?.titleEm}</em></h2>
            <p className="desc">{t.pricing?.desc}</p>
          </div>
          <div className="pricing-grid">
            <div className="p-card">
              <div className="p-accent" />
              <p className="p-tag">{t.pricing?.onlineTag}</p>
              <p className="p-price">¥<AnimatedPrice target={1500} /></p>
              <p className="p-unit">{t.pricing?.perItem}</p>
              <p className="p-desc">{t.pricing?.onlineDesc}</p>
            </div>
            <div className="p-card">
              <div className="p-accent" />
              <p className="p-tag">{t.pricing?.storeTag}</p>
              <p className="p-price">¥<AnimatedPrice target={3000} /></p>
              <p className="p-unit">{t.pricing?.perItem}</p>
              <p className="p-desc">{t.pricing?.storeDesc}</p>
            </div>
          </div>
          <div className="p-event-card">
            <div style={{flexShrink:0}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            </div>
            <div className="p-event-body">
              <strong>Tokyo Events & Exclusive Releases</strong>
              <p>Pokémon Center, Nintendo Store, Supreme drops, pop-ups — we attend in person for you. <span className="p-event-dm">Pricing varies by event — contact us privately.</span></p>
            </div>
            <a href="/events" className="p-event-btn">See Events →</a>
          </div>
          <p className="p-note">{t.pricing?.note}</p>

          {/* SHIPPING */}
          <div className="shipping-section">
            <div className="shipping-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>{t.shipping?.label || "Shipping partners"}</span>
            </div>
            <div className="shipping-grid">
              <div className="shipping-card">
                <div className="shipping-carrier">
                  <div className="carrier-badge ems">EMS</div>
                  <div className="carrier-name">{t.shipping?.ems || "Japan Post EMS"}</div>
                </div>
                <p className="shipping-desc">
                  {t.shipping?.emsDesc || "Express Mail Service — fast, tracked, affordable. Available worldwide."}
                  {" "}<strong>{t.shipping?.emsWarning || "For USA shipments: maximum declared value of $100 as gift. Above this threshold, we recommend FedEx or DHL."}</strong>
                </p>
              </div>
              <div className="shipping-card">
                <div className="shipping-carrier">
                  <div className="carrier-badge yamato">ヤマト</div>
                  <div className="carrier-name">{t.shipping?.yamato || "Yamato Transport (TA-Q-BIN)"}</div>
                </div>
                <p className="shipping-desc">{t.shipping?.yamatoDesc || "Economical option for USA shipments above $100. Slower than FedEx/DHL but significantly cheaper for heavy or bulky packages."}</p>
              </div>
              <div className="shipping-card">
                <div className="shipping-carrier">
                  <div className="carrier-badge fedex">FedEx</div>
                  <div className="carrier-name">{t.shipping?.fedex || "FedEx International"}</div>
                </div>
                <p className="shipping-desc">{t.shipping?.fedexDesc || "Recommended for high-value orders to USA and Canada. Full tracking, faster customs clearance, no declared value restriction."}</p>
              </div>
              <div className="shipping-card">
                <div className="shipping-carrier">
                  <div className="carrier-badge dhl">DHL</div>
                  <div className="carrier-name">{t.shipping?.dhl || "DHL Express"}</div>
                </div>
                <p className="shipping-desc">{t.shipping?.dhlDesc || "Premium express worldwide delivery. Excellent coverage across Europe. Fast customs processing, door-to-door tracking."}</p>
              </div>
            </div>
            <p className="shipping-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {t.shipping?.note || "Shipping method and costs are always discussed together before any payment. We choose the best option based on value, destination, and delivery time."}
            </p>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="photos" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.gallery?.label}</p>
            <h2>{t.gallery?.title} <em>{t.gallery?.titleEm}</em></h2>
            <p className="desc">{t.gallery?.desc}</p>
          </div>
          <Carousel />
        </div>
      </section>

      {/* REQUEST */}
      <section id="request-wrap" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.request?.label}</p>
            <h2>{t.request?.title} <em>{t.request?.titleEm}</em></h2>
            <p className="desc">{t.request?.desc}</p>
          </div>
          <div className="req-layout">
            <div className="req-side">
              <p>{t.request?.sideDesc}</p>
              {[
                { title: t.request?.detail1Title, sub: t.request?.detail1Sub },
                { title: t.request?.detail2Title, sub: t.request?.detail2Sub },
                { title: t.request?.detail3Title, sub: t.request?.detail3Sub },
                { title: t.request?.detail4Title, sub: t.request?.detail4Sub },
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
      <section id="faq" className="section reveal">
        <div className="wrap">
          <div className="sec-head">
            <p className="sec-label">{t.faq?.label}</p>
            <h2>{t.faq?.title} <em>{t.faq?.titleEm}</em></h2>
          </div>
          <FaqSection t={t} />
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-logo-wrap">
              <img src="/logo.png" alt="Kizuna Proxy" style={{height:"32px",width:"auto",objectFit:"contain"}} />
              <div className="footer-logo"><span className="g">Kizuna</span> Proxy</div>
            </div>
            <p className="footer-tagline">Tokyo-based proxy service.<br />Your trusted link to Japan.</p>
            <div className="footer-social">
              <a className="footer-social-link" href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer"><IconInstagram size={13} /></a>
              <a className="footer-social-link" href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer"><IconTiktok size={13} /></a>
            </div>
          </div>
          <div>
            <p className="footer-col-title">Navigate</p>
            <a href="#services" className="footer-link">{t.whatWeBuy?.label}</a>
            <a href="#calendar" className="footer-link">{t.calendar?.label}</a>
            <a href="#reviews" className="footer-link">Reviews</a>
            <a href="#pricing" className="footer-link">{t.nav.pricing}</a>
            <a href="#photos" className="footer-link">{t.nav.gallery}</a>
          </div>
          <div>
            <p className="footer-col-title">Info</p>
            <a href="/events" className="footer-link">Tokyo Events 🎌</a>
            <a href="#faq" className="footer-link">{t.nav.faq}</a>
            <a href="/blog/how-to-buy-from-mercari-japan" className="footer-link">Mercari Japan Guide</a>
            <a href="/blog/best-pokemon-cards-japan-2026" className="footer-link">Pokémon Cards Japan</a>
            <a href="/blog/yahoo-auctions-japan-guide" className="footer-link">Yahoo Auctions Guide</a>
          </div>
          <div>
            <p className="footer-col-title">Contact</p>
            <a href="#request-wrap" className="footer-link">{t.nav.request}</a>
            <a href="mailto:contact@kizunaproxy.com" className="footer-link">contact@kizunaproxy.com</a>
            <a href="https://wa.me/33788432501" target="_blank" rel="noopener noreferrer" className="footer-link">WhatsApp</a>
            <a href="https://discord.com/users/Faykas" target="_blank" rel="noopener noreferrer" className="footer-link">Discord</a>
            <a href="https://fr.trustpilot.com/review/kizunaproxy.com" target="_blank" rel="noopener noreferrer" className="footer-link">Trustpilot</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t.footer?.rights}</p>
          <p>kizunaproxy.com</p>
        </div>
      </footer>

      <EventsFloat />
      <ChatButton />
      <BackToTop />
    </>
  );
}
