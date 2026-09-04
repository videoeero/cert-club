export interface Domain {
  slug: string;
  name: string;
  weight: number;
}

export interface Manifest {
  schemaVersion: number;
  cert: string;
  name: string;
  examUrl: string;
  contentLicense: string;
  examQuestionCount?: number;
  examDurationMinutes?: number;
  domains: Domain[];
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  cert: string;
  schemaVersion: number;
  type: "single" | "multi";
  domain: string;
  subdomain?: string;
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "reviewed";
  stem: string;
  options: QuestionOption[];
  correct: string[];
  explanation: string;
  distractorNotes?: Record<string, string>;
  sourceUrl: string;
  sourceNote: string;
  sourceCheckedAt: string;
}

export interface CertContent {
  manifest: Manifest;
  questions: Question[];
}

export type QuestionSelectionMode =
  "all" | "domain" | "random" | "weighted" | "review";

export type ReviewScope = "missed" | "bookmarked" | "missed-or-bookmarked";

export type RevealMode = "immediate" | "end";

export type SimulationPreset =
  "perfect-pass" | "realistic-pass" | "borderline-fail" | "complete-fail";

export interface QuizSelectionConfig {
  mode: QuestionSelectionMode;
  count?: number;
  domain?: string;
  reviewScope?: ReviewScope;
}

export interface QuizConfig extends QuizSelectionConfig {
  revealMode: RevealMode;
}

export type AnswerMap = Record<string, string[]>;

export interface QuestionResult {
  questionId: string;
  domain: string;
  selectedOptionIds: string[];
  answered: boolean;
  isCorrect: boolean;
}

export interface DomainBreakdown {
  slug: string;
  name: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
}

export interface QuizResults {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  questionResults: QuestionResult[];
  domainBreakdown: DomainBreakdown[];
}

export interface AttemptRecord {
  id: string;
  cert: string;
  startedAt: string;
  completedAt: string;
  config: QuizConfig;
  questionIds: string[];
  answers: AnswerMap;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  domainBreakdown: DomainBreakdown[];
}
