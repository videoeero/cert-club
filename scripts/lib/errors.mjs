/**
 * Shared error shape for the content tooling: collect every problem, then throw
 * once. Failing on the first bad field would make an author fix one thing per
 * run, so every script here accumulates messages and reports them together.
 */
export class AggregateMessageError extends Error {
  constructor(headline, messages = []) {
    // An empty list means the headline has to stand alone; appending a bare
    // newline would produce an error that says nothing.
    super(
      messages.length > 0
        ? `${headline}\n${messages.map((message) => `- ${message}`).join("\n")}`
        : headline,
    );
    this.name = "AggregateMessageError";
    this.messages = [...messages];
  }
}

export class ContentValidationError extends AggregateMessageError {
  constructor(messages = []) {
    super("Content validation failed:", messages);
    this.name = "ContentValidationError";
  }
}
