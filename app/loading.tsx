import styles from "@/components/loading.module.css";

export default function Loading() {
  return (
    <main className={styles.loading}>
      <div className={styles.status} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <p>Loading…</p>
      </div>
    </main>
  );
}
