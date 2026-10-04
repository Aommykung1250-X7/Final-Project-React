import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ยังไม่ได้ตั้งค่า env ก็ให้เว็บรันได้ (ได้ null แทน)
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
