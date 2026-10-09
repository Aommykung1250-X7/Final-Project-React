import "server-only";
import argon2 from "argon2";

export const PASSWORD_MIN_LENGTH = 10;

export function validatePassword(password) {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH || Buffer.byteLength(password, "utf8") > 128) {
    return `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร และไม่เกิน 128 ไบต์`;
  }
  return null;
}

export function hashPassword(password) {
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

export function verifyPassword(hash, password) {
  return argon2.verify(hash, password);
}
