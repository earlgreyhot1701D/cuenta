// Job: report database status and the app version.
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { log } from "@/lib/log";
import pkg from "@/package.json";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || pkg.version;
  let up = true;
  try {
    await db.execute(sql`select 1`);
  } catch (err) {
    up = false;
    log({ route: "GET /health", outcome: "error", ms: Date.now() - start, error: (err as Error).message });
  }
  if (up) log({ route: "GET /health", outcome: "ok", ms: Date.now() - start });
  return NextResponse.json({ ok: up, db: up ? "up" : "down", version }, { status: up ? 200 : 503 });
}
