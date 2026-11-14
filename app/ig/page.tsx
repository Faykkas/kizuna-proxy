import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import IgClient from "./IgClient";
import type { IgPost } from "../lib/igPosts";

// Page du lien de la bio Instagram : les posts validés ou publiés, avec le lien officiel et « demander à Kizuna ».
// Lecture publique (la RLS ne laisse voir que les posts validés/publiés). Rafraîchie toutes les 5 minutes.

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Latest from Tokyo: Pop-ups, Collabs & Events We Can Shop For You | Kizuna Proxy",
  description: "Japan pop-up stores, limited collabs, Ichiban Kuji and Tokyo events, with the official info and a free quote to have Kizuna Proxy buy it for you.",
  alternates: { canonical: "https://kizunaproxy.com/ig" },
  openGraph: { images: ["https://kizunaproxy.com/og-image.png"], title: "Latest from Tokyo — Kizuna Proxy", url: "https://kizunaproxy.com/ig" },
};

async function loadPosts(): Promise<IgPost[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await sb
    .from("ig_posts")
    .select("*")
    .in("status", ["approved", "published"])
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) return [];
  return (data ?? []) as IgPost[];
}

export default async function IgPage() {
  const posts = await loadPosts();
  return <IgClient posts={posts} />;
}
