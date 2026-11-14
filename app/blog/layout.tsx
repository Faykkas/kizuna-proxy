// app/blog/layout.tsx
import "../globals.css";
import SiteNav from "../components/SiteNav";
import GuideExtras from "./GuideExtras";
import GuideCover from "./GuideCover";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <GuideCover />
      {children}
      <GuideExtras />
      <footer style={{
        background: "#080809", padding: "2rem", textAlign: "center",
        color: "rgba(244,244,245,.2)", fontSize: ".75rem", letterSpacing: ".08em",
        borderTop: "1px solid rgba(255,255,255,.06)",
      }}>
        © 2026 Kizuna Proxy ·{" "}
        <a href="/" style={{ display: "inline-block", padding: ".6rem 0", color: "rgba(244,244,245,.45)", textDecoration: "none" }}>← Back to home</a>
      </footer>
    </>
  );
}