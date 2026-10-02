import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Theme can be 'light', 'dark', or 'system'
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('openfeedback-theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to OS system preference changes in real-time
  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Compute resolved theme: 'light' or 'dark'
  const resolvedTheme = useMemo(() => {
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    return systemIsDark ? 'dark' : 'light';
  }, [theme, systemIsDark]);

  const isDark = resolvedTheme === 'dark';

  // Apply dark class to <html> and <body>
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isDark) {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
    }

    try {
      localStorage.setItem('openfeedback-theme', theme);
    } catch {
      // ignore
    }
  }, [theme, isDark]);

  function setMode(mode) {
    if (mode === 'light' || mode === 'dark' || mode === 'system') {
      setTheme(mode);
    }
  }

  function toggleTheme() {
    setTheme((prev) => (resolvedTheme === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        isDark,
        setMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
