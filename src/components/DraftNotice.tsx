import styles from "./DraftNotice.module.css";

/**
 * Shown wherever a draft bank's questions or score are on screen. A draft
 * bank's questions are reviewed and sourced like any other; what is thin is
 * its coverage of the blueprint, so the number a session produces is not a
 * readiness signal.
 */
export function DraftNotice() {
  return (
    <div className={styles.notice} role="note">
      <span className={styles.label}>Draft bank</span>
      <p>
        This bank covers only part of its exam blueprint so far. The questions
        are sourced and reviewed like any other, but a score here is practice,
        not a readiness signal.
      </p>
    </div>
  );
}
