import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { firstIssueMessage, registrationRequestSchema, thaiFallback } from "@/features/auth/schemas";
import { createSession } from "@/lib/auth/session";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const parsed = registrationRequestSchema.safeParse(await request.json(), thaiFallback);
    if (!parsed.success) return NextResponse.json({ error: firstIssueMessage(parsed.error) }, { status: 400 });
    const { email, password, displayName, role, tutorProfile = null } = parsed.data;

    const passwordHash = await hashPassword(password);
    const { data: userId, error } = await getAdminSupabase().rpc("register_account", {
      p_email: email,
      p_password_hash: passwordHash,
      p_role: role,
      p_display_name: displayName,
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
