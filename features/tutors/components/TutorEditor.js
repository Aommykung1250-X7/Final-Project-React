"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tutorEditorSchema } from "@/features/auth/schemas";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import { TUTOR_COLUMNS } from "@/features/tutors/data/map-tutor";
import FieldError from "@/components/ui/FieldError";
import { inputClass } from "@/components/ui/form-styles";

export default function TutorEditor() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(tutorEditorSchema) });

  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== "tutor") { setLoading(false); return; }
    let alive = true;
    const supabase = getSupabaseClient();
    Promise.all([
      supabase.from("tutor_profiles").select(TUTOR_COLUMNS).eq("user_id", user.id).single(),
      supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
    ]).then(([tutorResult, profileResult]) => {
      if (!alive) return;
      if (tutorResult.error || profileResult.error) throw tutorResult.error || profileResult.error;
      setProfile(tutorResult.data);
      reset({
        displayName: profileResult.data.display_name,
        subjects: tutorResult.data.subjects.join(", "),
        levels: tutorResult.data.levels.join(", "),
        pricePerHour: tutorResult.data.price_per_hour,
        mode: tutorResult.data.teaching_mode,
        province: tutorResult.data.province,
        district: tutorResult.data.district || "",
        bio: tutorResult.data.bio,
        photo: tutorResult.data.photo_url || "",
      });
    }).catch(() => { if (alive) setError("โหลดโปรไฟล์ไม่สำเร็จ"); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user?.id, user?.role, authLoading, reset]);

  async function save(values) {
    setError("");
    setMessage("");
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();
    const [{ error: tutorError }, { error: nameError }] = await Promise.all([
      supabase.from("tutor_profiles").update({
        bio: values.bio,
        subjects: values.subjects,
        levels: values.levels,
        price_per_hour: values.pricePerHour,
        teaching_mode: values.mode,
        province: values.province,
        district: values.district,
        photo_url: values.photo || null,
        updated_at: now,
      }).eq("user_id", user.id),
      supabase.from("profiles").update({
        display_name: values.displayName,
        avatar_url: values.photo || null,
        updated_at: now,
      }).eq("user_id", user.id),
    ]);
    if (tutorError || nameError) setError("บันทึกไม่สำเร็จ กรุณาตรวจข้อมูลและลองอีกครั้ง");
    else setMessage("บันทึกโปรไฟล์แล้ว");
  }

  if (authLoading || loading) return <p className="py-10 text-center text-gray-500">กำลังโหลดโปรไฟล์…</p>;
  if (!user) return <div className="rounded-2xl bg-white p-6">กรุณา<Link href="/login" className="text-rose-500 underline">เข้าสู่ระบบ</Link>เพื่อจัดการโปรไฟล์ติวเตอร์</div>;
  if (user.role !== "tutor") return <p className="rounded-2xl bg-white p-6">หน้านี้สำหรับบัญชีติวเตอร์</p>;
  if (!profile) return <p role="alert" className="rounded-2xl bg-white p-6 text-rose-700">{error || "ไม่พบโปรไฟล์ติวเตอร์"}</p>;

  return <form noValidate onSubmit={handleSubmit(save)} className="mx-auto max-w-lg space-y-4 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
    <div><h1 className="text-2xl font-bold">โปรไฟล์ติวเตอร์</h1><p className="mt-1 text-sm text-gray-500">ข้อมูลนี้จะแสดงให้นักเรียนที่กำลังค้นหาติวเตอร์</p></div>
    <label className="block text-sm">ชื่อที่แสดง<input {...register("displayName")} maxLength={80} aria-invalid={!!errors.displayName} className={inputClass} /><FieldError message={errors.displayName?.message} /></label>
    <label className="block text-sm">วิชาที่สอน คั่นด้วย ,<input {...register("subjects")} maxLength={720} aria-invalid={!!errors.subjects} className={inputClass} /><FieldError message={errors.subjects?.message} /></label>
    <label className="block text-sm">ระดับชั้น คั่นด้วย ,<input {...register("levels")} maxLength={720} aria-invalid={!!errors.levels} className={inputClass} /><FieldError message={errors.levels?.message} /></label>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="block text-sm">ราคา/ชั่วโมง<input {...register("pricePerHour", { valueAsNumber: true })} type="number" min="0" max="100000" step="1" aria-invalid={!!errors.pricePerHour} className={inputClass} /><FieldError message={errors.pricePerHour?.message} /></label>
      <label className="block text-sm">รูปแบบการสอน<input {...register("mode")} maxLength={80} aria-invalid={!!errors.mode} className={inputClass} /><FieldError message={errors.mode?.message} /></label>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="block text-sm">จังหวัด<input {...register("province")} maxLength={100} aria-invalid={!!errors.province} className={inputClass} /><FieldError message={errors.province?.message} /></label>
      <label className="block text-sm">อำเภอ/เขต<input {...register("district")} maxLength={100} aria-invalid={!!errors.district} className={inputClass} /><FieldError message={errors.district?.message} /></label>
    </div>
    <label className="block text-sm">แนะนำตัว<textarea {...register("bio")} rows={4} maxLength={2000} aria-invalid={!!errors.bio} className={inputClass} /><FieldError message={errors.bio?.message} /></label>
    <label className="block text-sm">URL รูปโปรไฟล์<input {...register("photo")} type="url" maxLength={2048} aria-invalid={!!errors.photo} className={inputClass} /><FieldError message={errors.photo?.message} /></label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}{message && <p role="status" className="text-sm text-green-700">{message}</p>}
    <button disabled={isSubmitting} className="w-full rounded-full bg-rose-500 px-5 py-3 font-semibold text-white disabled:opacity-50">{isSubmitting ? "กำลังบันทึก…" : "บันทึกโปรไฟล์"}</button>
  </form>;
}
