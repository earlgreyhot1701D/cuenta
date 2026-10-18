// Job: show one saved invoice snapshot (plain list until slice 3 brings the Canva layout).
import { notFound } from "next/navigation";
import { formatShort } from "@/lib/dates";
import { formatUSD, lineTotal, sumCents } from "@/lib/money";
import { getInvoice } from "@/lib/queries/invoices";
import styles from "./invoice.module.css";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const found = await getInvoice((await params).id);
  if (!found) notFound();
  const { invoice, lines } = found;
  const total = sumCents(lines.map((l) => lineTotal(l.unitPriceCents, l.quantity)));

  return (
    <article className={styles.invoice}>
      <h1>Invoice {invoice.number}</h1>
      <p className="quiet">
        {invoice.cafeName} · {formatShort(invoice.invoiceDate)}
      </p>
      <ul className={styles.lines}>
        {lines.map((l) => (
          <li key={l.id} className={styles.line}>
            <span>{l.description}</span>
            <span>{l.quantity}</span>
            <span>{formatUSD(l.unitPriceCents)}</span>
            <span>{formatUSD(lineTotal(l.unitPriceCents, l.quantity))}</span>
          </li>
        ))}
      </ul>
      <p className={styles.total}>
        <span className="label">Invoice total</span> <strong>{formatUSD(total)}</strong>
      </p>
    </article>
  );
}
