import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { normalizeEmail, validEmail } from "@/lib/auth/input";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const invalidCredentials = () => NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });

function keyedValue(value) {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("Supabase server environment is not configured");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    if (!validEmail(email) || typeof body.password !== "string" || body.password.length > 128) return invalidCredentials();
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const emailKey = keyedValue(`email:${email}`);
    const ipKey = keyedValue(`ip:${forwardedFor}`);
    const admin = getAdminSupabase();
    const { data: attempt } = await admin.from("login_attempts").select("attempts, window_started_at, locked_until")
      .eq("email_key", emailKey).eq("ip_key", ipKey).maybeSingle();
    if (attempt?.locked_until && Date.parse(attempt.locked_until) > Date.now()) return invalidCredentials();

    const { data: account } = await admin.from("accounts").select("id, password_hash")
      .eq("email", email).maybeSingle();
    const passwordMatches = account ? await verifyPassword(account.password_hash, body.password).catch(() => false) : false;
    if (!passwordMatches) {
      await admin.rpc("record_login_failure", { p_email_key: emailKey, p_ip_key: ipKey });
      return invalidCredentials();
    }

    await admin.from("login_attempts").delete().eq("email_key", emailKey).eq("ip_key", ipKey);
    await createSession(account.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login request failed", error?.message || "unknown");
    return NextResponse.json({ error: "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจการตั้งค่า Supabase" }, { status: 500 });
  }
}
