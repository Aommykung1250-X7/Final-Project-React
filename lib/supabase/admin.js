import "server-only";
import { createClient } from "@supabase/supabase-js";

let adminClient;

export function getAdminSupabase() {
  if (typeof window !== "undefined") throw new Error("Admin Supabase client is server-only");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    throw new Error("Supabase server environment is not configured");
  }
  adminClient ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }
  );
  return adminClient;
}
