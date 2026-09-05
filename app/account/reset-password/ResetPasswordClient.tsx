// @ts-nocheck
"use client";
// app/account/reset-password/ResetPasswordClient.tsx
//
// Landing page for the link Supabase emails from resetPasswordForEmail().
// Supabase's client detects the recovery token in the URL on load and
// turns it into a real (if short-lived) session — so by the time this
// renders, updateUser({ password }) is all that's needed to set the new
// password, no token handling of our own required.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import Maneki from "../../components/pixel/Maneki";
import { useLanguage } from "../../lib/language";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordClient() {
  const router = useRouter();
  const { t } = useLanguage();
  const l = t.resetPasswordPage || {};
  const { updatePassword } = useAuth();

  const [checking, setChecking] = useState(true);
  const [validLink, setValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidLink(!!session);
      setChecking(false);
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(l.errPasswordLength || "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError(l.errPasswordMismatch || "Passwords don't match.");
      return;
    }

    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (checking) {
    return (
      <>
        <SiteNav />
        <main className="acc-auth-wrap">
          <div className="acc-auth-card">
            <p className="acc-auth-hint">…</p>
          </div>
        </main>
        <SiteFooter t={t} />
      </>
    );
  }

  if (!validLink) {
    return (
      <>
        <SiteNav />
        <main className="acc-auth-wrap">
          <div className="acc-auth-card">
            <div className="acc-auth-mascot">
              <Maneki prop="mail" size={86} float />
            </div>
            <h1 className="acc-auth-title">{l.invalidTitle || "LINK EXPIRED"}</h1>
            <p className="acc-auth-lead">
              {l.errInvalidLink || "This reset link is invalid or has expired. Request a new one from the sign-in page."}
            </p>
            <button className="btn btn-gold acc-auth-submit" onClick={() => router.push("/account/login")}>
              {l.goToLogin || "Go to sign in"}
            </button>
          </div>
        </main>
        <SiteFooter t={t} />
      </>
    );
  }

  if (done) {
    return (
      <>
        <SiteNav />
        <main className="acc-auth-wrap">
          <div className="acc-auth-card">
            <div className="acc-auth-mascot">
              <Maneki state="success" size={90} float />
            </div>
            <h1 className="acc-auth-title">{l.successTitle || "PASSWORD UPDATED"}</h1>
            <p className="acc-auth-lead">
              {l.successLead || "You can now sign in with your new password."}
            </p>
            <button className="btn btn-gold acc-auth-submit" onClick={() => router.push("/account")}>
              {l.goToLogin || "Go to sign in"}
            </button>
          </div>
        </main>
        <SiteFooter t={t} />
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <main className="acc-auth-wrap">
        <div className="acc-auth-card">
          <div className="acc-auth-mascot">
            <Maneki prop="mail" size={86} float />
          </div>

          <h1 className="acc-auth-title">{l.title || "CHOOSE A NEW PASSWORD"}</h1>
          <p className="acc-auth-lead">{l.lead || "Enter a new password for your account."}</p>

          <form onSubmit={submit} className="acc-auth-form">
            <div className="f-field">
              <label htmlFor="newPassword">{l.newPasswordLabel || "New password"}</label>
              <input
                id="newPassword"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="f-field">
              <label htmlFor="confirmPassword">{l.confirmPasswordLabel || "Confirm password"}</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            {error && <p className="acc-auth-error">{error}</p>}

            <button type="submit" className="btn btn-gold acc-auth-submit" disabled={busy}>
              {busy ? "…" : (l.submitBtn || "UPDATE PASSWORD")}
            </button>
          </form>
        </div>
      </main>
      <SiteFooter t={t} />
    </>
  );
}
