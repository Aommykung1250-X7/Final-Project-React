import { getSupabaseClient } from "@/lib/supabase/client";
import { startConversation } from "@/features/chat/data/chat-service";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("ยังไม่ได้ตั้งค่า Supabase");
  return supabase;
}

// Requests students sent to the signed-in tutor (RLS limits rows to tutor_id = me).
export async function listRequests() {
  const supabase = client();
  const { data: likes, error } = await supabase.from("likes")
    .select("student_id, status, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  if (!likes?.length) return [];
  const { data: profiles, error: profileError } = await supabase.from("profiles")
    .select("user_id, display_name, avatar_url").in("user_id", likes.map((like) => like.student_id));
  if (profileError) throw profileError;
  const byId = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
  return likes.map((like) => ({ ...like, student: byId.get(like.student_id) }));
}

export async function respondToRequest(studentId, tutorId, accept) {
  const { error } = await client().from("likes")
    .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("student_id", studentId).eq("tutor_id", tutorId).eq("status", "pending");
  if (error) throw error;
  return accept ? startConversation(tutorId, studentId) : null;
}
