import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { normalizeEmail, validEmail } from "@/lib/auth/input";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const invalidCredentials = () => NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });

// Thrown when Supabase itself fails, so the user sees a setup problem instead of "wrong password".
class DatabaseError extends Error {}
function check(error, step) {
  if (error) throw new DatabaseError(`${step}: ${error.code || ""} ${error.message || ""}`.trim());
}

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
    const { data: attempt, error: attemptError } = await admin.from("login_attempts").select("attempts, window_started_at, locked_until")
      .eq("email_key", emailKey).eq("ip_key", ipKey).maybeSingle();
    check(attemptError, "login_attempts");
    if (attempt?.locked_until && Date.parse(attempt.locked_until) > Date.now()) return invalidCredentials();

    const { data: account, error: accountError } = await admin.from("accounts").select("id, password_hash")
      .eq("email", email).maybeSingle();
    check(accountError, "accounts");
    const passwordMatches = account ? await verifyPassword(account.password_hash, body.password).catch(() => false) : false;
    if (!passwordMatches) {
      const { error: failureError } = await admin.rpc("record_login_failure", { p_email_key: emailKey, p_ip_key: ipKey });
      check(failureError, "record_login_failure");
      return invalidCredentials();
    }

    const { error: clearError } = await admin.from("login_attempts").delete().eq("email_key", emailKey).eq("ip_key", ipKey);
    check(clearError, "login_attempts");
    await createSession(account.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login request failed", error?.message || "unknown");
    if (error?.message === "Supabase server environment is not configured") {
      return NextResponse.json({ error: "ยังไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL หรือ SUPABASE_SECRET_KEY ในไฟล์ .env.local" }, { status: 503 });
    }
    if (error instanceof DatabaseError) {
      const hint = /api key|jwt|401|PGRST301/i.test(error.message)
        ? "SUPABASE_SECRET_KEY ใน .env.local ไม่ถูกต้อง"
        : /does not exist|PGRST20|42P01|42883/i.test(error.message)
          ? "ยังไม่ได้รัน SQL migration ใน Supabase ครบ"
          : "เชื่อมต่อ Supabase ไม่ได้";
      return NextResponse.json({ error: `ระบบมีปัญหา ไม่ใช่รหัสผ่านผิด: ${hint}` }, { status: 503 });
    }
    return NextResponse.json({ error: "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจการตั้งค่า Supabase" }, { status: 500 });
  }
}
