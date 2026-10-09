"use client";

import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { listRequests, respondToRequest } from "@/features/requests/data/request-service";
import { startConversation } from "@/features/chat/data/chat-service";

const STATUS_LABEL = { pending: "รอตอบรับ", accepted: "รับแล้ว", declined: "ปฏิเสธแล้ว" };

export default function RequestList() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setRequests(await listRequests()); setError(""); }
    catch { setError("โหลดคำขอไม่สำเร็จ ตรวจว่ารัน SQL migration ล่าสุดแล้ว"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== "tutor") { setLoading(false); return; }
    load();
  }, [authLoading, user?.role, load]);

  async function respond(studentId, accept) {
    setBusy(studentId);
    setError("");
    try {
      const conversationId = await respondToRequest(studentId, user.id, accept);
      if (conversationId) router.push(`/chat/${conversationId}`);
      else await load();
    } catch {
      setError("ตอบคำขอไม่สำเร็จ กรุณาลองอีกครั้ง");
      await load();
    } finally { setBusy(""); }
  }

  async function openChat(studentId) {
    setBusy(studentId);
    try { router.push(`/chat/${await startConversation(user.id, studentId)}`); }
    catch { setError("เปิดแชตไม่สำเร็จ"); }
    finally { setBusy(""); }
  }

  if (authLoading || loading) return <p className="py-10 text-center text-gray-500">กำลังโหลดคำขอ…</p>;
  if (!user) return <p className="rounded-2xl bg-white p-6">กรุณา<Link href="/login" className="text-rose-500 underline">เข้าสู่ระบบ</Link>ก่อน</p>;
  if (user.role !== "tutor") return <p className="rounded-2xl bg-white p-6">หน้านี้สำหรับบัญชีติวเตอร์</p>;

  const pending = requests.filter((r) => r.status === "pending");
  const answered = requests.filter((r) => r.status !== "pending");

  function Row({ request }) {
    const name = request.student?.display_name || "นักเรียน";
    return (
      <li className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
        <Avatar src={request.student?.avatar_url} name={name} alt={name} className="h-14 w-14" />
        <div className="flex-1">
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-gray-500">{new Date(request.created_at).toLocaleString("th-TH")} · {STATUS_LABEL[request.status]}</p>
        </div>
        {request.status === "pending" && (
          <div className="flex gap-2">
            <button onClick={() => respond(request.student_id, false)} disabled={busy === request.student_id} className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-50">ปฏิเสธ</button>
            <button onClick={() => respond(request.student_id, true)} disabled={busy === request.student_id} className="rounded-full bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">รับ</button>
          </div>
        )}
        {request.status === "accepted" && (
          <button onClick={() => openChat(request.student_id)} disabled={busy === request.student_id} className="text-sm font-semibold text-rose-600 underline disabled:opacity-50">แชต</button>
        )}
      </li>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">คำขอจากนักเรียน</h1>
        <p className="mt-1 text-sm text-gray-500">นักเรียนที่ปัดขวาโปรไฟล์คุณ กดรับเพื่อเริ่มแชตกัน</p>
      </div>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      <section>
        <h2 className="mb-2 font-semibold">รอตอบรับ ({pending.length})</h2>
        {pending.length ? <ul className="space-y-3">{pending.map((r) => <Row key={r.student_id} request={r} />)}</ul> : <p className="text-sm text-gray-500">ยังไม่มีคำขอใหม่</p>}
      </section>
      {answered.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">ตอบแล้ว</h2>
          <ul className="space-y-3">{answered.map((r) => <Row key={r.student_id} request={r} />)}</ul>
        </section>
      )}
    </div>
  );
}
