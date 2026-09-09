import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

import logoUrl from "./assets/logo.svg";
import { ThemeToggle } from "./components";
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
            <img
              src={logoUrl}
              alt=""
              aria-hidden="true"
              className="brand-logo"
              width="32"
              height="32"
            />
            <span>Cert Club</span>
          </Link>
          <div className="header-actions">
            <span className="header-tagline">Rule one: talk about it</span>
            <ThemeToggle />
          </div>
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
          <div className="footer-legal">
            <p>
              Independent and unofficial. Not affiliated with, endorsed by, or
              sponsored by Anthropic, Microsoft, Amazon Web Services, or any
              certification body.
            </p>
            <p>No accounts, analytics, or telemetry.</p>
          </div>
          <p className="footer-links">
            <a
              className="footer-link"
              href="https://github.com/videoeero/cert-club"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source on GitHub
            </a>
            <a
              className="footer-link"
              href="https://github.com/videoeero"
              target="_blank"
              rel="noopener noreferrer"
            >
              The first member of Cert Club
            </a>
          </p>
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
