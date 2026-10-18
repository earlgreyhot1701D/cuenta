// Job: the Invoice screen's action buttons: Print, Download PDF and Email (Edit and Void join in slice 7).
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmailSheet } from "./EmailSheet";
import { attachmentName } from "@/lib/email/invoice-email";
import styles from "./InvoiceActions.module.css";

export function InvoiceActions({ invoiceId, number, emailed }: { invoiceId: string; number: string; emailed: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);

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
        <button className="btn" type="button" onClick={() => setEmailOpen(true)}>
          {emailed ? "Resend" : "Email invoice"}
        </button>
      </div>
      <p className="quiet" role="status">
        {message}
      </p>
      {emailOpen && (
        <EmailSheet
          invoiceId={invoiceId}
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
