// Job: load ledger rows and stats for all cafes or one, newest delivery first.
import Link from "next/link";
import { LedgerList } from "@/components/ledger/LedgerList";
import type { LedgerRowData } from "@/components/ledger/LedgerRow";
import { StatRow } from "@/components/ledger/StatRow";
import { todayPacific } from "@/lib/dates";
import { ledgerStats, rowState } from "@/lib/ledger-stats";
import { listCustomers } from "@/lib/queries/customers";
import { listLedger } from "@/lib/queries/ledger";
import styles from "./ledger.module.css";

export const dynamic = "force-dynamic";

export default async function LedgerPage({ searchParams }: { searchParams: Promise<{ cafe?: string }> }) {
  const today = todayPacific();
  const cafes = await listCustomers();
  const requested = (await searchParams).cafe;
  const cafe = cafes.find((c) => c.id === requested);
  const records = await listLedger(cafe?.id);

  // Stats follow the filter: on a cafe's chip they show what that cafe owes.
  const stats = ledgerStats(records, today);
  const rows: LedgerRowData[] = records.map((r) => ({
    id: r.id,
    number: r.number,
    cafeName: r.cafeName,
    invoiceDate: r.invoiceDate,
    totalCents: r.totalCents,
    paidOn: r.paidOn,
    paidReference: r.paidReference,
    emailed: !!r.emailSentAt,
    ...rowState(r, today),
  }));

  const chips = [{ id: undefined, label: "All" }, ...cafes.map((c) => ({ id: c.id, label: c.name }))];

  return (
    <>
      <h1>Ledger</h1>
      <StatRow {...stats} />
      <nav className={styles.chips} aria-label="Filter by cafe">
        {chips.map((chip) => {
          const active = chip.id === cafe?.id;
          return (
            <Link
              key={chip.label}
              href={chip.id ? `/ledger?cafe=${chip.id}` : "/ledger"}
              className={`label ${styles.chip} ${active ? styles.active : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {chip.label}
            </Link>
          );
        })}
      </nav>
      <LedgerList rows={rows} today={today} />
    </>
  );
}
