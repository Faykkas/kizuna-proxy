"use client";

import { useRouter } from "next/navigation";
import { useL } from "./LangProvider";
import { LANG_COOKIE, type Lang } from "../lib/i18n";
import { BASE } from "../lib/config";

// Bascule français ↔ japonais. Mémorisé dans un cookie (un an) limité à /admin-v2, puis la page est relue côté serveur.
export default function LanguageSwitch({ className }: { className?: string }) {
  const { lang } = useL();
  const router = useRouter();

  function choose(next: Lang) {
    document.cookie = `${LANG_COOKIE}=${next}; path=${BASE}; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className={className ?? "av2-langswitch"} role="group" aria-label="Langue / 言語">
      <button type="button" className={lang === "fr" ? "is-on" : ""} aria-pressed={lang === "fr"} onClick={() => choose("fr")}>FR</button>
      <button type="button" className={lang === "ja" ? "is-on" : ""} aria-pressed={lang === "ja"} onClick={() => choose("ja")}>日本語</button>
    </div>
  );
}
