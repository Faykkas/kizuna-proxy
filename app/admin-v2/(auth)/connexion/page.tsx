"use client";

import { useState, type FormEvent } from "react";
import { createBrowserSupabase } from "../../lib/supabase-browser";
import { BASE } from "../../lib/config";
import { useL } from "../../components/LangProvider";
import LanguageSwitch from "../../components/LanguageSwitch";

export default function LoginPage() {
  const { t } = useL();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: err } = await createBrowserSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      // Message volontairement générique : on ne révèle pas si le compte existe.
      setError(t("Identifiants incorrects, ou connexion temporairement indisponible."));
      setBusy(false);
      return;
    }
    // Navigation complète : le serveur relit le cookie et décide (MFA, refus, accès).
    window.location.assign(BASE);
  }

  return (
    <div className="av2-auth">
      <form className="av2-card av2-auth-card" onSubmit={onSubmit} noValidate>
        <LanguageSwitch />
        <div>
          <h1>{t("Connexion")}</h1>
          <p style={{ color: "var(--av2-muted)", marginTop: "0.3rem" }}>{t("Administration Kizuna Proxy — accès réservé.")}</p>
        </div>
        <div className="av2-field">
          <label htmlFor="email">{t("Email")}</label>
          <input id="email" className="av2-input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="av2-field">
          <label htmlFor="password">{t("Mot de passe")}</label>
          <input id="password" className="av2-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error ? <p className="av2-error" role="alert">{error}</p> : null}
        <button className="av2-btn" type="submit" disabled={busy || !email || !password}>
          {busy ? t("Connexion…") : t("Se connecter")}
        </button>
        <p style={{ color: "var(--av2-muted)", fontSize: "0.82rem" }}>
          {t("Un second facteur (application d'authentification) vous sera demandé à l'étape suivante.")}
        </p>
      </form>
    </div>
  );
}
