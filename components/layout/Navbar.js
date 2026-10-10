"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "@/features/requests/context/SavedContext";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { likedIds } = useSaved();
  const { user, loading, logout } = useAuth();
  const links = user?.role === "tutor"
    ? [{ href: "/requests", label: "คำขอ" }, { href: "/profile", label: "โปรไฟล์" }, { href: "/chat", label: "แชต" }]
    : user?.role === "student"
      ? [{ href: "/", label: "ค้นหา" }, { href: "/saved", label: "ถูกใจ" }, { href: "/chat", label: "แชต" }]
      : [{ href: "/", label: "ค้นหา" }, { href: "/login", label: "เข้าสู่ระบบ" }, { href: "/register", label: "สมัคร" }];
  const displayName = user?.displayName?.trim() || "โปรไฟล์ของฉัน";

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Tutors see how many requests are waiting. Re-checked on page change, focus, and every 15s.
  const [pendingCount, setPendingCount] = useState(0);
  useEffect(() => {
    if (user?.role !== "tutor") { setPendingCount(0); return; }
    let alive = true;
    async function loadCount() {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      const { count, error } = await supabase.from("likes")
        .select("student_id", { count: "exact", head: true }).eq("status", "pending");
      if (alive && !error) setPendingCount(count || 0);
    }
    loadCount();
    const timer = setInterval(loadCount, 15000);
    window.addEventListener("focus", loadCount);
    return () => { alive = false; clearInterval(timer); window.removeEventListener("focus", loadCount); };
  }, [user?.role, pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/90 backdrop-blur">
      <nav className="relative mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold text-rose-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={28} height={28} />
          TutorMatch
        </Link>
        <div className="ml-auto flex items-center gap-1.5 sm:hidden">
          {user && <div role="group" aria-label={`โปรไฟล์ ${displayName}`} className="flex min-w-0 max-w-[42vw] items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50/70 py-1 pl-1 pr-2">
            <Avatar src={user.avatarUrl} name={displayName} alt={`โปรไฟล์ ${displayName}`} className="h-8 w-8 text-xs" />
            <span title={displayName} className="max-w-[64px] truncate text-xs font-semibold text-gray-700">{displayName}</span>
          </div>}
          <button
            type="button"
            className="rounded-lg p-2 text-gray-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            aria-label={menuOpen ? "ปิดเมนูนำทาง" : "เปิดเมนูนำทาง"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" className="text-xl leading-none">{menuOpen ? "×" : "☰"}</span>
          </button>
        </div>
        <ul
          id="primary-navigation"
          className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full z-30 flex-col gap-1 border-b border-rose-100 bg-white px-4 py-3 text-sm shadow-sm sm:static sm:flex sm:flex-row sm:items-center sm:gap-0.5 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`block whitespace-nowrap rounded-full px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 sm:px-2.5 sm:py-1.5 ${
                  pathname === l.href ? "bg-rose-500 text-white" : "text-gray-600 hover:bg-rose-50"
                }`}
              >
                {l.label}
                {l.href === "/saved" && likedIds.length > 0 && ` (${likedIds.length})`}
                {l.href === "/requests" && pendingCount > 0 && (
                  <span aria-label={`${pendingCount} คำขอใหม่`} className={`ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${pathname === l.href ? "bg-white text-rose-500" : "bg-rose-500 text-white"}`}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
          {user && <li className="hidden sm:block">
            <div role="group" aria-label={`โปรไฟล์ ${displayName}`} className="flex max-w-44 items-center gap-2 rounded-full border border-rose-100 bg-rose-50/70 py-1 pl-1 pr-3">
              <Avatar src={user.avatarUrl} name={displayName} alt={`โปรไฟล์ ${displayName}`} className="h-8 w-8 text-xs" />
              <span title={displayName} className="max-w-28 truncate text-sm font-semibold text-gray-700">{displayName}</span>
            </div>
          </li>}
          {user && <li><button onClick={async () => { await logout(); router.replace("/"); }} className="w-full whitespace-nowrap rounded-full px-3 py-2 text-left text-gray-500 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 sm:w-auto sm:px-2.5 sm:py-1.5">ออก</button></li>}
          {!user && loading && <li className="px-2 text-xs text-gray-400">…</li>}
        </ul>
      </nav>
    </header>
  );
}
