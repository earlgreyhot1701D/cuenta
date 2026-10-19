// Job: the Email pop-up: To filled from the invoice's saved email, a short preview, and Send pinned at the bottom.
"use client";

import { useState } from "react";
import { Sheet, useSheetClose } from "@/components/ui/Sheet";
import { api } from "@/lib/api/client";
import sheet from "@/components/ui/Sheet.module.css";
import styles from "./EmailSheet.module.css";

/** Everything the pop-up shows, handed over by the Invoice page so nothing waits on a second request. */
export type EmailDraft = {
  to: string;
  subject: string;
  text: string;
  attachmentName: string;
  lastSent: string | null;
  sendLabel: string;
  /** EMAIL_TEST_TO when test mode is on: the server sends there, whatever To says. */
  testTo: string | null;
};

type Props = { invoiceId: string; draft: EmailDraft; onClose: () => void; onSent: () => void };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailSheet(props: Props) {
  return (
    <Sheet label="Email pop-up" onClose={props.onClose}>
      <EmailBody {...props} />
    </Sheet>
  );
}

function EmailBody({ invoiceId, draft, onClose, onSent }: Props) {
  const close = useSheetClose();
  const [to, setTo] = useState(draft.to);
  const [showFull, setShowFull] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

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

  const testMode = draft.testTo !== null;
  const canSend = (testMode || EMAIL_PATTERN.test(to.trim())) && !sending;
  // Collapsed: the first two lines that have words, so a blank line never takes a slot.
  const shortText = `${draft.text
    .split("\n")
    .filter((line) => line.trim())
    .slice(0, 2)
    .join("\n")} …`;

  return (
    <>
      <h2 className={styles.title}>Email this invoice</h2>
      {testMode && (
        <p className={styles.testMode} role="note">
          Test mode: this sends to {draft.testTo}, not the cafe.
        </p>
      )}
      <div className={styles.field}>
        <label className="label muted" htmlFor="email-to">
          {testMode ? "Cafe's email (not used in test mode)" : "To"}
        </label>
        <input
          id="email-to"
          className="field"
          type="email"
          inputMode="email"
          autoComplete="off"
          autoFocus={!draft.to && !testMode}
          readOnly={testMode}
          aria-describedby={draft.to || testMode ? undefined : "email-to-missing"}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        {!draft.to && !testMode && (
          <span id="email-to-missing" className="quiet">
            No email saved for this invoice. Type one to send.
          </span>
        )}
      </div>
      <div className={styles.field}>
        <span className="label muted">Subject</span>
        <span>{draft.subject}</span>
      </div>
      <pre className={styles.body}>{showFull ? draft.text : shortText}</pre>
      <button type="button" className={styles.more} onClick={() => setShowFull((v) => !v)} aria-expanded={showFull}>
        {showFull ? "Show less" : "Show full email"}
      </button>
      <p className={styles.attachment}>{draft.attachmentName} attached</p>

      <div className={sheet.actions}>
        {(message || draft.lastSent) && (
          <p className={`quiet ${sheet.actionsNote}`} role="status">
            {message || draft.lastSent}
          </p>
        )}
        <button className="btn" type="button" onClick={() => close(onClose)} disabled={sending}>
          Cancel
        </button>
        {/* While it works, the button says so and can't be tapped again, so nothing is sent twice. */}
        <button className="btn btn-primary" type="button" onClick={send} disabled={!canSend} aria-busy={sending}>
          {sending ? "Sending…" : failed ? "Try again" : draft.sendLabel}
        </button>
      </div>
    </>
  );
}
