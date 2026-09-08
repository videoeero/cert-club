import type { StorageAdapter } from "./storage";

/* Kept as a bare string under its own key, not inside the versioned
 * preferences blob, because the inline script in index.html must read it
 * synchronously before any module loads. That script, STORAGE_KEYS.theme
 * and this constant are three copies of one string; the "theme storage key"
 * test in test/theme.test.mjs holds them together. */
export const THEME_STORAGE_KEY = "cert-club.theme";

export type Theme = "light" | "dark" | "system";

function resolveStorage(storage?: StorageAdapter): StorageAdapter | undefined {
  if (storage) {
    return storage;
  }
  try {
    if (typeof globalThis.localStorage !== "undefined") {
      return globalThis.localStorage;
    }
  } catch {
    // localStorage unavailable
  }
  return undefined;
}

export function getTheme(storage?: StorageAdapter): Theme {
  const store = resolveStorage(storage);
  if (!store) {
    return "system";
  }
  try {
    const raw = store.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark") {
      return raw;
    }
  } catch {
    // ignore read error
  }
  return "system";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") {
    return;
  }
  if (theme === "system") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme;
  }
}

export function setTheme(theme: Theme, storage?: StorageAdapter): void {
  const store = resolveStorage(storage);
  if (store) {
    try {
      if (theme === "system") {
        if (typeof store.removeItem === "function") {
          store.removeItem(THEME_STORAGE_KEY);
        } else {
          store.setItem(THEME_STORAGE_KEY, "");
        }
      } else {
        store.setItem(THEME_STORAGE_KEY, theme);
      }
    } catch {
      // ignore storage write errors
    }
  }
  applyTheme(theme);
}
