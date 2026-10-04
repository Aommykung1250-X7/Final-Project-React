"use client";

import { SavedProvider } from "@/features/saved/context/SavedContext";

export default function Providers({ children }) {
  return <SavedProvider>{children}</SavedProvider>;
}
