"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "@/features/saved/context/SavedContext";

const links = [
  { href: "/", label: "ค้นหา" },
  { href: "/saved", label: "ถูกใจ" },
  { href: "/post", label: "ติวเตอร์" },
  { href: "/login", label: "เข้าระบบ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { likedIds } = useSaved();

  return (
    <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="shrink-0 text-lg font-bold text-rose-500">
          TutorMatch
        </Link>
        <ul className="flex gap-0.5 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`whitespace-nowrap rounded-full px-2.5 py-1.5 ${
                  pathname === l.href ? "bg-rose-500 text-white" : "text-gray-600 hover:bg-rose-50"
                }`}
              >
                {l.label}
                {l.href === "/saved" && likedIds.length > 0 && ` (${likedIds.length})`}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
