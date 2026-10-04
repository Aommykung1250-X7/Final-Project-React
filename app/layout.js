import "./globals.css";
import Providers from "@/providers/Providers";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "TutorMatch - ปัดหาติวเตอร์ที่ใช่",
  description: "เว็บหาติวเตอร์ส่วนตัวแบบปัดการ์ด",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
