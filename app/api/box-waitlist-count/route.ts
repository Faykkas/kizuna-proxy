// @ts-nocheck
// app/api/box-waitlist-count/route.ts
//
// Returns the Kizuna Box waitlist count, offset by a fixed head start so
// the badge looks credible from day one instead of showing "1 interested".
// Runs server-side with the service key so box_waitlist can stay
// insert-only for anonymous visitors — nobody can read the real emails
// (or the real, un-offset count) through the public API.

import { createClient } from "@supabase/supabase-js";

const HEAD_START = 12;

let _admin = null;
function getAdmin() {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

export async function GET() {
  const admin = getAdmin();
  if (!admin) {
    return Response.json({ count: HEAD_START });
  }

  const { count, error } = await admin
    .from("box_waitlist")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("box-waitlist-count query failed:", error);
    return Response.json({ count: HEAD_START });
  }

  return Response.json({ count: HEAD_START + (count || 0) });
}
