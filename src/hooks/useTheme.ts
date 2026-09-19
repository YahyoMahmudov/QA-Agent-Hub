import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'qa-hub-theme';

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function readSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (document.documentElement.dataset.theme as Theme | undefined) ?? readStoredTheme() ?? readSystemTheme()
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage may be unavailable (private browsing); theme still applies for this session.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
