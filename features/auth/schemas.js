import { z } from "zod";
import { registrationEmailError, validEmail } from "@/lib/auth/input";

const email = z.string().trim().toLowerCase().email("กรุณากรอกอีเมลให้ถูกต้อง").max(254, "อีเมลยาวเกินไป");
const registrationEmail = email.superRefine((value, context) => {
  if (!validEmail(value)) return;
  const error = registrationEmailError(value);
  if (error) context.addIssue({ code: "custom", message: error });
});
// argon2 limits input by bytes, so a Thai password can pass max(128) characters and still be too long.
const password = z.string().min(10, "รหัสผ่านต้องมีอย่างน้อย 10 ตัวอักษร").max(128, "รหัสผ่านยาวเกินไป")
  .refine((value) => new TextEncoder().encode(value).length <= 128, "รหัสผ่านยาวเกินไป");
const profileName = z.string().trim().min(1, "กรุณากรอกชื่อที่แสดง").max(80, "ชื่อต้องไม่เกิน 80 ตัวอักษร");

const uniqueItems = (values) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];
const itemList = z.array(z.string().min(1).max(60, "แต่ละรายการต้องไม่เกิน 60 ตัวอักษร"))
  .min(1, "กรุณากรอกอย่างน้อย 1 รายการ").max(12, "ใส่ได้ไม่เกิน 12 รายการ");

// The form field is "a, b, c"; the API receives the array the form already produced.
const commaSeparatedList = z.string()
  .trim()
  .min(1, "กรุณากรอกอย่างน้อย 1 รายการ")
  .max(720, "ข้อความยาวเกินไป")
  .transform((value) => uniqueItems(value.split(",")))
  .pipe(itemList);
const arrayList = z.array(z.string()).transform(uniqueItems).pipe(itemList);

const photoUrl = z.union([
  z.literal(""),
  z.string().trim().max(2048, "URL ยาวเกินไป").url("กรุณากรอก URL รูปภาพให้ถูกต้อง"),
]);

const registrationFields = {
  email: registrationEmail,
  password,
  displayName: profileName,
};

const tutorProfileSchema = z.object({
  subjects: commaSeparatedList,
  levels: commaSeparatedList,
  pricePerHour: z.number({ error: "กรุณากรอกราคาเป็นตัวเลข" }).int("ราคาต้องเป็นจำนวนเต็ม").min(0, "ราคาต้องไม่ติดลบ").max(100000, "ราคาสูงสุด 100,000 บาท"),
  mode: z.string().trim().min(1, "กรุณากรอกรูปแบบการสอน").max(80),
  province: z.string().trim().min(1, "กรุณากรอกจังหวัด").max(100),
  district: z.string().trim().min(1, "กรุณากรอกอำเภอ/เขต").max(100),
  bio: z.string().trim().min(1, "กรุณาแนะนำตัว").max(2000, "ข้อความแนะนำตัวต้องไม่เกิน 2,000 ตัวอักษร"),
  photo: photoUrl,
});

const roleError = { error: "กรุณาเลือกประเภทบัญชี" };

export const registrationSchema = z.discriminatedUnion("role", [
  z.object({ ...registrationFields, role: z.literal("student") }),
  z.object({ ...registrationFields, role: z.literal("tutor"), tutorProfile: tutorProfileSchema }),
], roleError);

// Same rules, checked again by /api/auth/register: the API can be called without our form.
export const registrationRequestSchema = z.discriminatedUnion("role", [
  z.object({ ...registrationFields, role: z.literal("student") }),
  z.object({
    ...registrationFields,
    role: z.literal("tutor"),
    tutorProfile: tutorProfileSchema.extend({ subjects: arrayList, levels: arrayList, photo: photoUrl.optional() }),
  }),
], roleError);

// Fallback for issues that have no Thai message of their own, such as a missing field.
export const firstIssueMessage = (error) => error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง";
export const thaiFallback = { error: () => "ข้อมูลไม่ถูกต้อง" };

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน").max(128, "รหัสผ่านยาวเกินไป"),
});

export const tutorEditorSchema = z.object({
  displayName: profileName,
  subjects: commaSeparatedList,
  levels: commaSeparatedList,
  pricePerHour: z.number({ error: "กรุณากรอกราคาเป็นตัวเลข" }).int("ราคาต้องเป็นจำนวนเต็ม").min(0, "ราคาต้องไม่ติดลบ").max(100000, "ราคาสูงสุด 100,000 บาท"),
  mode: z.string().trim().min(1, "กรุณากรอกรูปแบบการสอน").max(80),
  province: z.string().trim().min(1, "กรุณากรอกจังหวัด").max(100),
  district: z.string().trim().min(1, "กรุณากรอกอำเภอ/เขต").max(100),
  bio: z.string().trim().min(1, "กรุณาแนะนำตัว").max(2000, "ข้อความแนะนำตัวต้องไม่เกิน 2,000 ตัวอักษร"),
  photo: photoUrl,
});
