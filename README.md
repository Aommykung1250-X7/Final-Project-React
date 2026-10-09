# TutorMatch

เว็บจับคู่ติวเตอร์กับนักเรียน นักเรียนค้นหาและกดถูกใจติวเตอร์ จากนั้นเริ่มคุยและตกลงราคาในแชตของเว็บได้ ติวเตอร์จัดการโปรไฟล์และตอบแชตได้

แอปใช้ Next.js, Supabase Database/Realtime และระบบบัญชีที่จัดการเอง รหัสผ่านแฮชด้วย Argon2id ส่วน Supabase Auth ไม่ได้ใช้

## ตั้งค่าเครื่อง

1. คัดลอก `.env.example` เป็น `.env.local`
2. ใส่ Project URL, publishable key และ secret key จาก Supabase Dashboard
3. ใส่ private JWK และ `kid` ของ ES256 signing key ที่ตรงกับ key ซึ่งเพิ่มไว้ใน Supabase
4. ใช้คำสั่ง `npm install` แล้ว `npm run dev`

`NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ใช้ในเบราว์เซอร์ได้ ส่วน `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_PRIVATE_JWK` และ `SUPABASE_JWT_KID` ใช้ฝั่งเซิร์ฟเวอร์เท่านั้น ห้ามตั้งชื่อขึ้นต้นด้วย `NEXT_PUBLIC_` และห้าม commit `.env.local`

แอปเซ็น JWT สำหรับ Supabase อายุ 5 นาทีด้วย ES256 โดย token มี `sub`, `role: authenticated` และ `app_role: student|tutor` หากยังไม่ได้เพิ่ม signing key ที่ตรงกันในโปรเจกต์ การสมัคร/อ่านข้อมูลที่ต้องใช้ Supabase จะยังทำงานไม่ได้

## ตั้งค่าฐานข้อมูลและ Realtime

ไม่ต้องติดตั้ง Supabase CLI: เปิด Supabase Dashboard > SQL Editor แล้วรันไฟล์ migration ตามลำดับนี้ โดยคัดลอกเนื้อหาไฟล์ทั้งหมดทีละไฟล์:

1. `supabase/migrations/20261009000100_auth_and_profiles.sql`
2. `supabase/migrations/20261009000200_tutor_discovery_and_likes.sql`
3. `supabase/migrations/20261009000300_conversations_and_messages.sql`

จากนั้นเปิด Database > Replication/Realtime settings แล้วปิด **Allow public access to channels** เพื่อบังคับ private-channel authorization ตาม RLS ใน migration แชตส่งข้อความเข้า `public.messages` ก่อน แล้ว trigger จะกระจายข้อความที่บันทึกแล้วผ่าน Supabase Realtime Broadcast ทาง WebSocket

สำหรับ signing key ให้นำ private JWK จาก `.env.local` เข้าเมนู JWT Signing Keys ของ Supabase เพื่อสร้าง standby key (Supabase ใช้ JWK นี้บันทึก private/public key คู่กัน) แล้วให้ `kid` ตรงกับค่าใน JWK ก่อนเปิดใช้แอป การเซ็น token จะเริ่มผ่านเมื่อ key นี้เป็น current แล้ว จึงค่อย Rotate หลังตั้ง private key ฝั่งเซิร์ฟเวอร์เสร็จ และอย่าเพิกถอน key เก่าก่อน token เดิมหมดอายุ

## ฟีเจอร์

- สมัครและเข้าสู่ระบบเป็นนักเรียนหรือติวเตอร์ พร้อม session cookie แบบ HttpOnly
- ติวเตอร์สร้างและแก้ไขโปรไฟล์ วิชา ระดับ ราคา รูปแบบการสอน จังหวัด ประวัติ และ URL รูป
- นักเรียนค้นหาและปัดดูติวเตอร์ บันทึก/ลบรายการถูกใจที่เก็บในฐานข้อมูล
- นักเรียนเริ่มแชตกับติวเตอร์ที่ถูกใจได้ และทั้งคู่เห็นข้อความที่บันทึกถาวรในห้องส่วนตัวแบบเรียลไทม์
- Row Level Security จำกัดการอ่านและเขียนข้อมูลตามบัญชีและบทบาท

## โครงสร้างหน้าและการ render

โปรเจกต์ใช้ Next.js App Router และมีหน้าอย่างน้อย 8 routes: `/`, `/login`, `/register`, `/post`, `/posts/[id]`, `/saved`, `/chat` และ `/chat/[id]` นอกจากนี้ `app/api/auth/*/route.js` เป็น Route Handlers สำหรับงานบัญชี

| ไฟล์ | รูปแบบ | เหตุผลและวิธี render |
| --- | --- | --- |
| `app/layout.js` | Server Component | กำหนด metadata และโครงหน้า แล้วครอบ state providers ที่ต้องทำงานในเบราว์เซอร์ |
| `app/page.js` | Server Component, SSR | อ่าน session จาก cookie และโหลดรายชื่อติวเตอร์ทุก request; ตั้ง `dynamic = "force-dynamic"` เพื่อไม่ cache ข้อมูลที่ขึ้นกับ session และให้ข้อมูลติวเตอร์เป็นปัจจุบัน |
| `features/posts/data/tutor-server.js` | Server-only data access | ใช้ JWT ของนักเรียนปัจจุบันอ่านข้อมูลผ่าน Supabase RLS แล้วส่งข้อมูลเริ่มต้นให้หน้าแรก |
| `app/login/page.js`, `app/register/page.js` | Server Components | เป็นตัวประกอบหน้าและเลือกโหมด ส่วนฟอร์มที่มี state และ validation อยู่ใน Client Component |
| `features/auth/components/AuthForm.js` | Client Component | ใช้ React Hook Form, Zod resolver และ state สำหรับเลือกประเภทบัญชี แสดง validation และส่งข้อมูลไป Route Handler |
| `features/auth/schemas.js` | shared validation schemas | กำหนดกติกา Zod ให้ฟอร์มและแปลงรายการวิชา/ระดับชั้นจากข้อความเป็น array ก่อนส่ง API |
| `app/post/page.js` | Client Component | โหลดและแก้โปรไฟล์ติวเตอร์ผ่าน Supabase และใช้ React Hook Form + Zod ตรวจค่าก่อนบันทึก |
| `app/posts/[id]/page.js`, `app/saved/page.js`, `app/chat/page.js`, `app/chat/[id]/page.js` | Client Components | ใช้ session context, state, การกดถูกใจ/เริ่มแชต และ subscription ของ Realtime ซึ่งต้องทำงานในเบราว์เซอร์ |
| `features/posts/components/SwipeDeck.js`, `features/posts/components/TutorCard.js` | Client Components | รองรับการปัด การกรอง และ animation ที่ตอบสนองต่อการกระทำของผู้ใช้; ตัวการ์ดใช้ข้อมูล SSR ที่ส่งมาจาก `app/page.js` |
| `features/auth/context/AuthContext.js`, `features/saved/context/SavedContext.js` | Client Context | แชร์ผู้ใช้ รายการถูกใจ และสถานะการโต้ตอบระหว่าง navigation โดยไม่ต้องส่ง props ผ่านทุกหน้า |
| `components/layout/Navbar.js`, `providers/Providers.js` | Client Components | เมนูนำทางและ providers ต้องอ่าน Context/เส้นทางปัจจุบันและตอบสนองต่อการกด; Navbar ยุบเป็นเมนูบนจอเล็ก |
| `app/api/auth/*/route.js` | Server Route Handlers | แฮช/ตรวจรหัสผ่าน เขียน session cookie แบบ HttpOnly และเรียกใช้ secret ที่ห้ามส่งไปเบราว์เซอร์ |

หน้าแรกทำ SSR เพราะข้อมูลติวเตอร์และสิทธิ์การอ่านขึ้นกับ session ของนักเรียนและเปลี่ยนแปลงได้ จึงอ่านใหม่ทุก request ผ่าน RLS แทนการ cache ข้ามผู้ใช้ ส่วน swipe และการบันทึกรายการถูกใจยังทำงานฝั่ง client เพื่อให้ตอบสนองทันที

ฟอร์มสมัคร/login และแก้โปรไฟล์ตรวจด้วย Zod ผ่าน `zodResolver` ของ React Hook Form ก่อนส่งหรือบันทึก และ API ฝั่งเซิร์ฟเวอร์ยังตรวจข้อมูลซ้ำเพื่อไม่พึ่ง validation ในเบราว์เซอร์อย่างเดียว

เมนูหลักซ่อนอยู่หลังปุ่มที่มี `aria-expanded` บนจอมือถือ และแสดงเป็น navigation แถวเดียวบนจอใหญ่ ช่องกรอกข้อมูลและแถวฟอร์มจะเรียงหนึ่งคอลัมน์บนจอแคบแล้วขยายเป็นสองคอลัมน์เมื่อมีพื้นที่

## Deploy

เพิ่ม environment variables ชุดเดียวกับ `.env.local` ใน Vercel Project Settings โดยคงสามตัวลับไว้เป็น server-only และไม่ใส่ prefix `NEXT_PUBLIC_` จากนั้นรัน migration ใน Supabase project เดียวกันก่อน deploy
