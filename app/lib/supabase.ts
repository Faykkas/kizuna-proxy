// app/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Supabase moved from anon/service_role keys to publishable/secret keys.
// Both names are read so the app works either way — useful when the local
// env and Vercel are not updated at the same moment.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

export const supabase = createClient(url, key);

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "event" | "available" | "unavailable";
  description?: string;
  store?: string;
  created_at: string;
};

export type Announce = {
  id: string;
  text_en: string; text_fr: string; text_ja: string;
  text_es: string; text_it: string; text_de: string;
  text_ko: string; text_zh: string;
  from_date: string; to_date: string;
  active: boolean;
};

export type GalleryItem = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  sort_order: number;
};
