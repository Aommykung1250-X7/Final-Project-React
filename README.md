# TutorMatch

เว็บหาติวเตอร์ส่วนตัวแบบ Tinder: นักเรียนปัดขวาติวเตอร์ที่สนใจ ติวเตอร์กดรับคำขอ แล้วคุยกันในแชท

สร้างด้วย Next.js (App Router, JavaScript), Tailwind CSS, framer-motion และ Supabase

## รันในเครื่อง

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

## Deploy ขึ้น Vercel

1. เข้า https://vercel.com แล้วล็อกอินด้วย GitHub
2. กด **Add New > Project** แล้วเลือก repo นี้
3. ไม่ต้องตั้งค่าอะไรเพิ่ม กด **Deploy** (Vercel รู้เองว่าเป็น Next.js)

ตอนต่อ Supabase แล้ว ให้ใส่ `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ใน Settings > Environment Variables ของโปรเจกต์บน Vercel (ดูตัวอย่างใน `.env.example`)

## สถานะตอนนี้

- ปัดการ์ดติวเตอร์ได้ (ลากหรือกดปุ่ม) กรองตามวิชาได้
- หน้ารายละเอียดติวเตอร์ `/posts/[id]` และหน้าที่ถูกใจ `/saved`
- ข้อมูลติวเตอร์ยังเป็นข้อมูลตัวอย่างใน `features/posts/data/tutors.js` และที่ถูกใจเก็บใน localStorage
- หน้าเข้าสู่ระบบ สมัคร และสร้างโปรไฟล์ติวเตอร์ยังเป็นหน้า "เร็ว ๆ นี้"

ขั้นต่อไป: ต่อ Supabase สำหรับล็อกอินและฐานข้อมูล, ฟอร์มโปรไฟล์ติวเตอร์, ระบบคำขอ/แมตช์ และแชท
