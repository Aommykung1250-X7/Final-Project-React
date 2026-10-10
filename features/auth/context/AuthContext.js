"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { clearCachedSupabaseToken } from "@/lib/supabase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json();
      setUser(data.user ?? null);
      return data.user ?? null;
    } catch {
      setUser(null);
      return null;
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { refreshUser(); }, [refreshUser]);

  // Tabs in one browser share the session cookie. If another tab logged in as someone else,
  // reload this tab when it regains focus so it never acts with the wrong account.
  const userIdRef = useRef(undefined);
  useEffect(() => { if (!loading) userIdRef.current = user?.id ?? null; }, [user, loading]);
  useEffect(() => {
    async function checkAccount() {
      if (document.visibilityState !== "visible" || userIdRef.current === undefined) return;
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();
        if ((data.user?.id ?? null) !== userIdRef.current) window.location.reload();
      } catch {}
    }
    window.addEventListener("focus", checkAccount);
    document.addEventListener("visibilitychange", checkAccount);
    return () => {
      window.removeEventListener("focus", checkAccount);
      document.removeEventListener("visibilitychange", checkAccount);
    };
  }, []);
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      clearCachedSupabaseToken();
      setUser(null);
    }
  }, []);
  return <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
