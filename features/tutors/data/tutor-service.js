import { getSupabaseClient } from "@/lib/supabase/client";
import { TUTOR_COLUMNS, mapTutor } from "@/features/tutors/data/map-tutor";

async function mapTutorRows(rows) {
  if (!rows?.length) return [];
  const supabase = getSupabaseClient();
  const { data: profiles, error } = await supabase.from("profiles")
    .select("user_id, display_name, avatar_url")
    .in("user_id", rows.map((row) => row.user_id));
  if (error) throw error;
  const byId = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
  return rows.map((row) => mapTutor(row, byId.get(row.user_id)));
}

export async function listTutors() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("ยังไม่ได้ตั้งค่า Supabase");
  const { data, error } = await supabase.from("tutor_profiles")
    .select(TUTOR_COLUMNS)
    .eq("is_active", true).order("updated_at", { ascending: false }).limit(100);
  if (error) throw error;
  return mapTutorRows(data);
}

export async function getTutorById(id) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("ยังไม่ได้ตั้งค่า Supabase");
  const { data, error } = await supabase.from("tutor_profiles")
    .select(TUTOR_COLUMNS)
    .eq("user_id", id).eq("is_active", true).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return (await mapTutorRows([data]))[0];
}

export async function listLikedTutors() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("ยังไม่ได้ตั้งค่า Supabase");
  const { data: likes, error } = await supabase.from("likes").select("tutor_id, status, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  if (!likes?.length) return [];
  const { data: rows, error: tutorsError } = await supabase.from("tutor_profiles")
    .select(TUTOR_COLUMNS)
    .in("user_id", likes.map((like) => like.tutor_id)).eq("is_active", true);
  if (tutorsError) throw tutorsError;
  const mapped = await mapTutorRows(rows);
  const order = new Map(likes.map((like, index) => [like.tutor_id, index]));
  const statusById = new Map(likes.map((like) => [like.tutor_id, like.status]));
  return mapped
    .map((tutor) => ({ ...tutor, requestStatus: statusById.get(tutor.id) }))
    .sort((a, b) => order.get(a.id) - order.get(b.id));
}

export async function getRequestStatus(tutorId) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("ยังไม่ได้ตั้งค่า Supabase");
  const { data, error } = await supabase.from("likes").select("status").eq("tutor_id", tutorId).maybeSingle();
  if (error) throw error;
  return data?.status || null;
}
