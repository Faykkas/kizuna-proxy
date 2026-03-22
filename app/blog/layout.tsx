import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Blog — Kizuna Proxy",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,248,244,.95)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(13,11,9,.07)", padding: "0 2rem", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "100%" }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 700, color: "#0d0b09", textDecoration: "none", letterSpacing: ".04em" }}>
          <span style={{ color: "#b82a24" }}>Kizuna</span> Proxy
        </a>
        <a href="/#request-wrap" style={{ fontSize: ".68rem", letterSpacing: ".12em", textTransform: "uppercase", background: "#0d0b09", color: "#fff", padding: ".42rem 1.1rem", borderRadius: "1px", textDecoration: "none" }}>
          Request an item
        </a>
      </nav>
      {children}
      <footer style={{ background: "#0d0b09", padding: "2rem", textAlign: "center", color: "rgba(250,248,244,.3)", fontSize: ".75rem", letterSpacing: ".08em" }}>
        © 2026 Kizuna Proxy — <a href="/" style={{ color: "rgba(250,248,244,.3)", textDecoration: "none" }}>Back to home</a>
      </footer>
    </>
  );
}
