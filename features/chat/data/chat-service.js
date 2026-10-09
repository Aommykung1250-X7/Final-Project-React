import { getSupabaseClient } from "@/lib/supabase/client";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("ยังไม่ได้ตั้งค่า Supabase");
  return supabase;
}

export async function startConversation(tutorId, studentId) {
  const supabase = client();
  const { data: existing, error: findError } = await supabase.from("conversations")
    .select("id").eq("student_id", studentId).eq("tutor_id", tutorId).maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id;
  const { data, error } = await supabase.from("conversations")
    .insert({ student_id: studentId, tutor_id: tutorId }).select("id").single();
  if (!error) return data.id;
  if (error.code === "23505") {
    const { data: raced, error: raceError } = await supabase.from("conversations")
      .select("id").eq("student_id", studentId).eq("tutor_id", tutorId).single();
    if (!raceError) return raced.id;
  }
  throw error;
}

export async function listConversations(user) {
  const supabase = client();
  const { data: conversations, error } = await supabase.from("conversations")
    .select("id, student_id, tutor_id, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  if (!conversations?.length) return [];
  const otherIds = conversations.map((c) => user.role === "student" ? c.tutor_id : c.student_id);
  const [{ data: profiles, error: profileError }, { data: messages, error: messageError }] = await Promise.all([
    supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", otherIds),
    supabase.from("messages").select("conversation_id, body, created_at").in("conversation_id", conversations.map((c) => c.id)).order("created_at", { ascending: false }),
  ]);
  if (profileError) throw profileError;
  if (messageError) throw messageError;
  const profileById = new Map((profiles || []).map((p) => [p.user_id, p]));
  const latestByConversation = new Map();
  for (const message of messages || []) if (!latestByConversation.has(message.conversation_id)) latestByConversation.set(message.conversation_id, message);
  return conversations.map((conversation) => {
    const otherId = user.role === "student" ? conversation.tutor_id : conversation.student_id;
    return { ...conversation, other: profileById.get(otherId), latestMessage: latestByConversation.get(conversation.id) || null };
  });
}

export async function getConversation(conversationId) {
  const { data, error } = await client().from("conversations")
    .select("id, student_id, tutor_id, created_at").eq("id", conversationId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listMessages(conversationId) {
  const { data, error } = await client().from("messages")
    .select("id, conversation_id, sender_id, body, created_at")
    .eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(500);
  if (error) throw error;
  return data || [];
}

export async function sendMessage(conversationId, senderId, body) {
  const cleanBody = body.trim();
  if (!cleanBody || cleanBody.length > 4000) throw new Error("ข้อความต้องมี 1–4000 ตัวอักษร");
  const { data, error } = await client().from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, body: cleanBody })
    .select("id, conversation_id, sender_id, body, created_at").single();
  if (error) throw error;
  return data;
}

export function subscribeToMessages(conversationId, onMessage, onStatus) {
  const supabase = client();
  const channel = supabase.channel(`conversation:${conversationId}`, { config: { private: true } })
    .on("broadcast", { event: "new_message" }, (event) => {
      const row = event.payload?.record || event.payload?.new || event.payload;
      if (row?.id && row.conversation_id === conversationId) onMessage(row);
    })
    .subscribe((status) => onStatus?.(status));
  return () => { supabase.removeChannel(channel); };
}
