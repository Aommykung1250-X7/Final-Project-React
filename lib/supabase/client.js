"use client";

import { createClient } from "@supabase/supabase-js";

let supabase;

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  supabase ??= createClient(url, publishableKey, {
    accessToken: async () => {
      const response = await fetch("/api/auth/token", { cache: "no-store" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.token ?? null;
    },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return supabase;
}
