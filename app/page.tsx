"use client";

import { useEffect, useRef, useState, useCallback } from "react";


// ─── CAROUSEL SLIDES ────────────────────────────────────────────────────────
// Pour ajouter des photos de colis, ajoutez une entrée ici :
// { src: "/gallery1.png", alt: "description" }
const SLIDES = [
  { src: "/gallery1.png", alt: "Order prepared for shipping" },
  { src: "/gallery2.png", alt: "Parcel ready to ship" },
  { src: "/gallery3.png", alt: "Items carefully packed" },
];

// ─── LOGO ────────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <img
      src="/logo.png"
      alt="Kizuna Proxy"
      style={{ height: "48px", width: "auto", objectFit: "contain", filter: "drop-shadow(0 1px 3px rgba(13,11,9,.15))" }}
    />
  );
}

// ─── SOCIAL ICONS ────────────────────────────────────────────────────────────
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

// ─── CAROUSEL ────────────────────────────────────────────────────────────────
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

  // auto-advance
  const startAuto = useCallback(() => {
    autoRef.current = setInterval(() => move(1), 5000);
  }, [move]);
  const stopAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
  }, []);

  useEffect(() => { startAuto(); return stopAuto; }, [startAuto, stopAuto]);

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move]);

  // scroll thumb strip without hijacking page scroll
  useEffect(() => {
    const strip = thumbsRef.current;
    const active = strip?.querySelector<HTMLElement>(".thumb-active");
    if (strip && active) {
      strip.scrollLeft = active.offsetLeft - strip.offsetWidth / 2 + active.offsetWidth / 2;
    }
  }, [current]);

  // touch swipe
  const touchStartX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
  };

  return (
    <div className="carousel" onMouseEnter={stopAuto} onMouseLeave={startAuto}>
      {/* Stage */}
      <div
        className="carousel-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={[
              "carousel-slide",
              i === current ? "active" : "",
              isAnimating && i === (current - (animDir === "left" ? 1 : -1) + SLIDES.length) % SLIDES.length
                ? animDir === "left" ? "exit-left" : "exit-right"
                : "",
            ].join(" ").trim()}
          >
            <img src={s.src} alt={s.alt} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.setAttribute("style", "display:flex"); }} />
            <div className="img-ph" style={{ display: "none" }}>
              <span className="ph-jp">荷物</span>
              <span className="ph-lbl">{s.src.split("/").pop()}</span>
            </div>
          </div>
        ))}
        <div className="carousel-counter">{current + 1} / {SLIDES.length}</div>
      </div>

      {/* Arrows */}
      <button className="carousel-btn prev" onClick={() => move(-1)} aria-label="Previous">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><polyline points="11 4 6 9 11 14" /></svg>
      </button>
      <button className="carousel-btn next" onClick={() => move(1)} aria-label="Next">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><polyline points="7 4 12 9 7 14" /></svg>
      </button>

      {/* Thumbnails */}
      <div className="carousel-thumbs" ref={thumbsRef}>
        {SLIDES.map((s, i) => (
          <div key={i} className={`carousel-thumb ${i === current ? "active thumb-active" : ""}`} onClick={() => goTo(i)}>
            <img src={s.src} alt={s.alt} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.setAttribute("style", "display:flex"); }} />
            <div className="thumb-ph" style={{ display: "none" }}>荷物</div>
          </div>
        ))}
      </div>

      {/* Dots (mobile) */}
      <div className="carousel-dots">
        {SLIDES.map((_, i) => (
          <div key={i} className={`carousel-dot ${i === current ? "active" : ""}`} onClick={() => goTo(i)} />
        ))}
      </div>
    </div>
  );
}

// ─── FORM ────────────────────────────────────────────────────────────────────
const FORMSPREE_ID = "https://formspree.io/f/mlgpvrvo";

type FormState = { name: string; email: string; platform: string; itemLink: string; country: string; message: string; };
const emptyForm: FormState = { name: "", email: "", platform: "", itemLink: "", country: "", message: "" };

function RequestForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  function update<K extends keyof FormState>(k: K, v: string) {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  }

  function validate() {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.email.trim()) e.email = "Please enter your email.";
    else if (!form.email.includes("@")) e.email = "Please enter a valid email address.";
    if (!form.country.trim()) e.country = "Please enter your country.";
    if (!form.message.trim()) e.message = "Please leave a detailed message.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ID, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          platform: form.platform,
          item_link: form.itemLink,
          country: form.country,
          message: form.message,
        }),
      });
      if (res.ok) {
        setStatus("success");
        setForm(emptyForm);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="req-form" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", gap: "1rem", textAlign: "center" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3a7d44" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
        </svg>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600, color: "var(--ink)" }}>Message sent!</p>
        <p style={{ fontSize: ".9rem", color: "var(--warm)", fontWeight: 300 }}>We will get back to you as soon as possible.</p>
        <button className="btn btn-ghost" onClick={() => setStatus("idle")} style={{ marginTop: ".5rem" }}>Send another request</button>
      </div>
    );
  }

  return (
    <div className="req-form">
      <div className="f-row">
        <div className="f-field">
          <label>Full name *</label>
          <input type="text" placeholder="Your name" value={form.name} onChange={e => update("name", e.target.value)} />
          {errors.name && <span className="f-err">{errors.name}</span>}
        </div>
        <div className="f-field">
          <label>Email address *</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={e => update("email", e.target.value)} />
          {errors.email && <span className="f-err">{errors.email}</span>}
        </div>
      </div>
      <div className="f-field">
        <label>Platform</label>
        <input type="text" placeholder="Mercari, Yahoo Auctions, store name…" value={form.platform} onChange={e => update("platform", e.target.value)} />
      </div>
      <div className="f-field">
        <label>Item link</label>
        <input type="text" placeholder="https://…" value={form.itemLink} onChange={e => update("itemLink", e.target.value)} />
      </div>
      <div className="f-field">
        <label>Country *</label>
        <input type="text" placeholder="France, Germany, USA…" value={form.country} onChange={e => update("country", e.target.value)} />
        {errors.country && <span className="f-err">{errors.country}</span>}
      </div>
      <div className="f-field">
        <label>Message *</label>
        <textarea rows={6} placeholder="Describe the item in detail — size, quantity, budget, condition, and any other important information…" value={form.message} onChange={e => update("message", e.target.value)} />
        {errors.message && <span className="f-err">{errors.message}</span>}
      </div>
      {status === "error" && (
        <p style={{ fontSize: ".78rem", color: "var(--red)", marginBottom: ".5rem" }}>Something went wrong. Please try again.</p>
      )}
      <div className="f-actions">
        <span className="f-note">Each request is reviewed personally.</span>
        <button type="button" className="btn btn-red" onClick={handleSubmit} disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send request"}
        </button>
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: "What is a proxy service?", a: "A proxy service means we purchase items on your behalf from Japan — whether online (Mercari, Yahoo Auctions, etc.) or directly in physical stores in Tokyo. We act as your trusted local representative." },
  { q: "How do I pay?", a: "Once we confirm your request and verify availability, you pay the item price plus our service fee upfront. We accept PayPal and bank transfer. Shipping is invoiced separately once all items are ready." },
  { q: "How long does it take?", a: "Online orders are typically purchased within 1–3 business days after payment. Physical store visits depend on availability and location. International shipping usually takes 5–14 days depending on the method chosen." },
  { q: "Can you visit any store in Tokyo?", a: "Yes — we can visit most stores in Tokyo and the surrounding area. Limited releases, pop-up stores, brand exclusives, and hard-to-find items are all within reach. Just send us the details." },
  { q: "What if the item is out of stock?", a: "We always verify availability before asking for any payment. If an item becomes unavailable after purchase, we will notify you immediately and offer a full refund." },
  { q: "How are shipping costs calculated?", a: "Shipping costs depend on the weight, dimensions, and your destination country. We always present the options transparently so you can choose the method that best suits your budget and urgency." },
  { q: "Do you offer discounts for multiple items?", a: "Yes — for larger orders we can discuss a reduced service fee. Just mention the full list of items in your request message and we will get back to you with a tailored quote." },
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="faq-list">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className={`faq-item ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? null : i)}>
          <div className="faq-q">
            <span>{item.q}</span>
            <svg className="faq-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
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
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <button
      className={`back-to-top ${visible ? "visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#about", label: "About" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "#photos", label: "Gallery" },
  ];

  return (
    <>
      {/* ── NAV ── */}
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
            <li><a href="#request-wrap" className="nav-cta">Request</a></li>
          </ul>
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="5" x2="17" y2="5" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="15" x2="17" y2="15" />
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="mobile-menu">
            {navLinks.map(l => <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</a>)}
            <a href="#request-wrap" className="nav-cta" onClick={() => setMobileOpen(false)}>Request</a>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div>
          <div className="eyebrow"><div className="eyebrow-line" /><span>Franco-Japanese proxy service</span></div>
          <h1>
            Your trusted<br />
            <em>link to Japan</em>
            <span className="jp-sub">絆 — 繋がりを大切に</span>
          </h1>
          <div className="hero-social-row">
            <span className="social-label">Follow us</span>
            <div className="social-links hero-social">
              <a className="social-link" href="https://www.instagram.com/kizuna_proxy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IconInstagram /></a>
              <a className="social-link" href="https://www.tiktok.com/@kizunaproxy" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><IconTiktok /></a>
            </div>
          </div>
          <p className="hero-desc">We help you buy items from Japan through Mercari, Yahoo Auctions, Tokyo stores, limited releases, and rare collectibles — with a personal, human, and reliable approach.</p>
          <div className="hero-actions">
            <a href="#request-wrap" className="btn btn-red">Request an Item</a>
            <a href="#pricing" className="btn btn-ghost">View Pricing</a>
          </div>
          <div className="hero-pills">
            <div className="hero-pill"><strong>Online</strong><span>All online platforms</span></div>
            <div className="hero-pill"><strong>Tokyo</strong><span>Physical store visits</span></div>
            <div className="hero-pill"><strong>Worldwide</strong><span>International shipping</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-img">
            <img src="/Slide1.png" alt="Tokyo" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.setAttribute("style", "display:flex"); }} />
            <div className="img-ph" style={{ display: "none" }}>
              <span className="ph-jp">東京</span>
              <span className="ph-lbl">slide1.jpg</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap"><hr className="hr" /></div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section">
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">How it works</p>
            <h2>A simple, <em>transparent</em> process</h2>
            <p className="sec-desc">A proxy service means we act on your behalf to purchase items from Japan — online or directly in store.</p>
          </div>
          <div className="steps">
            {[
              { n: "01", title: "Send your request", body: "Share the item link, photo, title, or any details about what you are looking for in Japan. The more precise, the better we can assist." },
              { n: "02", title: "Confirm & pay", body: "We review the request together, confirm every detail, then you pay the item price plus the agreed service fee before we proceed." },
              { n: "03", title: "Receive your item", body: "Once ready, we choose the shipping method together. All costs remain fully transparent and easy to verify at every stage." },
            ].map(s => (
              <div key={s.n} className="step">
                <div className="step-bar" />
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="section">
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">About us</p>
            <h2>A personal service<br />built on <em>trust</em></h2>
          </div>
          <div className="about-grid">
            <div>
              <div className="about-body">
                <p>Kizuna Proxy was born from a simple idea: making Japan more accessible to people around the world.</p>
                <p>We are a <strong>couple — French and Japanese</strong>, living between Paris and Tokyo. One of us is based in Tokyo and speaks Japanese fluently, while the other manages communication with clients abroad.</p>
                <p>We started after noticing how difficult it can be to purchase items from Japan: limited releases, store-exclusive products, Mercari listings, and goods that simply cannot be shipped overseas.</p>
                <p>Rather than building a large, impersonal operation, we chose to keep things human. <strong>Every request is handled individually</strong>, with care and close attention to detail.</p>
                <p>Whether it is a gift for a loved one, a birthday surprise, a rare collectible, or something personally meaningful from Japan — we treat each request with the seriousness it deserves.</p>
                <div className="about-pull">
                  <p>&ldquo;Kizuna&rdquo; means connection or bond in Japanese — and that is exactly what we want to create: a trusted link between you and Japan.</p>
                </div>
              </div>
            </div>
            <div className="about-img">
              <img src="/Slide2.png" alt="About Kizuna Proxy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).nextElementSibling?.setAttribute("style", "display:flex"); }} />
              <div className="img-ph" style={{ display: "none" }}>
                <span className="ph-jp" style={{ fontSize: "2.5rem" }}>絆</span>
                <span className="ph-lbl">slide2.jpg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="section">
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">Pricing</p>
            <h2>Clear &amp; <em>transparent</em> fees</h2>
            <p className="sec-desc">We keep our pricing simple. For multiple items, discounts are available depending on the order.</p>
          </div>
          <div className="pricing-grid">
            <div className="p-card online"><div className="p-accent" /><p className="p-tag">Online Orders</p><p className="p-price">¥1,500</p><p className="p-unit">per item</p><p className="p-desc">Mercari, Yahoo Auctions, Japanese websites, and any online platform — purchased from Tokyo on your behalf.</p></div>
            <div className="p-card store"><div className="p-accent" /><p className="p-tag">Physical Purchases</p><p className="p-price">¥3,000</p><p className="p-unit">per item</p><p className="p-desc">Store visits, in-person searches, limited releases, and physical purchases anywhere in Tokyo — we go there for you.</p></div>
          </div>
          <p className="p-note">For multiple items, discounts may apply depending on the order. Each request is studied carefully — please leave a detailed message when contacting us. Shipping costs are discussed separately once all items are ready and always remain fully transparent.</p>
        </div>
      </section>

      {/* ── TRUSTPILOT ── */}
      <div style={{ background: "var(--ink)", paddingBottom: "3rem", marginTop: "-1px" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "center" }}>
          <a
            href="https://fr.trustpilot.com/review/kizunaproxy.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "1rem", padding: "1rem 2rem", border: "1px solid rgba(250,248,244,.1)", borderRadius: "2px", textDecoration: "none", transition: "border-color .2s, background .2s", background: "rgba(250,248,244,.03)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(250,248,244,.25)"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(250,248,244,.07)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(250,248,244,.1)"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(250,248,244,.03)"; }}
          >
            {/* Trustpilot star icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#00b67a"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
            <div>
              <p style={{ fontSize: ".7rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(250,248,244,.4)", marginBottom: ".2rem" }}>Rated on</p>
              <p style={{ fontSize: ".95rem", fontWeight: 500, color: "rgba(250,248,244,.8)", fontFamily: "'Cormorant Garamond', serif", letterSpacing: ".02em" }}>Trustpilot</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(250,248,244,.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
          </a>
        </div>
      </div>

      {/* ── FAQ ── */}
      <section id="faq" className="section">
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">FAQ</p>
            <h2>Frequently asked <em>questions</em></h2>
            <p className="sec-desc">Everything you need to know before placing a request.</p>
          </div>
          <FaqSection />
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="photos" className="section" style={{ background: "var(--cream)" }}>
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">Gallery</p>
            <h2>Orders we&apos;ve <em>prepared</em></h2>
            <p className="sec-desc">A look at some of the parcels we have carefully packed and sent to our clients around the world.</p>
          </div>
          <Carousel />
        </div>
      </section>

      {/* ── REQUEST ── */}
      <section id="request-wrap">
        <div className="wrap">
          <div className="sec-header">
            <p className="sec-label">Request</p>
            <h2>Request an item <em>from Japan</em></h2>
            <p className="sec-desc">Leave as much detail as possible so we can study your request carefully and give you the best response.</p>
          </div>
          <div className="req-layout">
            <div className="req-side">
              <p>Every request is read and handled personally by us. We always reply with a clear answer before any payment is made.</p>
              {[
                { t: "Personal review", s: "Every request is handled by us directly" },
                { t: "Item verification", s: "We confirm availability before any commitment" },
                { t: "Direct communication", s: "You speak with us, not a support team" },
                { t: "Transparent shipping", s: "All costs are clear and easy to verify" },
              ].map(d => (
                <div key={d.t} className="req-detail">
                  <div className="rd-dot" />
                  <div className="rd-text"><strong>{d.t}</strong><span>{d.s}</span></div>
                </div>
              ))}
            </div>
            <RequestForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-logo"><span className="r">Kizuna</span> Proxy</div>
          <p>© 2026 — Your trusted link to Japan</p>
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
