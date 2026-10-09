"use client";

import Link from "next/link";
import { useSaved } from "@/features/requests/context/SavedContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { listLikedTutors } from "@/features/tutors/data/tutor-service";
import { startConversation } from "@/features/chat/data/chat-service";

export default function SavedList() {
  const { likedIds, unlike, loading: likesLoading, error: likesError } = useSaved();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState([]);
  const [chatting, setChatting] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "student") return;
    listLikedTutors().then(setLiked).catch(() => setError("โหลดรายการที่ถูกใจไม่สำเร็จ"));
  }, [user, likedIds]);

  async function openChat(tutorId) {
    setChatting(tutorId);
    setError("");
    try { router.push(`/chat/${await startConversation(tutorId, user.id)}`); }
    catch { setError("เปิดแชตไม่สำเร็จ ลองอีกครั้ง"); }
    finally { setChatting(""); }
  }

  if (authLoading || likesLoading) return <p className="py-10 text-center text-gray-500">กำลังโหลดรายการ…</p>;
  if (!user) return <p className="rounded-2xl bg-white p-6">กรุณา<Link href="/login" className="text-rose-500 underline">เข้าสู่ระบบ</Link>ก่อนดูรายการที่ถูกใจ</p>;
  if (user.role !== "student") return <p className="rounded-2xl bg-white p-6">รายการที่ถูกใจสำหรับนักเรียนเท่านั้น</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">ติวเตอร์ที่ถูกใจ</h1>
      {(error || likesError) && <p role="alert" className="mb-3 text-sm text-rose-700">{error || likesError}</p>}
      {liked.length === 0 ? (
        <p className="text-gray-500">
          ยังไม่มี ลอง<Link href="/" className="text-rose-500 underline">ปัดขวา</Link>ติวเตอร์ที่สนใจดู
        </p>
      ) : (
        <ul className="space-y-3">
          {liked.map((t) => (
            <li key={t.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.photo} alt={t.name} className="h-16 w-16 rounded-full object-cover" />
              <div className="flex-1">
                <Link href={`/tutors/${t.id}`} className="font-semibold hover:underline">
                  {t.name}
                </Link>
                <p className="text-sm text-gray-500">
                  {t.subjects.join(", ")} · {t.pricePerHour} บาท/ชม.
                </p>
                {t.requestStatus === "accepted" ? (
                  <button onClick={() => openChat(t.id)} disabled={chatting === t.id} className="mt-1 text-sm font-semibold text-rose-600 underline disabled:opacity-50">
                    {chatting === t.id ? "กำลังเปิดแชต…" : "ติวเตอร์รับแล้ว ทักแชตเพื่อตกลงราคา"}
                  </button>
                ) : t.requestStatus === "declined" ? (
                  <p className="mt-1 text-sm text-gray-400">ติวเตอร์ไม่สะดวกรับ</p>
                ) : (
                  <p className="mt-1 text-sm text-amber-600">รอติวเตอร์ตอบรับคำขอ</p>
                )}
              </div>
              {t.requestStatus === "pending" && (
                <button
                  onClick={async () => {
                    if (!window.confirm(`ยกเลิกคำขอถึง ${t.name}?`)) return;
                    try { await unlike(t.id); } catch { setError("ยกเลิกคำขอไม่สำเร็จ"); }
                  }}
                  className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:border-rose-300 hover:text-rose-500"
                >
                  ยกเลิกคำขอ
                </button>
              )}
              {t.requestStatus === "accepted" && (
                <button onClick={async () => { if (!window.confirm(`ลบ ${t.name} ออกจากรายการ? ห้องแชตเดิมยังอยู่`)) return; try { await unlike(t.id); } catch { setError("ลบรายการไม่สำเร็จ"); } }} className="shrink-0 text-sm text-gray-400 hover:text-rose-500">
                  ลบ
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
