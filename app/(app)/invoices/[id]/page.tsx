// Job: show one invoice as Eileen's Canva form, with its actions.
import { notFound } from "next/navigation";
import { InvoiceActions } from "@/components/invoice/InvoiceActions";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { getBusiness } from "@/lib/business";
import { emailStatus } from "@/lib/email-status";
import { fitsOnePage } from "@/lib/invoice-capacity";
import { getInvoice } from "@/lib/queries/invoices";
import styles from "./invoice.module.css";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const found = await getInvoice((await params).id);
  if (!found) notFound();
  const { invoice, lines } = found;
  const status = emailStatus(invoice);

  return (
    <>
      <div data-print-hide>
        <h1>Invoice {invoice.number}</h1>
        <p className="quiet">{invoice.cafeName}</p>
        {status && <p className="quiet">{status}</p>}
        {!fitsOnePage(lines.length) && <p className="quiet">Too many lines for one page</p>}
      </div>
      <InvoiceActions invoiceId={invoice.id} number={invoice.number} emailed={!!invoice.emailSentAt} />
      <div className={styles.frame} data-invoice-frame>
        <InvoiceDocument invoice={{ ...invoice, lines }} business={getBusiness()} />
      </div>
    </>
  );
}
