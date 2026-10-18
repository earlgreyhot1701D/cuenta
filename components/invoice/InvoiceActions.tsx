// Job: the Invoice page's buttons: Print, Download PDF, Send email, Edit and Void.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmailSheet, type EmailDraft } from "./EmailSheet";
import { Confirm } from "@/components/ui/Confirm";
import { api } from "@/lib/api/client";
import { attachmentName } from "@/lib/email/invoice-email";
import styles from "./InvoiceActions.module.css";

export function InvoiceActions({
  invoiceId,
  number,
  draft,
  voided,
}: {
  invoiceId: string;
  number: string;
  draft: EmailDraft;
  voided: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);

  async function voidInvoice() {
    setMessage("");
    const result = await api(`/api/invoices/${invoiceId}/void`, { method: "POST" });
    if (result.ok) router.refresh();
    else setMessage(result.message);
  }

  async function downloadPdf() {
    const route = `/api/invoices/${invoiceId}/pdf`;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(route);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error(route, res.status, data?.error);
        setMessage(data?.error ?? "Couldn't make the PDF. Print still works.");
        return;
      }
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = attachmentName(number);
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      console.error(route, err);
      setMessage("Couldn't make the PDF. Print still works.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-print-hide>
      <div className={styles.actions}>
        <button className="btn btn-primary" type="button" onClick={() => window.print()}>
          Print
        </button>
        <button className="btn" type="button" onClick={downloadPdf} disabled={busy}>
          {busy ? "Making PDF…" : "Download PDF"}
        </button>
        {!voided && (
          <>
            <button className="btn" type="button" onClick={() => setEmailOpen(true)}>
              {draft.sendLabel}
            </button>
            <Link className="btn" href={`/invoices/${invoiceId}/edit`}>
              Edit
            </Link>
            <button className="btn" type="button" onClick={() => setVoidOpen(true)}>
              Void
            </button>
          </>
        )}
      </div>
      <p className="quiet" role="status">
        {message}
      </p>
      {voidOpen && (
        <Confirm
          message={`Void invoice ${number}? It stays in the Ledger, stamped Void, and its number stays taken.`}
          confirmLabel="Void invoice"
          onCancel={() => setVoidOpen(false)}
          onConfirm={() => {
            setVoidOpen(false);
            voidInvoice();
          }}
        />
      )}
      {emailOpen && (
        <EmailSheet
          invoiceId={invoiceId}
          draft={draft}
          onClose={() => setEmailOpen(false)}
          onSent={() => {
            setEmailOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
