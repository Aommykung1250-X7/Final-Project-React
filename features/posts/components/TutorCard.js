"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";

const SWIPE_THRESHOLD = 120;

export default function TutorCard({ tutor, onSwipe, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);

  function handleDragEnd(_, info) {
    if (info.offset.x > SWIPE_THRESHOLD) onSwipe("like");
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("pass");
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab overflow-hidden rounded-3xl bg-white shadow-xl active:cursor-grabbing"
      style={{ x, rotate }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: 1 }}
      exit={{ x: x.get() >= 0 ? 400 : -400, opacity: 0, transition: { duration: 0.25 } }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tutor.photo}
        alt={tutor.name}
        draggable={false}
        className="h-full w-full select-none bg-rose-200 object-cover"
      />

      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute left-5 top-6 -rotate-12 rounded-lg border-4 border-green-500 px-3 py-1 text-2xl font-bold text-green-500"
      >
        สนใจ
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute right-5 top-6 rotate-12 rounded-lg border-4 border-rose-500 px-3 py-1 text-2xl font-bold text-rose-500"
      >
        ข้าม
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-5 pt-20 text-white">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold">{tutor.name}</h2>
          <span className="shrink-0 font-semibold">{tutor.pricePerHour} บาท/ชม.</span>
        </div>
        <p className="mt-1 text-sm text-white/90">
          {tutor.subjects.join(" · ")} | {tutor.levels.join(", ")}
        </p>
        <p className="text-sm text-white/80">
          {tutor.mode} · {tutor.province}
        </p>
        <Link
          href={`/posts/${tutor.id}`}
          className="mt-2 inline-block text-sm underline"
          onPointerDown={(e) => e.stopPropagation()}
        >
          ดูโปรไฟล์เต็ม
        </Link>
      </div>
    </motion.div>
  );
}
