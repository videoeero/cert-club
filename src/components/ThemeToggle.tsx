import { useState } from "react";

import { getTheme, setTheme, type Theme } from "../lib/theme";
import styles from "./ThemeToggle.module.css";

const THEMES: readonly { readonly id: Theme; readonly label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getTheme());

  const handleSelect = (theme: Theme) => {
    setCurrentTheme(theme);
    setTheme(theme); // also writes the data-theme attribute
  };

  return (
    <div className={styles.toggleGroup} role="group" aria-label="Color theme">
      {THEMES.map(({ id, label }) => {
        const isActive = currentTheme === id;
        return (
          <button
            key={id}
            type="button"
            className={`${styles.toggleButton} button button-secondary ${isActive ? styles.isActive : ""}`}
            aria-pressed={isActive}
            onClick={() => handleSelect(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
