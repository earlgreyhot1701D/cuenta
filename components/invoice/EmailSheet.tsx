// Job: the email confirm sheet: recipient pre-filled from the invoice, fixed subject and body, one tap to send.
"use client";

import { useEffect, useState } from "react";
import { Sheet, useSheetClose } from "@/components/ui/Sheet";
import { api } from "@/lib/api/client";
import sheet from "@/components/ui/Sheet.module.css";
import styles from "./EmailSheet.module.css";

type Preview = { to: string; cafeName: string; subject: string; text: string; attachmentName: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = { invoiceId: string; onClose: () => void; onSent: () => void };

export function EmailSheet(props: Props) {
  return (
    <Sheet label="Email invoice" onClose={props.onClose}>
      <EmailBody {...props} />
    </Sheet>
  );
}

function EmailBody({ invoiceId, onClose, onSent }: Props) {
  const close = useSheetClose();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api<Preview>(`/api/invoices/${invoiceId}/email-preview`).then((result) => {
      if (result.ok) {
        setPreview(result.data);
        setTo(result.data.to);
      } else {
        setMessage(result.message);
      }
    });
  }, [invoiceId]);

  async function send() {
    setSending(true);
    setMessage("");
    const result = await api(`/api/invoices/${invoiceId}/email`, { method: "POST", body: { to: to.trim() } });
    setSending(false);
    if (result.ok) {
      close(onSent);
      return;
    }
    setFailed(result.status === 502);
    setMessage(result.message);
  }

  const canSend = !!preview && EMAIL_PATTERN.test(to.trim()) && !sending;

  return (
    <>
      <h2 className={styles.title}>Email invoice</h2>
      {!preview ? (
        <p className="quiet">{message || "Loading…"}</p>
      ) : (
        <>
          <div className={styles.field}>
            <label className="label muted" htmlFor="email-to">
              To
            </label>
            <input
              id="email-to"
              className="field"
              type="email"
              inputMode="email"
              autoComplete="off"
              aria-describedby={preview.to ? undefined : "email-to-missing"}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            {!preview.to && (
              <span id="email-to-missing" className="quiet">
                No email on file for {preview.cafeName}
              </span>
            )}
          </div>
          <div className={styles.field}>
            <span className="label muted">Subject</span>
            <span>{preview.subject}</span>
          </div>
          <pre className={styles.body}>{preview.text}</pre>
          <p className={styles.attachment}>{preview.attachmentName} attached</p>
          <p className="quiet" role="status">
            {sending ? "Sending…" : message}
          </p>
          <div className={sheet.actions}>
            <button className="btn" type="button" onClick={() => close(onClose)} disabled={sending}>
              Cancel
            </button>
            <button className="btn btn-primary" type="button" onClick={send} disabled={!canSend}>
              {failed ? "Retry" : "Send"}
            </button>
          </div>
        </>
      )}
    </>
  );
}
