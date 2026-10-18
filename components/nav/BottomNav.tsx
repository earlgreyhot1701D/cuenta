// Job: the four-tab bottom nav (the unsaved-changes guard joins in slice 8).
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

const TABS = [
  { href: "/count", label: "Count" },
  { href: "/deliver", label: "Deliver" },
  { href: "/ledger", label: "Ledger" },
  { href: "/customers", label: "Customers" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Main" data-print-hide>
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`label ${styles.tab} ${active ? styles.active : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
