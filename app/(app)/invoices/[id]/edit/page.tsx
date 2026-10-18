// Job: load an invoice's saved copy into the delivery form for Edit.
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DeliveryForm, type DeliveryLine } from "@/components/deliver/DeliveryForm";
import { getCustomer } from "@/lib/queries/customers";
import { latestCounts } from "@/lib/queries/counts";
import { getInvoice } from "@/lib/queries/invoices";
import { standingProducts } from "@/lib/queries/products";
import styles from "../invoice.module.css";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const found = await getInvoice((await params).id);
  if (!found) notFound();
  const { invoice, lines } = found;
  if (invoice.voidedAt) redirect(`/invoices/${invoice.id}`);

  const [customer, products, latest] = await Promise.all([
    getCustomer(invoice.customerId),
    standingProducts(invoice.customerId),
    latestCounts(invoice.customerId),
  ]);
  if (!customer) notFound();

  // Saved lines keep their saved name and price; standing products not on the invoice use today's price.
  const saved = new Map(lines.filter((l) => l.productId).map((l) => [l.productId as string, l]));
  const shelf = (productId: string) => latest.get(productId) ?? null;
  const formLines: DeliveryLine[] = [
    ...products.map((p) => {
      const line = saved.get(p.productId);
      return {
        productId: p.productId,
        name: line?.description ?? p.name,
        priceCents: line?.unitPriceCents ?? p.priceCents,
        shelf: shelf(p.productId),
      };
    }),
    // Products saved on the invoice but since taken off the standing list stay editable.
    ...[...saved.values()]
      .filter((l) => !products.some((p) => p.productId === l.productId))
      .map((l) => ({
        productId: l.productId as string,
        name: l.description,
        priceCents: l.unitPriceCents,
        shelf: shelf(l.productId as string),
      })),
  ];

  return (
    <>
      <Link href={`/invoices/${invoice.id}`} className={`label ${styles.back}`}>
        ← Back to invoice
      </Link>
      <h1>Edit Invoice {invoice.number}</h1>
      <DeliveryForm
        cafes={[{ id: customer.id, code: customer.code, name: invoice.cafeName, lines: formLines }]}
        mode={{
          kind: "edit",
          invoiceId: invoice.id,
          number: invoice.number,
          invoiceDate: invoice.invoiceDate,
          saved: {
            quantities: Object.fromEntries([...saved].map(([id, l]) => [id, l.quantity])),
            specials: lines
              .filter((l) => !l.productId)
              .map((l) => ({ description: l.description, unitPriceCents: l.unitPriceCents, quantity: l.quantity })),
          },
        }}
      />
    </>
  );
}
