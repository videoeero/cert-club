import { useEffect, useRef } from "react";

import styles from "./QuizQuestion.module.css";
import { answerCountLabel, scoreAnswer } from "../lib/quiz";
import type { Question, RevealMode } from "../types";

export interface QuizQuestionProps {
  question: Question;
  questionIndex: number;
  domainName?: string;
  isBookmarked: boolean;
  selectedOptionIds: string[];
  struckOptionIds?: string[];
  isRevealed: boolean;
  revealMode: RevealMode;
  onToggleBookmark: () => void;
  onOptionChange: (optionId: string) => void;
  onToggleStrikethrough?: (optionId: string) => void;
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
  fieldsetRef: React.RefObject<HTMLFieldSetElement | null>;
  question: Question;
  selectedOptionIds: string[];
  struckOptionIds: string[];
  isRevealed: boolean;
  revealMode: RevealMode;
  headingId: string;
  instructionId: string;
  onOptionChange: (optionId: string) => void;
  onToggleStrikethrough: (optionId: string) => void;
}

function AnswerOptionList({
  fieldsetRef,
  question,
  selectedOptionIds,
  struckOptionIds,
  isRevealed,
  revealMode,
  headingId,
  instructionId,
  onOptionChange,
  onToggleStrikethrough,
}: AnswerOptionListProps) {
  const requiredAnswerCount = question.correct.length;
  const isSelectionLimitReached =
    question.type === "multi" &&
    selectedOptionIds.length >= requiredAnswerCount;

  return (
    <fieldset
      ref={fieldsetRef}
      tabIndex={-1}
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
        const isStruck = struckOptionIds.includes(option.id);
        const correct = isRevealed && question.correct.includes(option.id);
        const incorrect = isRevealed && selected && !correct;
        const optionDisabled =
          !isRevealed && !selected && isSelectionLimitReached;
        const inputId = `option-${question.id}-${option.id}`;
        return (
          <div
            key={option.id}
            className={[
              styles.answerOption,
              selected ? styles.isSelected : "",
              isStruck ? styles.isStruck : "",
              correct ? styles.isCorrect : "",
              incorrect ? styles.isIncorrect : "",
              optionDisabled ? styles.isDisabled : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onContextMenu={(e) => {
              if (isRevealed) return;
              e.preventDefault();
              onToggleStrikethrough(option.id);
            }}
          >
            <label className={styles.answerOptionLabel} htmlFor={inputId}>
              <input
                id={inputId}
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
              {isStruck ? (
                <s className={styles.strikethroughText}>{option.text}</s>
              ) : (
                <span>{option.text}</span>
              )}
            </label>
            <button
              type="button"
              className={[
                styles.strikethroughButton,
                isStruck ? styles.strikethroughButtonActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={
                isStruck
                  ? `Remove strike through from option ${option.id.toUpperCase()}`
                  : `Strike through option ${option.id.toUpperCase()}`
              }
              aria-pressed={isStruck}
              title={
                isStruck
                  ? "Remove strike through (or right-click)"
                  : "Strike through (or right-click)"
              }
              disabled={isRevealed}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStrikethrough(option.id);
              }}
            >
              <svg
                className={styles.strikethroughIcon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 4H9a3 3 0 0 0-2.83 4" />
                <path d="M14 12a4 4 0 0 1 0 8H6" />
                <line x1="4" y1="12" x2="20" y2="12" />
              </svg>
            </button>
          </div>
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
  struckOptionIds = [],
  isRevealed,
  revealMode,
  onToggleBookmark,
  onOptionChange,
  onToggleStrikethrough = () => {},
}: QuizQuestionProps) {
  const questionHeadingId = `question-heading-${question.id}`;
  const questionInstructionId = `question-instruction-${question.id}`;
  const isCorrect = isRevealed
    ? scoreAnswer(question, selectedOptionIds)
    : false;

  const fieldsetRef = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    if (fieldsetRef.current) {
      fieldsetRef.current.focus();
      if (document.activeElement !== fieldsetRef.current) {
        const legend = fieldsetRef.current.querySelector("legend");
        if (legend instanceof HTMLElement) {
          legend.tabIndex = -1;
          legend.focus();
        }
      }
    }
  }, [questionIndex]);

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
        fieldsetRef={fieldsetRef}
        question={question}
        selectedOptionIds={selectedOptionIds}
        struckOptionIds={struckOptionIds}
        isRevealed={isRevealed}
        revealMode={revealMode}
        headingId={questionHeadingId}
        instructionId={questionInstructionId}
        onOptionChange={onOptionChange}
        onToggleStrikethrough={onToggleStrikethrough}
      />
      {isRevealed && (
        <AnswerFeedback question={question} isCorrect={isCorrect} />
      )}
    </article>
  );
}
