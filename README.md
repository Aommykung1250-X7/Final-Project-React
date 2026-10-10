# TutorMatch

เว็บจับคู่ติวเตอร์กับนักเรียน นักเรียนค้นหาและกดถูกใจติวเตอร์ จากนั้นเริ่มคุยและตกลงราคาในแชตของเว็บได้ ติวเตอร์จัดการโปรไฟล์และตอบแชตได้

แอปใช้ Next.js, Supabase Database/Realtime และระบบบัญชีที่จัดการเอง รหัสผ่านแฮชด้วย Argon2id ส่วน Supabase Auth ไม่ได้ใช้

## ผู้จัดทำ

| ชื่อ | รหัสนักศึกษา | GitHub |
| --- | --- | --- |
| สุวรรณชัย ชัยสุวรรณศรี | 682110200 | [PhluCode](https://github.com/PhluCode) |
| ภานุวัฒน์ อุดกันทา | 682110185 | [Aommykung1250-X7](https://github.com/Aommykung1250-X7) |

### สุวรรณชัย ชัยสุวรรณศรี (682110200)

- ตั้งค่าแอป Next.js และหน้าตาเว็บชุดแรก: หน้าปัดการ์ด (`SwipeDeck`, `TutorCard`) พร้อม animation การปัด ตัวกรองวิชา Navbar หน้ารายละเอียดติวเตอร์ หน้ารายการที่ถูกใจ และ Context เก็บรายการที่ถูกใจ (`SavedContext`)
- ตัวกรองจังหวัดบนหน้าปัด และคอลัมน์อำเภอ/เขตของติวเตอร์ (`20261009000400_tutor_district.sql`) แสดงอำเภอบนการ์ด
- ระบบติวเตอร์กดรับคำขอ (`20261009000500_tutor_accepts_requests.sql`): หน้า `/requests` สำหรับติวเตอร์ สถานะคำขอฝั่งนักเรียน ปุ่มยกเลิกคำขอ และตัวเลขคำขอที่รออยู่บนเมนู แชตเปิดได้หลังติวเตอร์รับเท่านั้น
- `proxy.js` (middleware ที่เขียนเอง) กันหน้าที่ต้อง login และแยกสิทธิ์นักเรียน/ติวเตอร์ พร้อมพากลับหน้าเดิมหลัง login
- ข้อความ error ตอน login ที่แยกปัญหาการตั้งค่า Supabase ออกจากรหัสผ่านผิด
- หัวห้องแชตแสดงชื่อและรูปคู่สนทนา และให้คนที่ยังไม่ login ปัดดูการ์ดได้
- จัดโครงสร้างโฟลเดอร์ (`features/tutors`, `features/requests`, `components/ui`, route `/profile` และ `/tutors/[id]`) โลโก้และ favicon ใน `public/` และข้อมูลติวเตอร์ทดลอง `supabase/seed/more-tutors.sql`

### ภานุวัฒน์ อุดกันทา (682110185)

- วางโครงโฟลเดอร์เริ่มต้นของโปรเจกต์ และเขียนเอกสารออกแบบระบบหลังบ้าน (`docs/superpowers/specs/`)
- ระบบบัญชีที่เขียนเอง ไม่ใช้ Supabase Auth: สมัคร/เข้าสู่ระบบ/ออกจากระบบผ่าน Route Handlers (`app/api/auth/*`) แฮชรหัสผ่านด้วย Argon2id session cookie แบบ HttpOnly และการเซ็น JWT ES256 ให้ Supabase (`lib/auth/*`)
- ฐานข้อมูล Supabase และ Row Level Security (`20261009000100` ถึง `20261009000300`): บัญชี โปรไฟล์ ติวเตอร์ การกดถูกใจ บทสนทนาและข้อความ
- โหลดรายชื่อติวเตอร์แบบ SSR หน้าแก้โปรไฟล์ติวเตอร์ และการตรวจฟอร์มด้วย React Hook Form + Zod
- แชตเรียลไทม์ด้วย Supabase Realtime Broadcast (`features/chat/*`)
- ตรวจโดเมนอีเมลตอนสมัคร แสดงโปรไฟล์ผู้ใช้ที่ login อยู่บน Navbar และปรับความเร็วการโหลดแอปและแชต

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
4. `supabase/migrations/20261009000400_tutor_district.sql` (คอลัมน์อำเภอ/เขต)
5. `supabase/migrations/20261009000500_tutor_accepts_requests.sql` (สถานะคำขอ: ติวเตอร์ต้องกดรับก่อนแชต)

จากนั้นเปิด Database > Replication/Realtime settings แล้วปิด **Allow public access to channels** เพื่อบังคับ private-channel authorization ตาม RLS ใน migration แชตส่งข้อความเข้า `public.messages` ก่อน แล้ว trigger จะกระจายข้อความที่บันทึกแล้วผ่าน Supabase Realtime Broadcast ทาง WebSocket

สำหรับ signing key ให้นำ private JWK จาก `.env.local` เข้าเมนู JWT Signing Keys ของ Supabase เพื่อสร้าง standby key (Supabase ใช้ JWK นี้บันทึก private/public key คู่กัน) แล้วให้ `kid` ตรงกับค่าใน JWK ก่อนเปิดใช้แอป การเซ็น token จะเริ่มผ่านเมื่อ key นี้เป็น current แล้ว จึงค่อย Rotate หลังตั้ง private key ฝั่งเซิร์ฟเวอร์เสร็จ และอย่าเพิกถอน key เก่าก่อน token เดิมหมดอายุ

## ฟีเจอร์

- สมัครและเข้าสู่ระบบเป็นนักเรียนหรือติวเตอร์ พร้อม session cookie แบบ HttpOnly
- ติวเตอร์สร้างและแก้ไขโปรไฟล์ วิชา ระดับ ราคา รูปแบบการสอน จังหวัด ประวัติ และ URL รูป
- คนที่ยังไม่ login ปัดดูการ์ดได้ ต้อง login ตอนกดถูกใจ
- นักเรียนกรองติวเตอร์ตามวิชาและจังหวัด การ์ดแสดงอำเภอ/เขต
- นักเรียนปัดขวา = ส่งคำขอ ติวเตอร์กดรับหรือปฏิเสธที่หน้า `/requests` (มีตัวเลขคำขอที่รออยู่บนเมนู) นักเรียนยกเลิกคำขอที่ยังรอได้
- แชตเปิดได้หลังติวเตอร์รับคำขอแล้วเท่านั้น ทั้งคู่เห็นข้อความที่บันทึกถาวรในห้องส่วนตัวแบบเรียลไทม์ หัวห้องแสดงชื่อและรูปคู่สนทนา
- `proxy.js` (middleware ที่เขียนเอง ไม่ใช้ Supabase Auth) กันหน้าที่ต้อง login และแยกสิทธิ์นักเรียน/ติวเตอร์
- Row Level Security จำกัดการอ่านและเขียนข้อมูลตามบัญชีและบทบาท

## โครงสร้างหน้าและการ render

โปรเจกต์ใช้ Next.js App Router และมีหน้า 9 routes: `/`, `/login`, `/register`, `/profile`, `/tutors/[id]`, `/saved`, `/requests`, `/chat` และ `/chat/[id]` นอกจากนี้ `app/api/auth/*/route.js` เป็น Route Handlers สำหรับงานบัญชี

โครงโฟลเดอร์: `app/` มีแค่ไฟล์ route (หน้าและ API) ส่วน UI และการดึงข้อมูลแยกตามฟีเจอร์ใน `features/` ได้แก่ `auth/` (สมัคร/เข้าสู่ระบบ), `tutors/` (การ์ด ปัด โปรไฟล์ติวเตอร์), `requests/` (ถูกใจ = คำขอ และการตอบรับ), `chat/` (แชตเรียลไทม์) แต่ละฟีเจอร์แบ่งเป็น `components/`, `context/` และ `data/` ส่วน `components/` เก็บ UI ที่ไม่ได้เป็นของฟีเจอร์ใดฟีเจอร์หนึ่ง: `components/layout/` คือโครงที่ครอบทุกหน้า (Navbar, Providers ที่ `app/layout.js` ใช้) และ `components/ui/` คือชิ้นเล็กที่หลายฟีเจอร์ใช้ร่วมกัน (Avatar, FieldError, สไตล์ช่องกรอก) และ `lib/` เป็นโค้ดกลางที่ไม่ใช่ UI (session, JWT, Supabase client) ส่วน `public/` เก็บไฟล์ static ที่เปิดได้จาก URL ตรงๆ: `logo.svg` (โลโก้บน Navbar), `favicon.svg` (ไอคอนแท็บเบราว์เซอร์) และ `images/tutor-placeholder.svg` (รูปสำรองเมื่อติวเตอร์ยังไม่ใส่รูป)

| ไฟล์ | รูปแบบ | เหตุผลและวิธี render |
| --- | --- | --- |
| `app/layout.js` | Server Component | กำหนด metadata และโครงหน้า แล้วครอบ state providers ที่ต้องทำงานในเบราว์เซอร์ |
| `app/page.js` | Server Component, SSR | อ่าน session จาก cookie และโหลดรายชื่อติวเตอร์ทุก request; ตั้ง `dynamic = "force-dynamic"` เพื่อไม่ cache ข้อมูลที่ขึ้นกับ session และให้ข้อมูลติวเตอร์เป็นปัจจุบัน |
| `features/tutors/data/map-tutor.js` | shared | รายชื่อคอลัมน์และการแปลงข้อมูลติวเตอร์ที่ใช้ร่วมกันทั้งฝั่ง server และ client เพิ่มคอลัมน์ใหม่แก้ที่เดียว |
| `features/tutors/data/tutor-server.js` | Server-only data access | ใช้ JWT ของนักเรียนปัจจุบันอ่านข้อมูลผ่าน Supabase RLS แล้วส่งข้อมูลเริ่มต้นให้หน้าแรก; ถ้ายังไม่ login จะอ่านเฉพาะข้อมูลบนการ์ดด้วย admin client บนเซิร์ฟเวอร์ |
| `app/login/page.js`, `app/register/page.js` | Server Components | เป็นตัวประกอบหน้าและเลือกโหมด ส่วนฟอร์มที่มี state และ validation อยู่ใน Client Component |
| `features/auth/components/AuthForm.js` | Client Component | ใช้ React Hook Form, Zod resolver และ state สำหรับเลือกประเภทบัญชี แสดง validation และส่งข้อมูลไป Route Handler |
| `features/auth/schemas.js` | shared validation schemas | กำหนดกติกา Zod ให้ฟอร์มและแปลงรายการวิชา/ระดับชั้นจากข้อความเป็น array ก่อนส่ง API |
| `app/profile/page.js`, `app/saved/page.js`, `app/requests/page.js`, `app/tutors/[id]/page.js` | Server Components | เป็นเปลือกของหน้า ไม่มี state; `tutors/[id]` อ่านค่า `id` จาก URL บนเซิร์ฟเวอร์แล้วส่งเป็น prop ให้ Client Component |
| `features/tutors/components/TutorEditor.js` | Client Component | โหลดและแก้โปรไฟล์ติวเตอร์ผ่าน Supabase และใช้ React Hook Form + Zod ตรวจค่าก่อนบันทึก |
| `features/tutors/components/TutorProfile.js`, `features/requests/components/SavedList.js`, `features/requests/components/RequestList.js`, `app/chat/page.js`, `app/chat/[id]/page.js` | Client Components | ใช้ session context, state, การกดถูกใจ/เริ่มแชต และ subscription ของ Realtime ซึ่งต้องทำงานในเบราว์เซอร์ |
| `features/tutors/components/SwipeDeck.js`, `features/tutors/components/TutorCard.js` | Client Components | รองรับการปัด การกรอง และ animation ที่ตอบสนองต่อการกระทำของผู้ใช้; ตัวการ์ดใช้ข้อมูล SSR ที่ส่งมาจาก `app/page.js` |
| `features/auth/context/AuthContext.js`, `features/requests/context/SavedContext.js` | Client Context | แชร์ผู้ใช้ รายการถูกใจ และสถานะการโต้ตอบระหว่าง navigation โดยไม่ต้องส่ง props ผ่านทุกหน้า |
| `components/layout/Navbar.js`, `components/layout/Providers.js` | Client Components | เมนูนำทางและ providers ต้องอ่าน Context/เส้นทางปัจจุบันและตอบสนองต่อการกด; Navbar ยุบเป็นเมนูบนจอเล็ก |
| `app/api/auth/*/route.js` | Server Route Handlers | แฮช/ตรวจรหัสผ่าน เขียน session cookie แบบ HttpOnly และเรียกใช้ secret ที่ห้ามส่งไปเบราว์เซอร์ |
| `proxy.js` | Proxy (middleware ของ Next.js 16) | ทำงานก่อน render ทุกหน้า อ่าน cookie `tutormatch_session` แล้วตรวจกับตาราง sessions: ยังไม่ login ถูกพาไป `/login?next=...`, นักเรียน/ติวเตอร์ถูกกันออกจากหน้าของอีกบทบาท |

หน้าแรกทำ SSR เพราะข้อมูลติวเตอร์และสิทธิ์การอ่านขึ้นกับ session ของนักเรียนและเปลี่ยนแปลงได้ จึงอ่านใหม่ทุก request ผ่าน RLS แทนการ cache ข้ามผู้ใช้ ส่วน swipe และการบันทึกรายการถูกใจยังทำงานฝั่ง client เพื่อให้ตอบสนองทันที

ฟอร์มสมัคร/login และแก้โปรไฟล์ตรวจด้วย Zod ผ่าน `zodResolver` ของ React Hook Form ก่อนส่งหรือบันทึก และ API ฝั่งเซิร์ฟเวอร์ยังตรวจข้อมูลซ้ำเพื่อไม่พึ่ง validation ในเบราว์เซอร์อย่างเดียว

เมนูหลักซ่อนอยู่หลังปุ่มที่มี `aria-expanded` บนจอมือถือ และแสดงเป็น navigation แถวเดียวบนจอใหญ่ ช่องกรอกข้อมูลและแถวฟอร์มจะเรียงหนึ่งคอลัมน์บนจอแคบแล้วขยายเป็นสองคอลัมน์เมื่อมีพื้นที่

## Deploy

เพิ่ม environment variables ชุดเดียวกับ `.env.local` ใน Vercel Project Settings โดยคงสามตัวลับไว้เป็น server-only และไม่ใส่ prefix `NEXT_PUBLIC_` จากนั้นรัน migration ใน Supabase project เดียวกันก่อน deploy
