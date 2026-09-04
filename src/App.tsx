import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

import { CertPickerPage } from "./pages/CertPickerPage";
import { QuizSessionPage } from "./pages/QuizSessionPage";
import { ResultsPage } from "./pages/ResultsPage";

function AppLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <div className="content-width header-content">
          <Link className="brand" to="/">
            cert-prep-open
          </Link>
          <span className="header-tagline">Practice in public</span>
        </div>
      </header>

      <main id="main-content" className="content-width" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<CertPickerPage />} />
          <Route path="/quiz/:certSlug" element={<QuizSessionPage />} />
          <Route path="/results/:certSlug" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="content-width footer-content">
          <p>
            Independent and unofficial. Not affiliated with, endorsed by, or
            sponsored by Anthropic, Microsoft, GitHub, or any certification
            body.
          </p>
          <p>No accounts, analytics, or telemetry.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppLayout />
    </BrowserRouter>
  );
}
