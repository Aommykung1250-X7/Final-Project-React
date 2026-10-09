import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const SESSION_COOKIE = "tutormatch_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const digest = (value) => createHash("sha256").update(value).digest("hex");

export async function createSession(accountId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const { error } = await getAdminSupabase().from("sessions").insert({
    account_id: accountId,
    token_hash: digest(token),
    expires_at: expiresAt,
  });
  if (error) throw error;
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const { data: session, error } = await getAdminSupabase()
    .from("sessions")
    .select("id, account_id, expires_at, revoked_at")
    .eq("token_hash", digest(token))
    .maybeSingle();
  if (error || !session || session.revoked_at || Date.parse(session.expires_at) <= Date.now()) return null;
  const { data: account, error: accountError } = await getAdminSupabase()
    .from("accounts")
    .select("id, role")
    .eq("id", session.account_id)
    .maybeSingle();
  if (accountError || !account) return null;
  return { id: session.id, userId: account.id, role: account.role };
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token && /^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    const { error } = await getAdminSupabase().from("sessions").update({ revoked_at: new Date().toISOString() })
      .eq("token_hash", digest(token)).is("revoked_at", null);
    cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(0) });
    if (error) throw error;
    return;
  }
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(0) });
}
