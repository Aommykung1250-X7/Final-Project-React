import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ user: null });
    const { data: profile, error } = await getAdminSupabase().from("profiles")
      .select("display_name, avatar_url").eq("user_id", session.userId).single();
    if (error) throw error;
    return NextResponse.json({ user: { id: session.userId, role: session.role, displayName: profile.display_name, avatarUrl: profile.avatar_url } });
  } catch (error) {
    console.error("Session lookup failed", error?.message || "unknown");
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
