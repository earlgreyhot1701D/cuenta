// Job: app frame with the header wordmark and the bottom nav.
import { BottomNav } from "@/components/nav/BottomNav";
import { HelpLink } from "@/components/ui/HelpLink";
import { Wordmark } from "@/components/ui/Wordmark";
import styles from "./app.module.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className={styles.header} data-print-hide>
        <Wordmark />
        <HelpLink />
      </header>
      <main className={styles.main} data-print-main>{children}</main>
      <BottomNav />
    </>
  );
}
