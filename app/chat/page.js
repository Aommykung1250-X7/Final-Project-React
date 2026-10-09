"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/context/AuthContext";
import ChatInbox from "@/features/chat/components/ChatInbox";

export default function ChatPage() {
  const { user, loading } = useAuth();
  if (loading) return <p className="py-10 text-center text-gray-500">กำลังโหลด…</p>;
  if (!user) return <p className="rounded-2xl bg-white p-6">กรุณา<Link href="/login" className="text-rose-500 underline">เข้าสู่ระบบ</Link>เพื่อดูแชต</p>;
  return <ChatInbox user={user} />;
}
