"use client";

import { SavedProvider } from "@/features/saved/context/SavedContext";
import { AuthProvider } from "@/features/auth/context/AuthContext";

export default function Providers({ children }) {
  return <AuthProvider><SavedProvider>{children}</SavedProvider></AuthProvider>;
}
