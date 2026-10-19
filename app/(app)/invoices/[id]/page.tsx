// Job: show one invoice as Eileen's Canva form, with its actions.
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceActions } from "@/components/invoice/InvoiceActions";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { getBusiness } from "@/lib/business";
import { buildInvoiceEmail } from "@/lib/email/invoice-email";
import { emailTestTo } from "@/lib/email/test-mode";
import { formatStamp } from "@/lib/dates";
import { emailStatus, sendButtonLabel } from "@/lib/email-status";
import { lineTotal, sumCents } from "@/lib/money";
import { getInvoice } from "@/lib/queries/invoices";
import styles from "./invoice.module.css";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const found = await getInvoice((await params).id);
  if (!found) notFound();
  const { invoice, lines } = found;
  const status = emailStatus(invoice);
  const email = buildInvoiceEmail({
    number: invoice.number,
    cafeName: invoice.cafeName,
    invoiceDate: invoice.invoiceDate,
    totalCents: sumCents(lines.map((l) => lineTotal(l.unitPriceCents, l.quantity))),
  });
  const draft = {
    to: invoice.cafeEmail ?? "",
    ...email,
    lastSent: invoice.emailSentAt ? status : null,
    sendLabel: sendButtonLabel(invoice),
    testTo: emailTestTo(),
  };

  return (
    <>
      <div data-print-hide>
        <Link href="/ledger" className={`label ${styles.back}`}>
          ← Back to Ledger
        </Link>
        <h1>Invoice {invoice.number}</h1>
        <p className="quiet">{invoice.cafeName}</p>
        {invoice.voidedAt && <p className="quiet">Void · voided {formatStamp(invoice.voidedAt)}</p>}
        {status && <p className="quiet">{status}</p>}
      </div>
      <InvoiceActions invoiceId={invoice.id} number={invoice.number} draft={draft} voided={!!invoice.voidedAt} />
      <div className={styles.frame} data-invoice-frame>
        <InvoiceDocument invoice={{ ...invoice, lines }} business={getBusiness()} />
      </div>
    </>
  );
}
