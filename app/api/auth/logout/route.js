import { NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  try {
    await revokeCurrentSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Logout request failed", error?.message || "unknown");
    return NextResponse.json({ error: "ออกจากระบบไม่สำเร็จ" }, { status: 500 });
  }
}
