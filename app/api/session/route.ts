// Job: check the PIN (with attempt limiting) and set the 30-day session cookie.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { HttpError, withRoute } from "@/lib/api/with-route";
import { clientIp } from "@/lib/client-ip";
import { isLocked, recordFailure } from "@/lib/pin-limit";
import { SESSION_COOKIE, SESSION_DAYS, createSessionToken } from "@/lib/session";

/** Compares fixed-length digests so the check takes the same time for any guess. */
function pinMatches(guess: string, pin: string): boolean {
  const key = randomBytes(32);
  const digest = (s: string) => createHmac("sha256", key).update(s).digest();
  return timingSafeEqual(digest(guess), digest(pin));
}

export const POST = withRoute(
  "POST /api/session",
  async (req, _ctx, logCtx) => {
    const pin = process.env.APP_PIN;
    if (!pin) throw new Error("APP_PIN is not set");
    const ip = clientIp(req);
    logCtx.ip = ip;

    // Checked before the PIN is compared, so the right PIN is refused during a lockout too.
    if (await isLocked(ip)) throw new HttpError(429, "Too many tries. Wait 15 minutes.");

    const body = await req.json().catch(() => ({}));
    const guess = typeof body.pin === "string" ? body.pin : "";
    if (!pinMatches(guess, pin)) {
      await recordFailure(ip);
      throw new HttpError(401, "That's not it.");
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 86_400,
    });
    return res;
  },
  { public: true },
);
