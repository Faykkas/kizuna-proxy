"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { useLanguage } from "../lib/language";
import { translations } from "../translations";

// Bouton « Demander un article » fixé en bas de l'écran, sur téléphone uniquement (voir .sticky-req dans globals.css).
// Il disparaît sur les pages où il n'a pas de sens (le formulaire lui-même, le compte, le paiement) et pendant que
// un formulaire de demande est à l'écran.
const HIDDEN_ON = ["/request", "/account", "/pay", "/admin", "/admin-v2"];

export default function StickyRequestBar() {
  const pathname = usePathname() || "/";
  const { lang } = useLanguage();
  const [formVisible, setFormVisible] = useState(false);
  const hidden = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (hidden) return;
    document.body.classList.add("has-sticky-req");
    return () => document.body.classList.remove("has-sticky-req");
  }, [hidden]);

  useEffect(() => {
    if (hidden || typeof IntersectionObserver === "undefined") return;
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) seen.add(e.target);
        else seen.delete(e.target);
      }
      setFormVisible(seen.size > 0);
    });
    // Le formulaire peut apparaître après le premier affichage : on observe aussi les ajouts.
    const watch = () => document.querySelectorAll("[data-mini-request]").forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); setFormVisible(false); };
  }, [hidden, pathname]);

  if (hidden) return null;
  const all = translations as Record<string, { nav: { request: string } }>;
  const label = all[lang]?.nav?.request || all.en.nav.request;
  return (
    <div className={`sticky-req${formVisible ? " is-hidden" : ""}`}>
      <Link href="/request" className="btn btn-gold" onClick={() => track("sticky_request_click")}>
        {label}
      </Link>
    </div>
  );
}
