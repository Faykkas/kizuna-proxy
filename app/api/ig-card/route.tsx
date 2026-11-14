// GET /api/ig-card?id=<post> : visuel Instagram 1080×1350 d'un post (PNG), aux couleurs de Kizuna.
// Aucune photo de produit : uniquement le texte du post, le logo et le lien vers la source officielle (droits d'auteur).
// Polices : Outfit / Inter (Google Fonts, réduites aux seuls caractères utilisés) + Noto Sans JP si le texte contient du japonais.

import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { IG_KIND_BADGE, sourceLabel, type IgPost } from "../../lib/igPosts";
import { LOGO_SVG } from "../../lib/logoSvg";

export const runtime = "nodejs";

const W = 1080;
const H = 1350;
const C = { bg: "#150d28", ink: "#f0edf7", warm: "#c9c3dc", mist: "#8f86ab", green: "#a8e04a", violet: "#c77dff", red: "#ff6b7d" };

async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`)).text();
    const m = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!m) return null;
    const r = await fetch(m[1]);
    return r.ok ? await r.arrayBuffer() : null;
  } catch {
    return null;
  }
}

async function loadPost(id: string): Promise<IgPost | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await sb.from("ig_posts").select("*").eq("id", id).maybeSingle();
  return (data as IgPost) || null;
}

// Exemple fixe (?id=demo) pour voir le rendu sans base de données. Jamais de texte libre dans l'adresse : personne ne
// peut fabriquer un faux visuel Kizuna avec un texte de son choix.
const DEMO: IgPost = {
  id: "demo",
  status: "approved",
  kind: "popup",
  title: "Pokémon Center Christmas pop-up",
  subtitle: "Limited holiday plush & goods",
  dates: "Nov 21 – Dec 25, 2026",
  place: "Pokémon Center Shibuya, Tokyo",
  highlights: ["Christmas Pikachu plush", "Limited holiday keychains", "Pop-up exclusive tote bag"],
  official_url: "https://www.pokemoncenter-online.com/",
  source_name: "Pokémon Center",
  caption: null,
  created_by: "admin",
  created_at: "2026-11-14T00:00:00Z",
  updated_at: "2026-11-14T00:00:00Z",
  published_at: null,
};

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") || "";
  const post = id === "demo" ? DEMO : await loadPost(id);
  if (!post) return new Response("Not found", { status: 404 });

  const badge = IG_KIND_BADGE[post.kind] || "From Japan";
  const source = sourceLabel(post);
  const title = post.title;
  const titleSize = title.length > 46 ? 76 : title.length > 30 ? 90 : 108;
  const allText = [badge, title, post.subtitle, post.dates, post.place, ...post.highlights, source, "KIZUNA PROXY Tokyo personal shopper WHEN WHERE WE CAN BUY FOR YOU Official info link in bio kizunaproxy.com/ig →•·"].filter(Boolean).join(" ");
  const hasJa = /[　-ヿ㐀-鿿＀-￯]/.test(allText);

  const [outfit, inter, interMedium, noto] = await Promise.all([
    googleFont("Outfit", 800, allText),
    googleFont("Inter", 400, allText),
    googleFont("Inter", 600, allText),
    hasJa ? googleFont("Noto+Sans+JP", 700, allText) : Promise.resolve(null),
  ]);
  const fonts = [
    outfit && { name: "Outfit", data: outfit, weight: 800 as const, style: "normal" as const },
    inter && { name: "Inter", data: inter, weight: 400 as const, style: "normal" as const },
    interMedium && { name: "Inter", data: interMedium, weight: 600 as const, style: "normal" as const },
    noto && { name: "Noto Sans JP", data: noto, weight: 700 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 600 | 700 | 800; style: "normal" }[];

  const logo = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString("base64")}`;
  const head = "Outfit, Noto Sans JP";
  const body = "Inter, Noto Sans JP";

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", flexDirection: "column", position: "relative", background: C.bg, fontFamily: body, color: C.ink, padding: 76 }}>
        {/* lueurs d'ambiance */}
        <div style={{ position: "absolute", top: -260, right: -220, width: 760, height: 760, borderRadius: 760, background: "radial-gradient(circle, rgba(199,125,255,0.30) 0%, rgba(199,125,255,0) 70%)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -300, left: -240, width: 820, height: 820, borderRadius: 820, background: "radial-gradient(circle, rgba(168,224,74,0.20) 0%, rgba(168,224,74,0) 70%)", display: "flex" }} />
        {/* cadre */}
        <div style={{ position: "absolute", top: 28, left: 28, width: W - 56, height: H - 56, border: "3px solid rgba(168,224,74,0.5)", borderRadius: 48, display: "flex" }} />

        {/* en-tête : logo + marque, étiquette du type */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <img src={logo} width={92} height={92} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: head, fontSize: 38, fontWeight: 800, letterSpacing: -0.5 }}>
                <span style={{ color: C.green }}>Kizuna</span>&nbsp;Proxy
              </span>
              <span style={{ fontSize: 24, color: C.mist, fontWeight: 600, letterSpacing: 2 }}>TOKYO PERSONAL SHOPPER</span>
            </div>
          </div>
          <div style={{ display: "flex", padding: "14px 26px", borderRadius: 999, border: `2px solid ${C.green}`, color: C.green, fontSize: 26, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>{badge}</div>
        </div>

        {/* titre */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 92 }}>
          <div style={{ display: "flex", fontFamily: head, fontSize: titleSize, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2, color: "#ffffff" }}>{title}</div>
          {post.subtitle ? <div style={{ display: "flex", marginTop: 22, fontFamily: head, fontSize: 46, fontWeight: 800, lineHeight: 1.15, color: C.green }}>{post.subtitle}</div> : null}
        </div>

        {/* quand / où */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 54 }}>
          {post.dates ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 26 }}>
              <span style={{ width: 150, flexShrink: 0, paddingTop: 14, fontSize: 24, fontWeight: 600, letterSpacing: 3, color: C.violet }}>WHEN</span>
              <span style={{ flex: 1, fontSize: 40, fontWeight: 600, lineHeight: 1.2, color: C.ink }}>{post.dates}</span>
            </div>
          ) : null}
          {post.place ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 26 }}>
              <span style={{ width: 150, flexShrink: 0, paddingTop: 14, fontSize: 24, fontWeight: 600, letterSpacing: 3, color: C.violet }}>WHERE</span>
              <span style={{ flex: 1, fontSize: 40, fontWeight: 600, lineHeight: 1.2, color: C.ink }}>{post.place}</span>
            </div>
          ) : null}
        </div>

        {/* ce qu'on peut acheter */}
        {post.highlights.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 52, padding: "34px 40px", borderRadius: 32, background: "rgba(255,255,255,0.05)", border: "2px solid rgba(168,224,74,0.45)" }}>
            <span style={{ fontSize: 24, fontWeight: 600, letterSpacing: 3, color: C.green }}>WE CAN BUY FOR YOU</span>
            {post.highlights.slice(0, 5).map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: C.green, display: "flex" }} />
                <span style={{ fontSize: 36, color: C.ink }}>{h}</span>
              </div>
            ))}
          </div>
        ) : null}

        {/* pied : source officielle + lien de la bio */}
        <div style={{ display: "flex", marginTop: "auto", alignItems: "flex-end", justifyContent: "space-between", paddingTop: 30, borderTop: "2px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 22, letterSpacing: 2, color: C.mist, fontWeight: 600 }}>OFFICIAL INFO</span>
            <span style={{ fontSize: 32, fontWeight: 600, color: C.warm }}>{source} → link in bio</span>
          </div>
          <div style={{ display: "flex", padding: "16px 28px", borderRadius: 20, background: C.green, color: C.bg, fontFamily: head, fontSize: 32, fontWeight: 800 }}>kizunaproxy.com/ig</div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: fonts.length ? fonts : undefined,
      headers: { "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800" },
    }
  );
}
