"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [likedIds, setLikedIds] = useState([]);
  const [passedIds, setPassedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshLikes = useCallback(async () => {
    if (!user || user.role !== "student") { setLikedIds([]); setLoading(false); return; }
    const supabase = getSupabaseClient();
    if (!supabase) { setError("ยังไม่ได้ตั้งค่า Supabase"); return; }
    setLoading(true);
    const { data, error: queryError } = await supabase.from("likes").select("tutor_id").order("created_at", { ascending: false });
    if (queryError) setError("โหลดรายการที่ถูกใจไม่สำเร็จ");
    else { setError(""); setLikedIds((data || []).map((item) => item.tutor_id)); }
    setLoading(false);
  }, [user]);

  useEffect(() => { if (!authLoading) refreshLikes(); }, [authLoading, refreshLikes]);

  const like = useCallback(async (id) => {
    if (!user || user.role !== "student") throw new Error("เข้าสู่ระบบในฐานะนักเรียนก่อน");
    const supabase = getSupabaseClient();
    const { error: insertError } = await supabase.from("likes").insert({ student_id: user.id, tutor_id: id });
    if (insertError && insertError.code !== "23505") throw insertError;
    setLikedIds((current) => current.includes(id) ? current : [...current, id]);
  }, [user]);

  const pass = useCallback((id) => setPassedIds((current) => current.includes(id) ? current : [...current, id]), []);

  const unlike = useCallback(async (id) => {
    const { error: deleteError } = await getSupabaseClient().from("likes").delete().eq("tutor_id", id);
    if (deleteError) throw deleteError;
    setLikedIds((current) => current.filter((value) => value !== id));
  }, []);

  const reset = useCallback(() => setPassedIds([]), []);

  return <SavedContext.Provider value={{ likedIds, passedIds, like, pass, unlike, reset, loading, error, refreshLikes }}>
    {children}
  </SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
