import styles from "./QuizActions.module.css";

export interface QuizActionsProps {
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  canCheckAnswer: boolean;
  hasRequiredSelectionCount: boolean;
  canProceed: boolean;
  finishDescribedById?: string;
  onPrevious: () => void;
  onNext: () => void;
  onCheckAnswer: () => void;
  onFinish: () => void;
  onPause?: () => void;
}

export function QuizActions({
  isFirstQuestion,
  isLastQuestion,
  canCheckAnswer,
  hasRequiredSelectionCount,
  canProceed,
  finishDescribedById,
  onPrevious,
  onNext,
  onCheckAnswer,
  onFinish,
  onPause,
}: QuizActionsProps) {
  return (
    <div className={styles.quizActions}>
      <div className={styles.quizActionsBackward}>
        <button
          className="button button-secondary"
          type="button"
          onClick={onPrevious}
          disabled={isFirstQuestion}
        >
          Previous
        </button>
        {onPause && (
          <button
            className="button button-secondary"
            type="button"
            onClick={onPause}
          >
            Pause
          </button>
        )}
      </div>
      <div className={styles.quizActionsForward}>
        {canCheckAnswer && (
          <button
            className="button button-secondary"
            type="button"
            onClick={onCheckAnswer}
            disabled={!hasRequiredSelectionCount}
          >
            Check answer
          </button>
        )}
        {isLastQuestion ? (
          <button
            className="button button-primary"
            type="button"
            onClick={onFinish}
            disabled={!canProceed}
            aria-describedby={finishDescribedById}
          >
            Finish session
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button
            className="button button-primary"
            type="button"
            onClick={onNext}
            disabled={!canProceed}
          >
            Next question
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  );
}
