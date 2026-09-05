// @ts-nocheck
"use client";
// app/account/login/LoginClient.tsx
//
// One screen for both sign-in and sign-up. Customers dislike account
// creation, so registration asks for the minimum: name, email, password.
// Everything else is collected later, or never.

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import Maneki from "../../components/pixel/Maneki";
import { useLanguage } from "../../lib/language";
import { useAuth } from "../../lib/auth";

export default function LoginClient() {
  const router = useRouter();
  const { t } = useLanguage();
  const l = t.loginPage || {};
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState("signin");   // signin | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (mode === "forgot") {
      if (!email) {
        setError(l.errEmailRequired || "Email is required.");
        return;
      }
      setBusy(true);
      const { error } = await resetPassword(email);
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      setResetSent(true);
      return;
    }

    if (!email || !password) {
      setError(l.errEmailPassword || "Email and password are required.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError(l.errPasswordLength || "Password must be at least 8 characters.");
      return;
    }

    setBusy(true);

    if (mode === "signin") {
      const { error } = await signIn(email, password);
      setBusy(false);
      if (error) {
        // Supabase returns the same message for wrong password and unknown
        // account, which is correct — revealing which one it is would let
        // someone probe for registered email addresses.
        setError(l.errWrongCredentials || "Wrong email or password.");
        return;
      }
      router.push("/account");
    } else {
      const { error } = await signUp(email, password, fullName);
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      setSent(true);
    }
  }

  if (sent) {
    return (
      <>
        <SiteNav />
        <main className="acc-auth-wrap">
          <div className="acc-auth-card">
            <div className="acc-auth-mascot">
              <Maneki state="success" size={90} float />
            </div>
            <h1 className="acc-auth-title">{l.checkEmailTitle || "CHECK YOUR EMAIL"}</h1>
            <p className="acc-auth-lead">
              {l.checkEmailLeadPre || "We sent a confirmation link to "}<strong>{email}</strong>{l.checkEmailLeadPost || ". Click it and you're in."}
            </p>
            <p className="acc-auth-hint">
              {l.checkEmailHint || "Nothing after a few minutes? Check your spam folder."}
            </p>
          </div>
        </main>
        <SiteFooter t={t} />
      </>
    );
  }

  if (resetSent) {
    return (
      <>
        <SiteNav />
        <main className="acc-auth-wrap">
          <div className="acc-auth-card">
            <div className="acc-auth-mascot">
              <Maneki state="success" size={90} float />
            </div>
            <h1 className="acc-auth-title">{l.resetSentTitle || "CHECK YOUR EMAIL"}</h1>
            <p className="acc-auth-lead">
              {l.resetSentLeadPre || "We sent a password reset link to "}<strong>{email}</strong>{l.resetSentLeadPost || ". Click it to choose a new password."}
            </p>
            <p className="acc-auth-hint">
              {l.checkEmailHint || "Nothing after a few minutes? Check your spam folder."}
            </p>
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

          <h1 className="acc-auth-title">
            {mode === "signin" ? (l.welcomeBack || "WELCOME BACK")
              : mode === "signup" ? (l.createAccount || "CREATE ACCOUNT")
              : (l.forgotTitle || "RESET PASSWORD")}
          </h1>
          <p className="acc-auth-lead">
            {mode === "signin" ? (l.leadSignin || "Track your orders, see photos, pay shipping.")
              : mode === "signup" ? (l.leadSignup || "Takes 30 seconds. Track every order in one place.")
              : (l.forgotLead || "Enter your email and we'll send you a link to reset your password.")}
          </p>

          <form onSubmit={submit} className="acc-auth-form">
            {mode === "signup" && (
              <div className="f-field">
                <label htmlFor="name">{l.yourName || "Your name"}</label>
                <input
                  id="name"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder={l.namePlaceholder || "How should we call you?"}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="f-field">
              <label htmlFor="email">{l.emailLabel || "Email"}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            {mode !== "forgot" && (
              <div className="f-field">
                <label htmlFor="password">{l.passwordLabel || "Password"}</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? (l.passwordPlaceholderSignup || "At least 8 characters") : "••••••••"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                />
              </div>
            )}

            {mode === "signin" && (
              <button type="button" className="acc-auth-forgot" onClick={() => { setMode("forgot"); setError(""); }}>
                {l.forgotPasswordLink || "Forgot password?"}
              </button>
            )}

            {error && <p className="acc-auth-error">{error}</p>}

            <button type="submit" className="btn btn-gold acc-auth-submit" disabled={busy}>
              {busy ? "…" : mode === "signin" ? (l.signInBtn || "SIGN IN")
                : mode === "signup" ? (l.createAccount || "CREATE ACCOUNT")
                : (l.forgotSubmitBtn || "SEND RESET LINK")}
            </button>
          </form>

          <div className="acc-auth-switch">
            {mode === "signin" ? (
              <>
                {l.noAccountYet || "No account yet?"}{" "}
                <button onClick={() => { setMode("signup"); setError(""); }}>
                  {l.createOneLink || "Create one"}
                </button>
              </>
            ) : mode === "signup" ? (
              <>
                {l.alreadyHaveAccount || "Already have an account?"}{" "}
                <button onClick={() => { setMode("signin"); setError(""); }}>
                  {l.signInLink || "Sign in"}
                </button>
              </>
            ) : (
              <button onClick={() => { setMode("signin"); setError(""); }}>
                {l.forgotBackLink || "Back to sign in"}
              </button>
            )}
          </div>

          {mode === "signup" && (
            <p className="acc-auth-hint">
              {l.signupHint || "Ordered before? Use the same email and your past orders will appear automatically."}
            </p>
          )}
        </div>
      </main>
      <SiteFooter t={t} />
    </>
  );
}
