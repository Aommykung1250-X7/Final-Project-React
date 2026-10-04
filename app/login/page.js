import Link from "next/link";
import ComingSoon from "@/components/layout/ComingSoon";

export default function LoginPage() {
  return (
    <ComingSoon title="เข้าสู่ระบบ">
      กำลังเชื่อมกับ Supabase เร็ว ๆ นี้ ยังไม่มีบัญชี?{" "}
      <Link href="/register" className="text-rose-500 underline">
        สมัครสมาชิก
      </Link>
    </ComingSoon>
  );
}
