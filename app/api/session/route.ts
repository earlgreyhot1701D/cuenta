// Job: check the PIN and set the 30-day session cookie.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { HttpError, withRoute } from "@/lib/api/with-route";
import { SESSION_COOKIE, SESSION_DAYS, createSessionToken } from "@/lib/session";

/** Compares fixed-length digests so the check takes the same time for any guess. */
function pinMatches(guess: string, pin: string): boolean {
  const key = randomBytes(32);
  const digest = (s: string) => createHmac("sha256", key).update(s).digest();
  return timingSafeEqual(digest(guess), digest(pin));
}

export const POST = withRoute(
  "POST /api/session",
  async (req) => {
    const pin = process.env.APP_PIN;
    if (!pin) throw new Error("APP_PIN is not set");
    const body = await req.json().catch(() => ({}));
    const guess = typeof body.pin === "string" ? body.pin : "";
    if (!pinMatches(guess, pin)) throw new HttpError(401, "That's not it.");

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
