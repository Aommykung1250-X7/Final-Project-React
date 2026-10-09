import { NextResponse } from "next/server";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { boundedString, normalizeEmail, validEmail } from "@/lib/auth/input";
import { createSession } from "@/lib/auth/session";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    const role = body.role;
    const passwordError = validatePassword(body.password);
    if (!validEmail(email)) return NextResponse.json({ error: "กรุณากรอกอีเมลให้ถูกต้อง" }, { status: 400 });
    if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
    if (!boundedString(body.displayName, 80)) return NextResponse.json({ error: "กรุณากรอกชื่อ (ไม่เกิน 80 ตัวอักษร)" }, { status: 400 });
    if (role !== "student" && role !== "tutor") return NextResponse.json({ error: "กรุณาเลือกประเภทบัญชี" }, { status: 400 });

    let tutorProfile = null;
    if (role === "tutor") {
      const profile = body.tutorProfile || {};
      const subjects = Array.isArray(profile.subjects) ? [...new Set(profile.subjects.map((v) => typeof v === "string" ? v.trim() : "").filter(Boolean))] : [];
      const levels = Array.isArray(profile.levels) ? [...new Set(profile.levels.map((v) => typeof v === "string" ? v.trim() : "").filter(Boolean))] : [];
      const pricePerHour = Number(profile.pricePerHour);
      if (!subjects.length || subjects.length > 12 || subjects.some((v) => v.length > 60)
        || !levels.length || levels.length > 12 || levels.some((v) => v.length > 60)
        || !Number.isInteger(pricePerHour) || pricePerHour < 0 || pricePerHour > 100000
        || !boundedString(profile.bio, 2000) || !boundedString(profile.mode, 80)
        || !boundedString(profile.province, 100)
        || !boundedString(profile.district, 100)
        || (profile.photo && (typeof profile.photo !== "string" || profile.photo.length > 2048))) {
        return NextResponse.json({ error: "กรุณากรอกข้อมูลติวเตอร์ให้ครบและถูกต้อง" }, { status: 400 });
      }
      tutorProfile = { ...profile, subjects, levels, pricePerHour };
    }

    const passwordHash = await hashPassword(body.password);
    const { data: userId, error } = await getAdminSupabase().rpc("register_account", {
      p_email: email,
      p_password_hash: passwordHash,
      p_role: role,
      p_display_name: body.displayName.trim(),
      p_tutor_profile: tutorProfile,
    });
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
      console.error("Registration database operation failed", error.code || "unknown");
      return NextResponse.json({ error: "สมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 });
    }
    await createSession(userId);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Registration request failed", error?.message || "unknown");
    return NextResponse.json({ error: "สมัครสมาชิกไม่สำเร็จ กรุณาตรวจการตั้งค่า Supabase" }, { status: 500 });
  }
}
