"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registrationSchema } from "@/features/auth/schemas";
import { useAuth } from "@/features/auth/context/AuthContext";

const inputClass = "mt-1 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

function FieldError({ id, message }) {
  return message ? <p id={id} className="mt-1 text-sm text-red-700">{message}</p> : null;
}

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [role, setRole] = useState("student");
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isRegister ? registrationSchema : loginSchema),
    shouldUnregister: true,
    defaultValues: isRegister
      ? { role: "student", email: "", password: "", displayName: "" }
      : { email: "", password: "" },
  });

  async function submit(values) {
    setSubmitError("");
    try {
      const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ดำเนินการไม่สำเร็จ");
      const user = await refreshUser();
      router.replace(user?.role === "tutor" ? "/post" : "/");
    } catch (error) {
      setSubmitError(error?.message || "ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  }

  const onSubmit = handleSubmit(submit, () => setSubmitError("ตรวจสอบข้อมูลที่ระบุแล้วลองอีกครั้ง"));
  const roleField = isRegister ? register("role", {
    onChange: (event) => setRole(event.target.value),
  }) : null;

  return (
    <form noValidate onSubmit={onSubmit} className="mx-auto w-full max-w-lg space-y-4 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
      <div>
        <h1 className="text-2xl font-bold">{isRegister ? "สมัครสมาชิก TutorMatch" : "เข้าสู่ระบบ"}</h1>
        <p className="mt-1 text-sm text-gray-500">{isRegister ? "เลือกบทบาทและเริ่มหาคู่เรียนที่ใช่" : "เข้าสู่ระบบเพื่อดูรายการที่ถูกใจและแชต"}</p>
      </div>
      {isRegister && <>
        <label className="block text-sm font-medium">ฉันเป็น
          <select {...roleField} aria-invalid={!!errors.role} className={inputClass}>
            <option value="student">นักเรียน</option><option value="tutor">ติวเตอร์</option>
          </select>
          <FieldError id="role-error" message={errors.role?.message} />
        </label>
        <label className="block text-sm font-medium">ชื่อที่แสดง
          <input {...register("displayName")} autoComplete="name" maxLength={80} aria-invalid={!!errors.displayName} aria-describedby={errors.displayName ? "displayName-error" : undefined} className={inputClass} />
          <FieldError id="displayName-error" message={errors.displayName?.message} />
        </label>
      </>}
      <label className="block text-sm font-medium">อีเมล
        <input {...register("email")} type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} className={inputClass} />
        <FieldError id="email-error" message={errors.email?.message} />
      </label>
      <label className="block text-sm font-medium">รหัสผ่าน
        <input {...register("password")} type="password" maxLength={128} autoComplete={isRegister ? "new-password" : "current-password"} aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} className={inputClass} />
        <FieldError id="password-error" message={errors.password?.message} />
        {isRegister && <span className="mt-1 block text-xs text-gray-500">อย่างน้อย 10 ตัวอักษร</span>}
      </label>
      {isRegister && role === "tutor" && <fieldset className="space-y-3 rounded-2xl bg-rose-50 p-4">
        <legend className="px-1 font-semibold">ข้อมูลโปรไฟล์ติวเตอร์</legend>
        <label className="block text-sm">วิชาที่สอน (คั่นด้วย ,)
          <input {...register("tutorProfile.subjects")} maxLength={720} placeholder="คณิตศาสตร์, ฟิสิกส์" aria-invalid={!!errors.tutorProfile?.subjects} className={inputClass} />
          <FieldError message={errors.tutorProfile?.subjects?.message} />
        </label>
        <label className="block text-sm">ระดับชั้น (คั่นด้วย ,)
          <input {...register("tutorProfile.levels")} maxLength={720} placeholder="มัธยมต้น, มัธยมปลาย" aria-invalid={!!errors.tutorProfile?.levels} className={inputClass} />
          <FieldError message={errors.tutorProfile?.levels?.message} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm">ราคา/ชั่วโมง
            <input {...register("tutorProfile.pricePerHour", { valueAsNumber: true })} type="number" min="0" max="100000" step="1" aria-invalid={!!errors.tutorProfile?.pricePerHour} className={inputClass} />
            <FieldError message={errors.tutorProfile?.pricePerHour?.message} />
          </label>
          <label className="block text-sm">รูปแบบการสอน
            <input {...register("tutorProfile.mode")} maxLength={80} placeholder="ออนไลน์ / พบกัน" aria-invalid={!!errors.tutorProfile?.mode} className={inputClass} />
            <FieldError message={errors.tutorProfile?.mode?.message} />
          </label>
        </div>
        <label className="block text-sm">จังหวัด
          <input {...register("tutorProfile.province")} maxLength={100} aria-invalid={!!errors.tutorProfile?.province} className={inputClass} />
          <FieldError message={errors.tutorProfile?.province?.message} />
        </label>
        <label className="block text-sm">แนะนำตัว
          <textarea {...register("tutorProfile.bio")} maxLength={2000} rows={3} aria-invalid={!!errors.tutorProfile?.bio} className={inputClass} />
          <FieldError message={errors.tutorProfile?.bio?.message} />
        </label>
        <label className="block text-sm">URL รูปโปรไฟล์ (ถ้ามี)
          <input {...register("tutorProfile.photo")} type="url" maxLength={2048} aria-invalid={!!errors.tutorProfile?.photo} className={inputClass} />
          <FieldError message={errors.tutorProfile?.photo?.message} />
        </label>
      </fieldset>}
      {submitError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}
      <button disabled={isSubmitting} className="w-full rounded-full bg-rose-500 px-5 py-3 font-semibold text-white hover:bg-rose-600 disabled:opacity-60">
        {isSubmitting ? "กำลังดำเนินการ…" : isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
      </button>
      <p className="text-center text-sm text-gray-600">{isRegister ? "มีบัญชีแล้ว? " : "ยังไม่มีบัญชี? "}
        <Link href={isRegister ? "/login" : "/register"} className="text-rose-600 underline">{isRegister ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</Link>
      </p>
    </form>
  );
}
