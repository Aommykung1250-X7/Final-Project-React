"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import TutorCard from "./TutorCard";
import { tutors } from "../data/tutors";
import { useSaved } from "@/features/saved/context/SavedContext";

const allSubjects = [...new Set(tutors.flatMap((t) => t.subjects))];

export default function SwipeDeck() {
  const { likedIds, passedIds, like, pass, reset } = useSaved();
  const [subject, setSubject] = useState("");

  const deck = tutors.filter(
    (t) =>
      !likedIds.includes(t.id) &&
      !passedIds.includes(t.id) &&
      (!subject || t.subjects.includes(subject))
  );
  const top = deck[0];

  function handleSwipe(direction) {
    if (!top) return;
    if (direction === "like") like(top.id);
    else pass(top.id);
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full max-w-sm rounded-full border border-rose-200 bg-white px-4 py-2 text-sm"
      >
        <option value="">ทุกวิชา</option>
        {allSubjects.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="relative h-[520px] w-full max-w-sm">
        <AnimatePresence>
          {deck
            .slice(0, 2)
            .reverse()
            .map((t) => (
              <TutorCard key={t.id} tutor={t} isTop={t.id === top?.id} onSwipe={handleSwipe} />
            ))}
        </AnimatePresence>

        {!top && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-rose-200 text-center text-gray-500">
            <p>ดูติวเตอร์ครบแล้ว</p>
            <button onClick={reset} className="rounded-full bg-rose-500 px-4 py-2 text-white">
              เริ่มใหม่
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        <button
          onClick={() => handleSwipe("pass")}
          disabled={!top}
          aria-label="ข้าม"
          className="h-16 w-16 rounded-full bg-white text-3xl text-rose-500 shadow-lg disabled:opacity-40"
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe("like")}
          disabled={!top}
          aria-label="สนใจ"
          className="h-16 w-16 rounded-full bg-white text-3xl text-green-500 shadow-lg disabled:opacity-40"
        >
          ♥
        </button>
      </div>
    </div>
  );
}
