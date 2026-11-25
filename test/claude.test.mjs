import assert from "node:assert/strict";
import test from "node:test";

import {
  CLAUDE_NEW_CHAT_URL,
  buildExplainPrompt,
  buildMissedQuestionsExport,
  claudeChatUrl,
  formatQuestionForClaude,
} from "../src/lib/claude.ts";

function question(overrides = {}) {
  return {
    id: "q1",
    cert: "demo",
    schemaVersion: 1,
    type: "single",
    domain: "storage",
    difficulty: "medium",
    status: "reviewed",
    stem: "Which service stores objects?",
    options: [
      { id: "c", text: "Queue service" },
      { id: "a", text: "Object storage" },
      { id: "b", text: "Block storage" },
    ],
    correct: ["a"],
    explanation: "Object storage stores objects.",
    distractorNotes: { b: "Block storage exposes volumes." },
    sourceUrl: "https://example.com/docs",
    sourceNote: "Storage overview",
    sourceCheckedAt: "2026-01-01",
    ...overrides,
  };
}

test("formatQuestionForClaude letters options in displayed order", () => {
  const text = formatQuestionForClaude(question(), ["b"], "Storage");

  assert.match(text, /Domain: Storage · Difficulty: medium/);
  assert.match(
    text,
    /A\. Queue service\nB\. Object storage\nC\. Block storage/,
  );
  assert.match(text, /My answer: C\n/);
  assert.match(text, /Correct answer: B\n/);
  assert.match(text, /- C: Block storage exposes volumes\./);
  assert.match(text, /Source: Storage overview — https:\/\/example\.com\/docs/);
});

test("formatQuestionForClaude reports a skipped question and omits empty notes", () => {
  const text = formatQuestionForClaude(
    question({ distractorNotes: undefined }),
    [],
  );

  assert.match(text, /My answer: \(no answer\)/);
  assert.match(text, /Domain: storage/);
  assert.doesNotMatch(text, /Why the other options are wrong/);
});

test("buildExplainPrompt names the certification and embeds the question", () => {
  const prompt = buildExplainPrompt("Demo Cert", question(), ["c"]);

  assert.match(prompt, /studying for the Demo Cert certification/);
  assert.match(prompt, /Which service stores objects\?/);
  assert.match(prompt, /My answer: A\n/);
});

test("buildMissedQuestionsExport numbers every missed question", () => {
  const missed = [
    { question: question({ id: "one" }), selectedOptionIds: ["b"] },
    { question: question({ id: "two" }), selectedOptionIds: [] },
  ];
  const text = buildMissedQuestionsExport("Demo Cert", missed, 5);

  assert.match(text, /Demo Cert practice session and missed 2 of 5 questions/);
  assert.match(text, /## Question 1 of 2/);
  assert.match(text, /## Question 2 of 2/);
});

test("claudeChatUrl prefills short prompts and falls back for long ones", () => {
  assert.equal(
    claudeChatUrl("why? a&b"),
    `${CLAUDE_NEW_CHAT_URL}?q=why%3F%20a%26b`,
  );
  assert.equal(claudeChatUrl("x".repeat(10000)), CLAUDE_NEW_CHAT_URL);
});
