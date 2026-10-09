-- เพิ่มติวเตอร์ทดลองอีก 12 คน (tutor7@test.com ถึง tutor18@test.com)
-- รหัสผ่านทุกบัญชี: test123456
-- รันใน Supabase SQL Editor หลัง migration ครบ 5 ไฟล์ (ต้องมีคอลัมน์ district)
-- รันซ้ำได้: บัญชีที่มีอยู่แล้วจะถูกข้าม
begin;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor7@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'ครูแนน' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'สอนชีววิทยาและเคมี ม.ปลาย สรุปเนื้อหาเป็นแผนผังจำง่าย เตรียมสอบ A-Level', array['ชีววิทยา','เคมี']::text[], array['ม.ปลาย']::text[], 450, 'ออนไลน์', 'กรุงเทพฯ', 'จตุจักร', 'https://i.pravatar.cc/600?img=5' from prof;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor8@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'พี่ต้น' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'นักศึกษาแพทย์ปี 5 ติวเคมีและฟิสิกส์ เน้นทำโจทย์ข้อสอบเก่า', array['เคมี','ฟิสิกส์']::text[], array['ม.ปลาย']::text[], 550, 'ตัวต่อตัว', 'เชียงใหม่', 'สุเทพ', 'https://i.pravatar.cc/600?img=11' from prof;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor9@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'ครูจอย' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'ครูภาษาไทยประสบการณ์ 8 ปี สอนเขียนเรียงความ การอ่านจับใจความ และหลักภาษา', array['ภาษาไทย']::text[], array['ประถม','ม.ต้น']::text[], 300, 'ออนไลน์/ตัวต่อตัว', 'นนทบุรี', 'บางบัวทอง', 'https://i.pravatar.cc/600?img=9' from prof;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor10@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'พี่บีม' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'สอนเขียนโปรแกรม Python และ Scratch สำหรับเด็ก ทำโปรเจกต์เกมจริง', array['คอมพิวเตอร์','Python']::text[], array['ประถม','ม.ต้น']::text[], 500, 'ออนไลน์', 'ขอนแก่น', 'เมืองขอนแก่น', 'https://i.pravatar.cc/600?img=13' from prof;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor11@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'ครูฝน' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'ติวคณิตประถม เน้นพื้นฐานแน่น สอนสนุก เหมาะกับเด็กที่ไม่ชอบเลข', array['คณิตศาสตร์']::text[], array['ประถม']::text[], 250, 'ตัวต่อตัว', 'ชลบุรี', 'ศรีราชา', 'https://i.pravatar.cc/600?img=16' from prof;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor12@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'ดร.เอก' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'อาจารย์มหาวิทยาลัย สอนแคลคูลัสและสถิติ ระดับมหาวิทยาลัย', array['แคลคูลัส','สถิติ']::text[], array['มหาวิทยาลัย']::text[], 800, 'ออนไลน์', 'ปทุมธานี', 'คลองหลวง', 'https://i.pravatar.cc/600?img=59' from prof;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor13@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'พี่มิว' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'TOEIC 950 ติวภาษาอังกฤษเพื่อการสอบและสนทนา', array['ภาษาอังกฤษ','TOEIC']::text[], array['ม.ปลาย','มหาวิทยาลัย']::text[], 450, 'ออนไลน์', 'ภูเก็ต', 'เมืองภูเก็ต', 'https://i.pravatar.cc/600?img=20' from prof;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor14@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'ครูโอ๊ต' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'สอนสังคมศึกษาและประวัติศาสตร์ เล่าเป็นเรื่องให้จำง่าย', array['สังคมศึกษา','ประวัติศาสตร์']::text[], array['ม.ต้น','ม.ปลาย']::text[], 300, 'ตัวต่อตัว', 'นครราชสีมา', 'เมืองนครราชสีมา', 'https://i.pravatar.cc/600?img=53' from prof;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor15@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'พี่ใบเตย' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'สอนภาษาญี่ปุ่น JLPT N2 เคยทำงานที่ญี่ปุ่น 3 ปี', array['ภาษาญี่ปุ่น']::text[], array['ม.ต้น','ม.ปลาย','มหาวิทยาลัย']::text[], 500, 'ออนไลน์', 'กรุงเทพฯ', 'ลาดพร้าว', 'https://i.pravatar.cc/600?img=44' from prof;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor16@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'ครูหมิง' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'สอนภาษาจีน HSK 5 ทั้งพูด อ่าน เขียน สำหรับทุกวัย', array['ภาษาจีน']::text[], array['ประถม','ม.ต้น','ม.ปลาย']::text[], 400, 'ออนไลน์/ตัวต่อตัว', 'สงขลา', 'หาดใหญ่', 'https://i.pravatar.cc/600?img=26' from prof;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor17@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'พี่กัน' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'วิศวะไฟฟ้า สอนฟิสิกส์ ม.ปลาย เตรียมสอบ TPAT3', array['ฟิสิกส์','คณิตศาสตร์']::text[], array['ม.ปลาย']::text[], 500, 'ตัวต่อตัว', 'ขอนแก่น', 'บ้านเป็ด', 'https://i.pravatar.cc/600?img=68' from prof;

with acc as (
  insert into public.accounts(email, password_hash, role) values ('tutor18@test.com', '$argon2id$v=19$m=19456,p=1,t=2$u+TJIyUkVD2CZBBNfeZflA$yZMNZ7fN71d6WUOFihknygpF1epdRvPX/kIZQJgE7oA', 'tutor')
  on conflict (email) do nothing returning id
), prof as (
  insert into public.profiles(user_id, display_name) select id, 'ครูน้ำ' from acc returning user_id
)
insert into public.tutor_profiles(user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url)
select user_id, 'สอนวิทยาศาสตร์ประถมและม.ต้น ทดลองจริงให้เด็กเห็นภาพ', array['วิทยาศาสตร์']::text[], array['ประถม','ม.ต้น']::text[], 350, 'ตัวต่อตัว', 'เชียงราย', 'เมืองเชียงราย', 'https://i.pravatar.cc/600?img=49' from prof;

commit;
