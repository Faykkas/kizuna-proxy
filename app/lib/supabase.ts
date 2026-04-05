// app/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "event" | "available" | "unavailable";
  description?: string;
  store?: string;
  created_at: string;
};
