interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "Loading content...",
}: LoadingStateProps) {
  return (
    <div className="state-card" role="status" aria-live="polite">
      <span className="loading-dot" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="state-card error-card" role="alert">
      <p className="eyebrow">Content unavailable</p>
      <h2>We could not load this page.</h2>
      <p>{error.message}</p>
      <button
        className="button button-secondary"
        type="button"
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  );
}
