// Job: the La Condesa wordmark used in the app header and on the PIN screen.
import styles from "./Wordmark.module.css";

export function Wordmark({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <div className={`${styles.mark} ${size === "lg" ? styles.lg : ""}`} aria-label="La Condesa Baking Company">
      <span className={styles.name}>La Condesa</span>
      <span className={styles.sub}>Baking Company</span>
    </div>
  );
}
