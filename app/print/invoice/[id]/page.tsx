// Job: token-gated, chrome-free invoice page that only the PDF renderer opens.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { getBusiness } from "@/lib/business";
import { verifyPrintToken } from "@/lib/print-token";
import { getInvoice } from "@/lib/queries/invoices";
import styles from "./print.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PrintInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  if (!verifyPrintToken(id, (await searchParams).t)) notFound();
  const found = await getInvoice(id);
  if (!found) notFound();

  return (
    <main className={styles.sheet} data-print-main>
      <div className={styles.frame} data-invoice-frame>
        <InvoiceDocument invoice={{ ...found.invoice, lines: found.lines }} business={getBusiness()} />
      </div>
    </main>
  );
}
