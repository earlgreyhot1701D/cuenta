// Job: the Invoice screen's action buttons (Print and Download PDF; Email, Edit and Void join in later slices).
"use client";

import { useState } from "react";
import styles from "./InvoiceActions.module.css";

export function InvoiceActions({ invoiceId, number }: { invoiceId: string; number: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

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
      a.download = `Invoice-${number.replace(/[^A-Za-z0-9_-]/g, "_")}.pdf`;
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
      </div>
      <p className="quiet" role="status">
        {message}
      </p>
    </div>
  );
}
