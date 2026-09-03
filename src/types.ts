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
