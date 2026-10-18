// Job: save the entered count rows for one cafe as today's count.
import { NextResponse } from "next/server";
import { HttpError, withRoute } from "@/lib/api/with-route";
import { todayPacific } from "@/lib/dates";
import { getCustomer } from "@/lib/queries/customers";
import { listProducts } from "@/lib/queries/products";
import { insertCounts } from "@/lib/queries/counts";
import { LAST_COUNT_CAFE_COOKIE } from "@/lib/last-count-cafe";

export const POST = withRoute("POST /api/counts", async (req, _ctx, logCtx) => {
  const body = await req.json().catch(() => ({}));
  const customer = typeof body.customerId === "string" ? await getCustomer(body.customerId) : undefined;
  if (!customer) throw new HttpError(400, "Pick a cafe.");
  logCtx.cafe = customer.name;

  const menu = new Set((await listProducts()).map((p) => p.productId));
  const entries: { productId: string; quantity: number }[] = Array.isArray(body.entries) ? body.entries : [];
  const valid = entries.every(
    (e) => menu.has(e.productId) && Number.isInteger(e.quantity) && e.quantity >= 0,
  );
  if (entries.length === 0 || !valid) throw new HttpError(400, "Those counts didn't look right.");

  const countedOn = todayPacific();
  await insertCounts(
    customer.id,
    countedOn,
    entries.map((e) => ({ productId: e.productId, quantity: e.quantity })),
  );

  const res = NextResponse.json({ saved: entries.length, countedOn });
  res.cookies.set(LAST_COUNT_CAFE_COOKIE, customer.id, { path: "/", maxAge: 365 * 86_400, sameSite: "lax" });
  return res;
});
