"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createBrowserSupabase } from "../../lib/supabase-browser";
import { BASE } from "../../lib/config";

type Mode = "loading" | "challenge" | "enroll";

// Deux cas : le compte a déjà un second facteur vérifié → on demande le code ;
// sinon → on l'enrôle (QR code à scanner), puis on vérifie un premier code.
export default function MfaForm({ email }: { email: string }) {
  const [mode, setMode] = useState<Mode>("loading");
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sb = createBrowserSupabase();
    (async () => {
      const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal2") {
        window.location.assign(BASE);
        return;
      }
      const { data: factors, error: listErr } = await sb.auth.mfa.listFactors();
      if (listErr) {
        setError("Impossible de lire les facteurs d'authentification.");
        return;
      }
      const verified = factors?.totp?.find((f) => f.status === "verified");
      if (verified) {
        setFactorId(verified.id);
        setMode("challenge");
        return;
      }
      // Facteurs commencés mais jamais validés : on les supprime avant d'en créer un neuf.
      for (const f of factors?.all ?? []) {
        if (f.factor_type === "totp" && f.status !== "verified") await sb.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data: enrolled, error: enrollErr } = await sb.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Kizuna admin ${new Date().toISOString().slice(0, 10)}`,
      });
      if (enrollErr || !enrolled) {
        setError("Impossible de démarrer l'enrôlement du second facteur.");
        return;
      }
      setFactorId(enrolled.id);
      setQr(enrolled.totp.qr_code);
      setSecret(enrolled.totp.secret);
      setMode("enroll");
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: err } = await createBrowserSupabase().auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
    if (err) {
      setError("Code incorrect ou expiré. Réessayez avec le code actuel de l'application.");
      setBusy(false);
      return;
    }
    window.location.assign(BASE);
  }

  async function signOut() {
    await createBrowserSupabase().auth.signOut();
    window.location.assign(`${BASE}/connexion`);
  }

  return (
    <div className="av2-auth">
      <form className="av2-card av2-auth-card" onSubmit={onSubmit}>
        <div>
          <h1>{mode === "enroll" ? "Activer la vérification en deux étapes" : "Vérification en deux étapes"}</h1>
          <p style={{ color: "var(--av2-muted)", marginTop: "0.3rem" }}>Connecté en tant que {email}.</p>
        </div>

        {mode === "loading" && !error ? <p style={{ color: "var(--av2-muted)" }}>Chargement…</p> : null}

        {mode === "enroll" ? (
          <>
            <p style={{ fontSize: "0.9rem" }}>
              1. Scannez ce QR code avec une application d'authentification (Google Authenticator, 1Password, Authy…).
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="av2-qr" src={qr} alt="QR code à scanner avec votre application d'authentification" />
            <details>
              <summary style={{ cursor: "pointer", fontSize: "0.85rem", color: "var(--av2-muted)" }}>Impossible de scanner ? Saisir la clé à la main</summary>
              <div className="av2-secret" style={{ marginTop: "0.5rem" }}>{secret}</div>
            </details>
            <p style={{ fontSize: "0.9rem" }}>2. Saisissez le code à 6 chiffres affiché pour confirmer.</p>
          </>
        ) : null}

        {mode !== "loading" ? (
          <>
            <div className="av2-field">
              <label htmlFor="code">Code à 6 chiffres</label>
              <input
                id="code"
                className="av2-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
            </div>
            {error ? <p className="av2-error" role="alert">{error}</p> : null}
            <button className="av2-btn" type="submit" disabled={busy || code.length !== 6}>
              {busy ? "Vérification…" : mode === "enroll" ? "Activer et continuer" : "Vérifier"}
            </button>
          </>
        ) : null}
        {mode === "loading" && error ? <p className="av2-error" role="alert">{error}</p> : null}

        <button type="button" className="av2-btn ghost" onClick={signOut}>Se déconnecter</button>
      </form>
    </div>
  );
}
