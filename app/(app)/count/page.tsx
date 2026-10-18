// Job: load the cafes, the menu and the chosen cafe's latest counts for the Count screen.
import { cookies } from "next/headers";
import { CountForm, type CountRow } from "@/components/count/CountForm";
import { formatShort, todayPacific } from "@/lib/dates";
import { LAST_COUNT_CAFE_COOKIE } from "@/lib/last-count-cafe";
import { listCustomers } from "@/lib/queries/customers";
import { listProducts } from "@/lib/queries/products";
import { latestCounts } from "@/lib/queries/counts";

export const dynamic = "force-dynamic";

export default async function CountPage({ searchParams }: { searchParams: Promise<{ cafe?: string }> }) {
  const cafes = await listCustomers();
  const requested = (await searchParams).cafe;
  const remembered = (await cookies()).get(LAST_COUNT_CAFE_COOKIE)?.value;
  const cafe =
    cafes.find((c) => c.id === requested) ?? cafes.find((c) => c.id === remembered) ?? cafes[0];

  if (!cafe) return <p className="quiet">No cafes yet.</p>;

  const [products, latest] = await Promise.all([listProducts(), latestCounts(cafe.id)]);
  const rows: CountRow[] = products.map((p) => ({
    productId: p.productId,
    name: p.name,
    last: latest.get(p.productId) ?? null,
  }));

  return (
    <>
      <h1>Shelf Count</h1>
      <p className="quiet">Today, {formatShort(todayPacific())}</p>
      <CountForm
        key={cafe.id}
        cafes={cafes.map((c) => ({ id: c.id, code: c.code, name: c.name }))}
        cafeId={cafe.id}
        rows={rows}
      />
    </>
  );
}
