// Job: lock the PIN route after too many wrong tries, per IP and for everyone.
import { and, count, eq, gt, isNull, or } from "drizzle-orm";
import { db, schema } from "@/db/client";

export const WINDOW_MINUTES = 15;
export const IP_LIMIT = 5;
export const GLOBAL_LIMIT = 20;

const { pinAttempts } = schema;
const windowStart = () => new Date(Date.now() - WINDOW_MINUTES * 60_000);

/** True while this IP, or everyone, is inside a 15-minute lockout. */
export async function isLocked(ip: string): Promise<boolean> {
  const [row] = await db
    .select({ id: pinAttempts.id })
    .from(pinAttempts)
    .where(
      and(
        eq(pinAttempts.kind, "lock"),
        gt(pinAttempts.at, windowStart()),
        or(eq(pinAttempts.ip, ip), isNull(pinAttempts.ip)),
      ),
    )
    .limit(1);
  return !!row;
}

/** Records one wrong PIN and starts a lockout when this IP or the whole route reaches its limit. */
export async function recordFailure(ip: string): Promise<void> {
  await db.insert(pinAttempts).values({ kind: "fail", ip });
  const since = windowStart();
  const [[byIp], [overall]] = await Promise.all([
    db
      .select({ n: count() })
      .from(pinAttempts)
      .where(and(eq(pinAttempts.kind, "fail"), eq(pinAttempts.ip, ip), gt(pinAttempts.at, since))),
    db.select({ n: count() }).from(pinAttempts).where(and(eq(pinAttempts.kind, "fail"), gt(pinAttempts.at, since))),
  ]);
  const locks = [];
  if (byIp.n >= IP_LIMIT) locks.push({ kind: "lock" as const, ip });
  if (overall.n >= GLOBAL_LIMIT) locks.push({ kind: "lock" as const, ip: null });
  if (locks.length) await db.insert(pinAttempts).values(locks);
}
