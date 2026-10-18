// Job: PIN entry screen.
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import { api } from "@/lib/api/client";
import styles from "./pin.module.css";

export default function PinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await api("/api/session", { method: "POST", body: { pin } });
    setBusy(false);
    if (result.ok) {
      router.replace("/count");
      router.refresh();
    } else {
      setMessage(result.status === 401 ? "That's not it." : result.message);
      setPin("");
    }
  }

  return (
    <main className={styles.page}>
      <Wordmark size="lg" />
      <form className={styles.form} onSubmit={submit}>
        <label className="label" htmlFor="pin">
          PIN
        </label>
        <input
          id="pin"
          className={`field ${styles.pin}`}
          inputMode="numeric"
          autoComplete="current-password"
          type="password"
          maxLength={4}
          pattern="\d{4}"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
            setMessage("");
          }}
          autoFocus
        />
        <p className="quiet" role="status">
          {message}
        </p>
        <button className="btn btn-primary" type="submit" disabled={pin.length !== 4 || busy}>
          Enter
        </button>
      </form>
    </main>
  );
}
