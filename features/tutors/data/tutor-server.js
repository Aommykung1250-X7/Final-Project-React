import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/auth/session";
import { createSupabaseJwt } from "@/lib/auth/supabase-jwt";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { TUTOR_COLUMNS, mapTutor } from "@/features/tutors/data/map-tutor";

// Runs per request on the server and uses the signed-in student's RLS-scoped JWT.
export async function listTutorsForCurrentStudent() {
  const session = await getSession();
  if (!session) return listTutorsForGuest();
  if (session.role !== "student") return { tutors: [], error: "" };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    return { tutors: [], error: "ยังไม่ได้ตั้งค่า Supabase สำหรับโหลดรายชื่อติวเตอร์" };
  }

  try {
    const token = await createSupabaseJwt(session);
    const supabase = createClient(url, publishableKey, {
      accessToken: async () => token,
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    const { data: rows, error } = await supabase
      .from("tutor_profiles")
      .select(TUTOR_COLUMNS)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    if (!rows?.length) return { tutors: [], error: "" };

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", rows.map((row) => row.user_id));
    if (profilesError) throw profilesError;
    const byId = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
    return { tutors: rows.map((row) => mapTutor(row, byId.get(row.user_id))), error: "" };
  } catch (error) {
    console.error("Tutor SSR query failed", error?.message || "unknown");
    return { tutors: [], error: "โหลดข้อมูลติวเตอร์ไม่สำเร็จ ตรวจการตั้งค่าและ SQL migration ของ Supabase" };
  }
}

// Guests can browse cards before logging in. RLS only lets logged-in students read tutors,
// so this runs on the server with the admin client and returns only public card fields.
async function listTutorsForGuest() {
  try {
    const admin = getAdminSupabase();
    const { data: rows, error } = await admin
      .from("tutor_profiles")
      .select(TUTOR_COLUMNS)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    if (!rows?.length) return { tutors: [], error: "" };
    const { data: profiles, error: profilesError } = await admin
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", rows.map((row) => row.user_id));
    if (profilesError) throw profilesError;
    const byId = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
    return { tutors: rows.map((row) => mapTutor(row, byId.get(row.user_id))), error: "" };
  } catch (error) {
    console.error("Guest tutor query failed", error?.message || "unknown");
    return { tutors: [], error: "โหลดข้อมูลติวเตอร์ไม่สำเร็จ ตรวจการตั้งค่า Supabase" };
  }
}
