import "server-only";
import { importJWK, SignJWT } from "jose";

let signingKey;
let keyId;

async function loadSigningKey() {
  if (signingKey) return signingKey;
  const raw = process.env.SUPABASE_JWT_PRIVATE_JWK;
  if (!raw) throw new Error("SUPABASE_JWT_PRIVATE_JWK is not configured");
  const jwk = JSON.parse(raw);
  if (jwk.kty !== "EC" || jwk.crv !== "P-256" || !jwk.d) throw new Error("Expected an ES256 P-256 private JWK");
  keyId = jwk.kid || process.env.SUPABASE_JWT_KID;
  if (!keyId) throw new Error("The imported Supabase signing key ID (kid) is required");
  signingKey = await importJWK(jwk, "ES256");
  return signingKey;
}

export async function createSupabaseJwt(session) {
  const key = await loadSigningKey();
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ role: "authenticated", app_role: session.role })
    .setProtectedHeader({ alg: "ES256", kid: keyId, typ: "JWT" })
    .setSubject(session.userId)
    .setIssuedAt(now)
    .setExpirationTime(now + 5 * 60)
    .sign(key);
}
