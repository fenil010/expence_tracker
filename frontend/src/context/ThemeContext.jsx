import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  const resolved = mode === 'system' ? getSystemTheme() : mode;

  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setMode((prev) => (prev === 'system' ? 'system' : prev));
    // Force re-render by setting state
    const forceUpdate = () => setMode('system');
    mq.addEventListener('change', forceUpdate);
    return () => mq.removeEventListener('change', forceUpdate);
  }, [mode]);

  // Apply class to document
  useEffect(() => {
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolved]);

  const setTheme = useCallback((newMode) => {
    setMode(newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export default ThemeContext;
