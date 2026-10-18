// Job: load the menu with prices and every cafe's latest shelf counts for a new delivery.
import { DeliveryForm, type DeliveryCafe } from "@/components/deliver/DeliveryForm";
import { todayPacific } from "@/lib/dates";
import { listCustomers } from "@/lib/queries/customers";
import { listProducts } from "@/lib/queries/products";
import { latestCounts } from "@/lib/queries/counts";

export const dynamic = "force-dynamic";

export default async function DeliverPage() {
  const [customers, products] = await Promise.all([listCustomers(), listProducts()]);
  const cafes: DeliveryCafe[] = await Promise.all(
    customers.map(async (c) => {
      const latest = await latestCounts(c.id);
      return {
        id: c.id,
        code: c.code,
        name: c.name,
        lines: products.map((p) => ({
          productId: p.productId,
          name: p.name,
          priceCents: p.priceCents,
          shelf: latest.get(p.productId) ?? null,
        })),
      };
    }),
  );

  return (
    <>
      <h1>New Delivery</h1>
      <DeliveryForm cafes={cafes} mode={{ kind: "new", defaultDate: todayPacific() }} />
    </>
  );
}
