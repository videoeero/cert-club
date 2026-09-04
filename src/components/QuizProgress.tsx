import styles from "./QuizProgress.module.css";
import { formatRemainingTime } from "../lib/time";

export interface QuizProgressProps {
  currentIndex: number;
  totalQuestions: number;
  examDurationMinutes?: number;
  startedAt: string;
  currentTime: number;
}

export function QuizProgress({
  currentIndex,
  totalQuestions,
  examDurationMinutes,
  startedAt,
  currentTime,
}: QuizProgressProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const totalDurationSeconds = (examDurationMinutes ?? 0) * 60;
  const elapsedSeconds = Math.max(
    0,
    Math.floor((currentTime - new Date(startedAt).getTime()) / 1000),
  );
  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
  const isTimeExpired = totalDurationSeconds > 0 && remainingSeconds === 0;
  const isTimeLow =
    totalDurationSeconds > 0 && remainingSeconds > 0 && remainingSeconds <= 300;

  return (
    <div
      className={styles.progressBlock}
      aria-label={`Question ${currentIndex + 1} of ${totalQuestions}`}
    >
      <div className={styles.progressLabel} aria-live="polite">
        <span>
          Question <strong>{currentIndex + 1}</strong> of {totalQuestions}
        </span>
        {examDurationMinutes ? (
          <span
            className={`${styles.timerBadge} ${isTimeExpired ? styles.isExpired : isTimeLow ? styles.isWarning : ""}`}
            role="timer"
            aria-label={`Time remaining: ${formatRemainingTime(remainingSeconds)}`}
          >
            <span aria-hidden="true">⏱</span>
            <span>
              {isTimeExpired ? (
                <strong>Time expired (00:00)</strong>
              ) : (
                <>
                  Time left:{" "}
                  <strong>{formatRemainingTime(remainingSeconds)}</strong>
                </>
              )}
            </span>
          </span>
        ) : null}
        <span>{Math.round(progress)}%</span>
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-valuetext={`Question ${currentIndex + 1} of ${totalQuestions}`}
      >
        <div
          className={styles.progressValue}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
