"use client";

import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { useEffect, useState } from "react";
import { listConversations } from "@/features/chat/data/chat-service";

export default function ChatInbox({ user }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    listConversations(user).then((items) => { if (alive) setConversations(items); })
      .catch(() => { if (alive) setError("โหลดรายการแชตไม่สำเร็จ"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user]);
  if (loading) return <p className="py-10 text-center text-gray-500">กำลังโหลดแชต…</p>;
  if (error) return <p role="alert" className="rounded-2xl bg-white p-5 text-rose-700">{error}</p>;
  return <div>
    <h1 className="mb-4 text-2xl font-bold">แชตของฉัน</h1>
    {!conversations.length ? <div className="rounded-2xl bg-white p-6 text-gray-600">ยังไม่มีบทสนทนา {user.role === "student" && <Link href="/saved" className="text-rose-600 underline">เลือกติวเตอร์ที่ถูกใจแล้วทักแชต</Link>}</div> :
      <ul className="space-y-3">{conversations.map((conversation) => <li key={conversation.id}>
        <Link href={`/chat/${conversation.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm hover:shadow">
          <Avatar src={conversation.other?.avatar_url} name={conversation.other?.display_name} />
          <span className="min-w-0 flex-1"><strong className="block">{conversation.other?.display_name || "สมาชิก TutorMatch"}</strong>
            <span className="block truncate text-sm text-gray-500">{conversation.latestMessage?.body || "เริ่มคุยเรื่องเวลาและราคาเรียนได้เลย"}</span></span>
          <time className="text-xs text-gray-400">{new Date(conversation.latestMessage?.created_at || conversation.created_at).toLocaleDateString("th-TH")}</time>
        </Link>
      </li>)}</ul>}
  </div>;
}
