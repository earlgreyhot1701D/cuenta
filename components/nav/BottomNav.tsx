// Job: the four-tab bottom nav, which asks before leaving a form with unsaved entries.
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { setUnsaved, unsavedPrompt } from "./unsaved";
import { Confirm } from "@/components/ui/Confirm";
import styles from "./BottomNav.module.css";

const TABS = [
  { href: "/count", label: "Count" },
  { href: "/deliver", label: "Deliver" },
  { href: "/ledger", label: "Ledger" },
  { href: "/customers", label: "Customers" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState<{ href: string; question: string } | null>(null);

  return (
    <>
      <nav className={styles.nav} aria-label="Main" data-print-hide>
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`label ${styles.tab} ${active ? styles.active : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={(e) => {
                const question = unsavedPrompt();
                if (!question) return;
                e.preventDefault();
                setPending({ href: tab.href, question });
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {pending && (
        <Confirm
          message={pending.question}
          confirmLabel="Discard"
          onCancel={() => setPending(null)}
          onConfirm={() => {
            setUnsaved(null);
            setPending(null);
            router.push(pending.href);
          }}
        />
      )}
    </>
  );
}
