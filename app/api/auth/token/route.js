import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createSupabaseJwt } from "@/lib/auth/supabase-jwt";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ token: null }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const token = await createSupabaseJwt(session);
    return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    console.error("Supabase token issuance failed", error?.message || "unknown");
    return NextResponse.json({ error: "ไม่สามารถออก token ให้ Supabase ได้" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
