// Job: the small "?" in the top corner that opens the How it works page.
import Link from "next/link";
import styles from "./HelpLink.module.css";

export function HelpLink() {
  return (
    <Link href="/help" className={styles.help} aria-label="How it works" title="How it works" data-print-hide>
      ?
    </Link>
  );
}
