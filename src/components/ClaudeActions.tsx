import { useEffect, useState } from "react";

import { CLAUDE_NEW_CHAT_URL, claudeChatUrl } from "../lib/claude";
import styles from "./ClaudeActions.module.css";

type CopyState = "idle" | "copied" | "failed";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function useCopy(text: string): [CopyState, () => void] {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timeout = setTimeout(() => setState("idle"), 2500);
    return () => clearTimeout(timeout);
  }, [state]);

  const copy = () => {
    void copyText(text).then((ok) => setState(ok ? "copied" : "failed"));
  };
  return [state, copy];
}

function copyLabel(state: CopyState, idleLabel: string): string {
  if (state === "copied") return "Copied";
  if (state === "failed") return "Copy failed";
  return idleLabel;
}

export interface ExplainWithClaudeProps {
  prompt: string;
}

/** Shown beside a missed question: opens claude.ai with the prompt typed in. */
export function ExplainWithClaude({ prompt }: ExplainWithClaudeProps) {
  const [copyState, copy] = useCopy(prompt);

  return (
    <div className={styles.explainRow}>
      <a
        className="button button-secondary"
        href={claudeChatUrl(prompt)}
        target="_blank"
        rel="noreferrer"
      >
        Explain with Claude
        <span aria-hidden="true">↗</span>
      </a>
      <button type="button" className="button button-secondary" onClick={copy}>
        {copyLabel(copyState, "Copy prompt")}
      </button>
      <span className="sr-only" role="status">
        {copyState === "copied" ? "Prompt copied to clipboard." : ""}
        {copyState === "failed" ? "Could not copy the prompt." : ""}
      </span>
    </div>
  );
}

export interface ClaudeExportProps {
  exportText: string;
  missedCount: number;
  fileName: string;
}

/** Results-page card: every missed question as one pasteable study prompt. */
export function ClaudeExport({
  exportText,
  missedCount,
  fileName,
}: ClaudeExportProps) {
  const [copyState, copy] = useCopy(exportText);

  if (missedCount === 0) {
    return (
      <section className={styles.exportCard} aria-labelledby="claude-heading">
        <h2 id="claude-heading" className={styles.exportTitle}>
          Study with Claude
        </h2>
        <p className={styles.exportHint}>
          Nothing to export — every question in this session was correct.
        </p>
      </section>
    );
  }

  const download = () => {
    const url = URL.createObjectURL(
      new Blob([exportText], { type: "text/markdown;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className={styles.exportCard} aria-labelledby="claude-heading">
      <h2 id="claude-heading" className={styles.exportTitle}>
        Study with Claude
      </h2>
      <p className={styles.exportHint}>
        Export the {missedCount} question{missedCount === 1 ? "" : "s"} you
        missed — with your answer, the correct answer, the explanation and the
        source — as one prompt to paste into Claude or another assistant.
      </p>
      <div className={styles.exportActions}>
        <button type="button" className="button button-primary" onClick={copy}>
          {copyLabel(
            copyState,
            `Copy ${missedCount} missed question${missedCount === 1 ? "" : "s"}`,
          )}
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={download}
        >
          Download .md
        </button>
        <a
          className="button button-secondary"
          href={CLAUDE_NEW_CHAT_URL}
          target="_blank"
          rel="noreferrer"
        >
          Open Claude
          <span aria-hidden="true">↗</span>
        </a>
      </div>
      <span className="sr-only" role="status">
        {copyState === "copied" ? "Missed questions copied to clipboard." : ""}
        {copyState === "failed" ? "Could not copy. Use the preview below." : ""}
      </span>
      <details className={styles.exportPreview}>
        <summary>Preview the export</summary>
        <textarea
          className={styles.exportText}
          readOnly
          rows={12}
          value={exportText}
          aria-label="Missed questions export text"
          onFocus={(event) => event.currentTarget.select()}
        />
      </details>
    </section>
  );
}
