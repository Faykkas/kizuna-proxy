// @ts-nocheck
"use client";

import { useState } from "react";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import Maneki from "../components/pixel/Maneki";
import { useLanguage } from "../lib/language";
import { supabase } from "../lib/supabase";

function WaitlistForm({ b }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setStatus("sending");

    const { error } = await supabase.from("box_waitlist").insert({ email: email.trim() });

    if (error) {
      console.error("Waitlist insert failed:", error);
      setStatus("error");
      return;
    }

    fetch("/api/notify-waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(err => console.error("notify-waitlist failed:", err));

    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="box-waitlist-success">
        <strong>{b.successTitle || "You're on the list!"}</strong>
        <span>{b.successDesc || "We'll email you the moment Kizuna Box is ready."}</span>
      </div>
    );
  }

  return (
    <form className="box-waitlist-form" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder={b.placeholder || "you@example.com"}
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button className="btn btn-gold" type="submit" disabled={status === "sending"}>
        {status === "sending" ? (b.sending || "JOINING…") : (b.submit || "NOTIFY ME")}
      </button>
      {status === "error" && (
        <p className="box-waitlist-error">{b.errorMsg || "Something went wrong. Try again, or email us at kizunaproxy@gmail.com."}</p>
      )}
    </form>
  );
}

export default function BoxClient() {
  const { t } = useLanguage();
  const b = t?.box || {};

  const FEATURES = [
    { icon: "🥤", title: b.feature1Title || "Real Japanese drinks", desc: b.feature1Desc || "Sodas, teas and snacks you won't find outside Japan — picked fresh, not imported months ago." },
    { icon: "🎁", title: b.feature2Title || "A gachapon surprise", desc: b.feature2Desc || "One or two random capsule toys in every box — the same thrill as the machines on a Tokyo street corner." },
    { icon: "📦", title: b.feature3Title || "Hand-picked in Tokyo", desc: b.feature3Desc || "We choose and pack every box ourselves — no dropshipping, no filler." },
  ];

  return (
    <>
      <SiteNav />
      <main className="blog-page">
        <div className="blog-wrap" style={{ maxWidth: "780px" }}>

          <div className="px-page-head-inline">
            <div className="px-head-mascot">
              <Maneki prop="parcel" size={86} float />
              <span className="px-head-bubble">{b.bubble || "Something new is brewing"}</span>
            </div>
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a><span>/</span><span>{b.breadcrumb || "Kizuna Box"}</span>
            </nav>
            <h1 className="px-page-title">{b.title || "Kizuna Box"} <em>{b.titleEm || "— coming soon"}</em></h1>
            <p className="px-page-lead">
              {b.lead || "A box of Japan, delivered to your door — real Japanese drinks and snacks, plus a random gachapon surprise every time. We're still shaping the details, but you can be the first to know when it launches."}
            </p>
          </div>

          <hr className="blog-hr" />

          <div className="ev-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="ev-card">
                <div className="ev-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="blog-cta box-waitlist-cta">
            <div>
              <p style={{ marginBottom: ".35rem" }}><strong>{b.ctaTitle || "Want to be first in line?"}</strong></p>
              <p style={{ fontSize: ".8rem", color: "var(--warm)", fontWeight: 300 }}>
                {b.ctaDesc || "Leave your email — no spam, just one message when Kizuna Box is ready to order."}
              </p>
            </div>
            <WaitlistForm b={b} />
          </div>

        </div>
      </main>
      <SiteFooter t={t} />
    </>
  );
}
