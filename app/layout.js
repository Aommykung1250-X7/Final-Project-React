import "./globals.css";
import Providers from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "TutorMatch - ปัดหาติวเตอร์ที่ใช่",
  description: "เว็บหาติวเตอร์ส่วนตัวแบบปัดการ์ด",
  // Files in public/ are served from the site root, so /favicon.svg is public/favicon.svg.
  icons: { icon: "/favicon.svg" },
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
