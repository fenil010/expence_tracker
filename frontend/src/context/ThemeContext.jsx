import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Color scheme presets
export const COLOR_SCHEMES = {
  default: {
    name: 'Default',
    light: { accent: '#1A1714', secondary: '#3D3830' },
    dark: { accent: '#EFECE5', secondary: '#C4BDB0' }
  },
  ocean: {
    name: 'Ocean',
    light: { accent: '#0ea5e9', secondary: '#0284c7' },
    dark: { accent: '#38bdf8', secondary: '#7dd3fc' }
  },
  forest: {
    name: 'Forest',
    light: { accent: '#10b981', secondary: '#059669' },
    dark: { accent: '#34d399', secondary: '#6ee7b7' }
  },
  sunset: {
    name: 'Sunset',
    light: { accent: '#f97316', secondary: '#ea580c' },
    dark: { accent: '#fb923c', secondary: '#fdba74' }
  },
  lavender: {
    name: 'Lavender',
    light: { accent: '#a855f7', secondary: '#9333ea' },
    dark: { accent: '#c084fc', secondary: '#e9d5ff' }
  },
  rose: {
    name: 'Rose',
    light: { accent: '#f43f5e', secondary: '#e11d48' },
    dark: { accent: '#fb7185', secondary: '#fda4af' }
  }
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  const [colorScheme, setColorScheme] = useState(() => {
    return localStorage.getItem('colorScheme') || 'default';
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('themeAccent') || COLOR_SCHEMES.default.light.accent;
  });

  const resolved = mode === 'system' ? getSystemTheme() : mode;

  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  // Persist color scheme and accent color
  useEffect(() => {
    try {
      localStorage.setItem('colorScheme', colorScheme);
      localStorage.setItem('themeAccent', accentColor);
    } catch (err) {
      console.warn('Failed to save theme preferences:', err);
    }
  }, [colorScheme, accentColor]);

  // Apply accent colors to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    const scheme = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.default;
    const colors = resolved === 'dark' ? scheme.dark : scheme.light;
    
    // Apply scheme colors or custom accent
    const finalAccent = colorScheme === 'custom' ? accentColor : colors.accent;
    const finalSecondary = colorScheme === 'custom' ? accentColor : colors.secondary;
    
    root.style.setProperty('--color-accent', finalAccent);
    root.style.setProperty('--color-accent-secondary', finalSecondary);
  }, [colorScheme, accentColor, resolved]);

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

  const updateColorScheme = useCallback((scheme) => {
    setColorScheme(scheme);
  }, []);

  const updateAccentColor = useCallback((color) => {
    setAccentColor(color);
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      mode, 
      resolved, 
      colorScheme,
      accentColor,
      setTheme, 
      toggleTheme,
      setColorScheme: updateColorScheme,
      setAccentColor: updateAccentColor
    }}>
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
