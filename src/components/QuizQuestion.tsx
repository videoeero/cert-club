import styles from "./QuizQuestion.module.css";
import { answerCountLabel, scoreAnswer } from "../lib/quiz";
import type { Question, RevealMode } from "../types";

export interface QuizQuestionProps {
  question: Question;
  questionIndex: number;
  domainName?: string;
  isBookmarked: boolean;
  selectedOptionIds: string[];
  isRevealed: boolean;
  revealMode: RevealMode;
  onToggleBookmark: () => void;
  onOptionChange: (optionId: string) => void;
}

interface QuestionHeaderProps {
  domainName: string;
  difficulty: string;
  isMulti: boolean;
  isBookmarked: boolean;
  questionIndex: number;
  onToggleBookmark: () => void;
}

function QuestionHeader({
  domainName,
  difficulty,
  isMulti,
  isBookmarked,
  questionIndex,
  onToggleBookmark,
}: QuestionHeaderProps) {
  return (
    <div className={styles.questionCardHeader}>
      <div className={styles.questionMeta}>
        <span>{domainName}</span>
        <span>{difficulty}</span>
        <span>{isMulti ? "Multiple response" : "Single response"}</span>
      </div>
      <button
        className={`${styles.bookmarkButton} button button-secondary`}
        type="button"
        aria-pressed={isBookmarked}
        aria-label={
          isBookmarked
            ? `Remove bookmark from question ${questionIndex + 1}`
            : `Bookmark question ${questionIndex + 1}`
        }
        onClick={onToggleBookmark}
      >
        {isBookmarked ? "Bookmarked" : "Bookmark"}
      </button>
    </div>
  );
}

interface AnswerOptionListProps {
  question: Question;
  selectedOptionIds: string[];
  isRevealed: boolean;
  revealMode: RevealMode;
  headingId: string;
  instructionId: string;
  onOptionChange: (optionId: string) => void;
}

function AnswerOptionList({
  question,
  selectedOptionIds,
  isRevealed,
  revealMode,
  headingId,
  instructionId,
  onOptionChange,
}: AnswerOptionListProps) {
  const requiredAnswerCount = question.correct.length;
  const isSelectionLimitReached =
    question.type === "multi" &&
    selectedOptionIds.length >= requiredAnswerCount;

  return (
    <fieldset
      className={styles.answerOptionList}
      disabled={isRevealed}
      aria-describedby={instructionId}
    >
      <legend
        className={styles.questionStem}
        id={headingId}
        role="heading"
        aria-level={2}
      >
        {question.stem}
      </legend>
      <p id={instructionId} className={styles.questionInstruction}>
        Select {answerCountLabel(requiredAnswerCount)} answer
        {requiredAnswerCount === 1 ? "" : "s"}.
        {revealMode === "end" &&
          " Answers and explanations appear after you finish."}
      </p>
      {question.options.map((option) => {
        const selected = selectedOptionIds.includes(option.id);
        const correct = isRevealed && question.correct.includes(option.id);
        const incorrect = isRevealed && selected && !correct;
        const optionDisabled =
          !isRevealed && !selected && isSelectionLimitReached;
        return (
          <label
            className={[
              styles.answerOption,
              selected ? styles.isSelected : "",
              correct ? styles.isCorrect : "",
              incorrect ? styles.isIncorrect : "",
              optionDisabled ? styles.isDisabled : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={option.id}
          >
            <input
              type={question.type === "multi" ? "checkbox" : "radio"}
              name={question.id}
              value={option.id}
              checked={selected}
              disabled={optionDisabled}
              onChange={() => onOptionChange(option.id)}
            />
            <span className={styles.optionId} aria-hidden="true">
              {option.id.toUpperCase()}
            </span>
            <span>{option.text}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

interface AnswerFeedbackProps {
  question: Question;
  isCorrect: boolean;
}

function AnswerFeedback({ question, isCorrect }: AnswerFeedbackProps) {
  return (
    <div
      className={`${styles.answerFeedback} ${
        isCorrect ? styles.isCorrect : styles.isIncorrect
      }`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <strong>{isCorrect ? "Correct." : "Not quite."}</strong>
      <p>
        <strong>Correct answer:</strong>{" "}
        {question.correct.map((optionId) => optionId.toUpperCase()).join(", ")}
      </p>
      <p>{question.explanation}</p>
      <p className={styles.sourceNote}>
        <a href={question.sourceUrl} target="_blank" rel="noreferrer">
          Source: {question.sourceNote}
        </a>
      </p>
    </div>
  );
}

export function QuizQuestion({
  question,
  questionIndex,
  domainName,
  isBookmarked,
  selectedOptionIds,
  isRevealed,
  revealMode,
  onToggleBookmark,
  onOptionChange,
}: QuizQuestionProps) {
  const questionHeadingId = `question-heading-${question.id}`;
  const questionInstructionId = `question-instruction-${question.id}`;
  const isCorrect = isRevealed
    ? scoreAnswer(question, selectedOptionIds)
    : false;

  return (
    <article
      className={styles.questionCard}
      aria-labelledby={questionHeadingId}
    >
      <QuestionHeader
        domainName={domainName ?? question.domain}
        difficulty={question.difficulty}
        isMulti={question.type === "multi"}
        isBookmarked={isBookmarked}
        questionIndex={questionIndex}
        onToggleBookmark={onToggleBookmark}
      />
      <AnswerOptionList
        question={question}
        selectedOptionIds={selectedOptionIds}
        isRevealed={isRevealed}
        revealMode={revealMode}
        headingId={questionHeadingId}
        instructionId={questionInstructionId}
        onOptionChange={onOptionChange}
      />
      {isRevealed && (
        <AnswerFeedback question={question} isCorrect={isCorrect} />
      )}
    </article>
  );
}
