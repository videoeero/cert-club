import styles from "./QuizActions.module.css";

export interface QuizActionsProps {
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  canCheckAnswer: boolean;
  hasRequiredSelectionCount: boolean;
  canProceed: boolean;
  finishErrorId?: string;
  onPrevious: () => void;
  onNext: () => void;
  onCheckAnswer: () => void;
  onFinish: () => void;
}

export function QuizActions({
  isFirstQuestion,
  isLastQuestion,
  canCheckAnswer,
  hasRequiredSelectionCount,
  canProceed,
  finishErrorId,
  onPrevious,
  onNext,
  onCheckAnswer,
  onFinish,
}: QuizActionsProps) {
  return (
    <div className={styles.quizActions}>
      <button
        className="button button-secondary"
        type="button"
        onClick={onPrevious}
        disabled={isFirstQuestion}
      >
        Previous
      </button>
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
            aria-describedby={finishErrorId}
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
