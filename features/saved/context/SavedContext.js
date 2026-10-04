"use client";

import { createContext, useContext, useEffect, useState } from "react";

const SavedContext = createContext(null);
const STORAGE_KEY = "tutor-match:liked";

// เก็บติวเตอร์ที่ปัดขวาไว้ใน localStorage ไปก่อน ภายหลังย้ายไปตาราง swipes ใน Supabase
export function SavedProvider({ children }) {
  const [likedIds, setLikedIds] = useState([]);
  const [passedIds, setPassedIds] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setLikedIds(saved);
    } catch {}
  }, []);

  function persist(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  }

  function like(id) {
    setLikedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      persist(next);
      return next;
    });
  }

  function pass(id) {
    setPassedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function unlike(id) {
    setLikedIds((prev) => {
      const next = prev.filter((x) => x !== id);
      persist(next);
      return next;
    });
  }

  function reset() {
    setPassedIds([]);
    setLikedIds([]);
    persist([]);
  }

  return (
    <SavedContext.Provider value={{ likedIds, passedIds, like, pass, unlike, reset }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
