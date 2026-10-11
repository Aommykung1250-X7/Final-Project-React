import "server-only";
import argon2 from "argon2";

export function hashPassword(password) {
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

export function verifyPassword(hash, password) {
  return argon2.verify(hash, password);
}
