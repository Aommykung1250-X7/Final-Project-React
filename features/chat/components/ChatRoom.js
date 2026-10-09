"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getConversation, listMessages, sendMessage, subscribeToMessages } from "@/features/chat/data/chat-service";

function mergeMessages(current, incoming) {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) if (message?.id) byId.set(message.id, message);
  return [...byId.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

export default function ChatRoom({ conversationId, user }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connection, setConnection] = useState("กำลังเชื่อมต่อ");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const reload = useCallback(async () => {
    const [room, history] = await Promise.all([getConversation(conversationId), listMessages(conversationId)]);
    if (!room) throw new Error("ไม่พบบทสนทนาหรือคุณไม่มีสิทธิ์เข้าถึง");
    setConversation(room);
    setMessages((current) => mergeMessages(current, history));
    setError("");
  }, [conversationId]);

  useEffect(() => {
    let alive = true;
    reload().catch((loadError) => { if (alive) setError(loadError.message || "เปิดห้องแชตไม่สำเร็จ"); })
      .finally(() => { if (alive) setLoading(false); });
    const unsubscribe = subscribeToMessages(conversationId, (message) => {
      if (alive) setMessages((current) => mergeMessages(current, [message]));
    }, (status) => {
      if (!alive) return;
      if (status === "SUBSCRIBED") { setConnection("เชื่อมต่อแล้ว"); reload().catch(() => {}); }
      else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) setConnection("กำลังเชื่อมต่อใหม่");
    });
    return () => { alive = false; unsubscribe(); };
  }, [conversationId, reload]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function submit(event) {
    event.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const message = await sendMessage(conversationId, user.id, draft);
      setMessages((current) => mergeMessages(current, [message]));
      setDraft("");
    } catch (sendError) { setError(sendError.message || "ส่งข้อความไม่สำเร็จ กรุณาลองอีกครั้ง"); }
    finally { setSending(false); }
  }

  if (loading) return <p className="py-10 text-center text-gray-500">กำลังเปิดห้องแชต…</p>;
  if (error && !conversation) return <div className="rounded-2xl bg-white p-6"><p role="alert" className="text-rose-700">{error}</p><Link href="/chat" className="mt-3 inline-block text-rose-500 underline">กลับไปรายการแชต</Link></div>;

  return <section className="mx-auto flex h-[min(75vh,760px)] max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
    <header className="flex items-center justify-between border-b border-rose-100 px-4 py-3">
      <div><Link href="/chat" className="mr-2 text-rose-500">‹</Link><strong>แชต TutorMatch</strong></div>
      <span className="text-xs text-gray-500">{connection}</span>
    </header>
    <div className="flex-1 space-y-3 overflow-y-auto bg-rose-50/60 p-4">
      {messages.length === 0 && <p className="py-8 text-center text-sm text-gray-500">เริ่มคุยเรื่องวิชา เวลาเรียน และราคาได้เลย</p>}
      {messages.map((message) => <div key={message.id} className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[82%] rounded-2xl px-4 py-2 ${message.sender_id === user.id ? "rounded-br-sm bg-rose-500 text-white" : "rounded-bl-sm bg-white text-gray-800 shadow-sm"}`}>
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
          <time className={`mt-1 block text-right text-[10px] ${message.sender_id === user.id ? "text-white/70" : "text-gray-400"}`}>{new Date(message.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</time>
        </div>
      </div>)}
      <div ref={bottomRef} />
    </div>
    {error && <p role="alert" className="px-4 pt-2 text-sm text-rose-700">{error}</p>}
    <form onSubmit={submit} className="flex gap-2 border-t border-rose-100 p-3">
      <label htmlFor="message" className="sr-only">ข้อความ</label>
      <textarea id="message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} rows={2} placeholder="พิมพ์ข้อความ…" className="min-w-0 flex-1 resize-none rounded-2xl border border-rose-200 px-4 py-3 outline-none focus:border-rose-400" />
      <button disabled={sending || !draft.trim()} className="self-end rounded-full bg-rose-500 px-5 py-3 font-semibold text-white disabled:opacity-50">{sending ? "ส่ง…" : "ส่ง"}</button>
    </form>
  </section>;
}
