"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useSaved } from "@/features/saved/context/SavedContext";
import { getTutorById } from "@/features/posts/data/tutor-service";
import { startConversation } from "@/features/chat/data/chat-service";

export default function TutorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { likedIds } = useSaved();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingChat, setOpeningChat] = useState(false);
  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== "student") { setLoading(false); return; }
    let alive = true;
    getTutorById(id).then((value) => { if (alive) setTutor(value); })
      .catch(() => { if (alive) setError("โหลดโปรไฟล์ไม่สำเร็จ"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id, user?.role, authLoading]);

  async function contactTutor() {
    setOpeningChat(true);
    try { router.push(`/chat/${await startConversation(tutor.id, user.id)}`); }
    catch { setError("เริ่มแชตไม่ได้ กรุณากดถูกใจติวเตอร์ก่อน"); }
    finally { setOpeningChat(false); }
  }

  if (authLoading || loading) return <p className="py-10 text-center text-gray-500">กำลังโหลดโปรไฟล์…</p>;
  if (!user) return <div className="rounded-2xl bg-white p-6">กรุณา<Link href="/login" className="text-rose-500 underline">เข้าสู่ระบบในฐานะนักเรียน</Link>เพื่อดูโปรไฟล์</div>;
  if (user.role !== "student") return <p className="rounded-2xl bg-white p-6">โปรไฟล์ติวเตอร์จะแสดงให้นักเรียนที่เข้าสู่ระบบ</p>;
  if (error && !tutor) return <p role="alert" className="rounded-2xl bg-white p-6 text-rose-700">{error}</p>;
  if (!tutor) return <div className="rounded-2xl bg-white p-6">ไม่พบโปรไฟล์ติวเตอร์ <Link href="/" className="text-rose-500 underline">กลับหน้าค้นหา</Link></div>;
  return <article className="mx-auto max-w-md overflow-hidden rounded-3xl bg-white shadow">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={tutor.photo} alt={tutor.name} className="aspect-square w-full object-cover" />
    <div className="space-y-3 p-6">
      <div className="flex items-baseline justify-between"><h1 className="text-2xl font-bold">{tutor.name}</h1><span className="font-semibold text-rose-500">{tutor.pricePerHour} บาท/ชม.</span></div>
      <p>{tutor.bio}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-gray-500">วิชา</dt><dd>{tutor.subjects.join(", ")}</dd>
        <dt className="text-gray-500">ระดับชั้น</dt><dd>{tutor.levels.join(", ")}</dd>
        <dt className="text-gray-500">รูปแบบ</dt><dd>{tutor.mode}</dd>
        <dt className="text-gray-500">พื้นที่</dt><dd>{tutor.province}</dd>
      </dl>
      {likedIds.includes(tutor.id) && <button onClick={contactTutor} disabled={openingChat} className="w-full rounded-full bg-rose-500 px-5 py-3 font-semibold text-white disabled:opacity-50">{openingChat ? "กำลังเปิดแชต…" : "ทักแชตเพื่อตกลงราคา"}</button>}
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      <Link href="/" className="inline-block text-sm text-rose-500 underline">กลับไปปัดต่อ</Link>
    </div>
  </article>;
}
