// Job: sign and verify the 30-day PIN session cookie (Web Crypto, so it runs in the proxy and routes alike).
export const SESSION_COOKIE = "cuenta_session";
export const SESSION_DAYS = 30;

const encoder = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

/** A signed token carrying its expiry. */
export async function createSessionToken(now = Date.now()): Promise<string> {
  const payload = b64url(encoder.encode(JSON.stringify({ exp: now + SESSION_DAYS * 86_400_000 })));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(), encoder.encode(payload)));
  return `${payload}.${b64url(sig)}`;
}

/** True when the token's signature is valid and it hasn't expired. */
export async function verifySessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64url(sig), encoder.encode(payload));
    if (!ok) return false;
    const { exp } = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    return typeof exp === "number" && exp > now;
  } catch {
    return false;
  }
}
