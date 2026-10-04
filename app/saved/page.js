"use client";

import Link from "next/link";
import { tutors } from "@/features/posts/data/tutors";
import { useSaved } from "@/features/saved/context/SavedContext";

export default function SavedPage() {
  const { likedIds, unlike } = useSaved();
  const liked = tutors.filter((t) => likedIds.includes(t.id));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">ติวเตอร์ที่ถูกใจ</h1>
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
                <Link href={`/posts/${t.id}`} className="font-semibold hover:underline">
                  {t.name}
                </Link>
                <p className="text-sm text-gray-500">
                  {t.subjects.join(", ")} · {t.pricePerHour} บาท/ชม.
                </p>
                <p className="text-xs text-amber-600">รอติวเตอร์ตอบรับ</p>
              </div>
              <button onClick={() => unlike(t.id)} className="text-sm text-gray-400 hover:text-rose-500">
                ลบ
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
