"use client";

import { createClient } from "@supabase/supabase-js";

let supabase;
let cachedAccessToken = null;
let accessTokenExpiresAt = 0;
let pendingAccessTokenRequest = null;
let accessTokenGeneration = 0;

function readTokenExpiry(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(base64));
    return Number(claims.exp) * 1000;
  } catch {
    return 0;
  }
}

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < accessTokenExpiresAt - 30_000) return cachedAccessToken;
  if (pendingAccessTokenRequest) return pendingAccessTokenRequest;

  const generation = accessTokenGeneration;
  pendingAccessTokenRequest = (async () => {
    try {
      const response = await fetch("/api/auth/token", { cache: "no-store" });
      if (generation !== accessTokenGeneration) return null;
      if (!response.ok) {
        clearCachedSupabaseToken();
        return null;
      }
      const { token } = await response.json();
      if (!token) {
        clearCachedSupabaseToken();
        return null;
      }
      const expiresAt = readTokenExpiry(token);
      if (generation === accessTokenGeneration && expiresAt > Date.now()) {
        cachedAccessToken = token;
        accessTokenExpiresAt = expiresAt;
      }
      return generation === accessTokenGeneration ? token : null;
    } catch {
      return null;
    } finally {
      if (generation === accessTokenGeneration) pendingAccessTokenRequest = null;
    }
  })();

  return pendingAccessTokenRequest;
}

export function clearCachedSupabaseToken() {
  accessTokenGeneration += 1;
  cachedAccessToken = null;
  accessTokenExpiresAt = 0;
  pendingAccessTokenRequest = null;
}

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  supabase ??= createClient(url, publishableKey, {
    accessToken: getAccessToken,
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return supabase;
}
