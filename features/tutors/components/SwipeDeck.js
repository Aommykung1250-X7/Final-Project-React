"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import TutorCard from "./TutorCard";
import { useSaved } from "@/features/requests/context/SavedContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SwipeDeck({ initialTutors, initialError }) {
  const { likedIds, passedIds, like, pass, reset } = useSaved();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [province, setProvince] = useState("");
  const [tutors, setTutors] = useState(initialTutors);
  const [error, setError] = useState(initialError);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setTutors(initialTutors);
    setError(initialError);
  }, [initialTutors, initialError]);

  const allSubjects = useMemo(() => [...new Set(tutors.flatMap((t) => t.subjects))], [tutors]);
  const allProvinces = useMemo(
    () => [...new Set(tutors.map((t) => t.province).filter(Boolean))].sort((a, b) => a.localeCompare(b, "th")),
    [tutors]
  );
  const deck = tutors.filter(
    (t) =>
      !likedIds.includes(t.id) &&
      !passedIds.includes(t.id) &&
      (!subject || t.subjects.includes(subject)) &&
      (!province || t.province === province)
  );
  const top = deck[0];

  async function handleSwipe(direction) {
    if (!top) return;
    setActionError("");
    // Guests can look around, but sending a request needs a student account.
    if (direction === "like" && !user) { router.push("/login?next=/"); return; }
    if (direction === "like") {
      try { await like(top.id); } catch (err) { console.error("like failed", err); setActionError(`บันทึกการถูกใจไม่สำเร็จ กรุณาลองอีกครั้ง (${err?.code || ""} ${err?.message || ""})`); }
    }
    else pass(top.id);
  }

  if (authLoading && tutors.length === 0 && !error) return <p className="py-16 text-center text-gray-500">กำลังโหลดติวเตอร์…</p>;
  if (user && user.role !== "student") return <div className="rounded-3xl bg-white p-6 text-center sm:p-8"><h1 className="text-xl font-bold">พื้นที่ค้นหาสำหรับนักเรียน</h1><p className="mt-2 text-gray-500">แก้ไขโปรไฟล์ติวเตอร์ได้ที่ <Link className="text-rose-500 underline" href="/profile">หน้าโปรไฟล์</Link></p></div>;
  if (error) return <p role="alert" className="rounded-2xl bg-white p-6 text-center text-rose-700">{error}</p>;

  return (
    <div className="flex flex-col items-center gap-5">
      {!user && !authLoading && (
        <p className="w-full max-w-sm rounded-2xl bg-white px-4 py-3 text-center text-sm text-gray-600 shadow-sm">
          ดูติวเตอร์ได้เลย ถ้าเจอคนที่ใช่ <Link href="/login?next=/" className="font-semibold text-rose-500 underline">เข้าสู่ระบบ</Link> หรือ <Link href="/register" className="font-semibold text-rose-500 underline">สมัคร</Link> เพื่อส่งคำขอ
        </p>
      )}
      <div className="grid w-full max-w-sm grid-cols-2 gap-2">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          aria-label="กรองตามวิชา"
          className="w-full rounded-full border border-rose-200 bg-white px-4 py-2 text-sm"
        >
          <option value="">ทุกวิชา</option>
          {allSubjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          aria-label="กรองตามจังหวัด"
          className="w-full rounded-full border border-rose-200 bg-white px-4 py-2 text-sm"
        >
          <option value="">ทุกจังหวัด</option>
          {allProvinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="relative h-[520px] w-full max-w-sm">
        <AnimatePresence>
          {deck
            .slice(0, 2)
            .reverse()
            .map((t) => (
              <TutorCard key={t.id} tutor={t} isTop={t.id === top?.id && !authLoading && (!user || user.role === "student")} onSwipe={handleSwipe} />
            ))}
        </AnimatePresence>

        {!top && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-rose-200 text-center text-gray-500">
            <p>{tutors.length ? "ดูติวเตอร์ครบแล้ว" : "ยังไม่มีติวเตอร์ที่เปิดรับ"}</p>
            <button onClick={reset} className="rounded-full bg-rose-500 px-4 py-2 text-white">
              ดูคนที่ข้ามอีกครั้ง
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        <button
          onClick={() => handleSwipe("pass")}
          disabled={!top || authLoading}
          aria-label="ข้าม"
          className="h-16 w-16 rounded-full bg-white text-3xl text-rose-500 shadow-lg disabled:opacity-40"
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe("like")}
          disabled={!top || authLoading}
          aria-label="สนใจ"
          className="h-16 w-16 rounded-full bg-white text-3xl text-green-500 shadow-lg disabled:opacity-40"
        >
          ♥
        </button>
      </div>
      {actionError && <p role="alert" className="text-sm text-rose-700">{actionError}</p>}
    </div>
  );
}
