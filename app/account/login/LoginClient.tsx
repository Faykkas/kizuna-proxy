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
import { copy as t } from "../../translations";
import { useAuth } from "../../lib/auth";

export default function LoginClient() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState("signin");   // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
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
        setError("Wrong email or password.");
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
            <h1 className="acc-auth-title">CHECK YOUR EMAIL</h1>
            <p className="acc-auth-lead">
              We sent a confirmation link to <strong>{email}</strong>.
              Click it and you&apos;re in.
            </p>
            <p className="acc-auth-hint">
              Nothing after a few minutes? Check your spam folder.
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
            {mode === "signin" ? "WELCOME BACK" : "CREATE ACCOUNT"}
          </h1>
          <p className="acc-auth-lead">
            {mode === "signin"
              ? "Track your orders, see photos, pay shipping."
              : "Takes 30 seconds. Track every order in one place."}
          </p>

          <form onSubmit={submit} className="acc-auth-form">
            {mode === "signup" && (
              <div className="f-field">
                <label htmlFor="name">Your name</label>
                <input
                  id="name"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="How should we call you?"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="f-field">
              <label htmlFor="email">Email</label>
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

            <div className="f-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
              />
            </div>

            {error && <p className="acc-auth-error">{error}</p>}

            <button type="submit" className="btn btn-gold acc-auth-submit" disabled={busy}>
              {busy ? "…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="acc-auth-switch">
            {mode === "signin" ? (
              <>
                No account yet?{" "}
                <button onClick={() => { setMode("signup"); setError(""); }}>
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => { setMode("signin"); setError(""); }}>
                  Sign in
                </button>
              </>
            )}
          </div>

          {mode === "signup" && (
            <p className="acc-auth-hint">
              Ordered before? Use the same email and your past orders
              will appear automatically.
            </p>
          )}
        </div>
      </main>
      <SiteFooter t={t} />
    </>
  );
}
