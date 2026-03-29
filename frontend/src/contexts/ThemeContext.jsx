import React, { createContext, useState, useContext, useEffect } from 'react';
import { THEMES, ThemeMode } from '../utils/constants';

const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('dp_theme') || 'lavender';
  });

  const [mode, setMode] = useState(() => {
    return localStorage.getItem('dp_mode') || ThemeMode.LIGHT;
  });

  const setTheme = (name) => {
    setThemeName(name);
  };

  const toggleMode = () => {
    setMode(prev => prev === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT);
  };

  // Apply theme when themeName or mode changes
  useEffect(() => {
    const theme = THEMES[themeName];
    if (!theme) {
      // If saved theme doesn't exist, reset to default
      console.warn(`Theme "${themeName}" not found, falling back to lavender`);
      setThemeName('lavender');
      return;
    }

    const colors = theme[mode] || theme.light;
    if (!colors) {
      console.error(`Theme "${themeName}" has no colors for mode "${mode}"`);
      return;
    }

    const root = document.documentElement;

    // Apply all color variables (convert camelCase to kebab-case)
    Object.keys(colors).forEach(key => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${kebabKey}`, colors[key]);
    });

    // Set data attributes
    root.setAttribute('data-theme', themeName);
    root.setAttribute('data-mode', mode);
  }, [themeName, mode]);

  // Persist mode to localStorage
  useEffect(() => {
    localStorage.setItem('dp_mode', mode);
  }, [mode]);

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem('dp_theme', themeName);
  }, [themeName]);

  const currentColors = THEMES[themeName]?.[mode] || THEMES[themeName]?.light || THEMES.aurora?.light || {
    // Ultimate fallback - vibrant colors that won't break anything
    lavender: '#8b5cf6',
    lavender2: '#7c3aed',
    lavender3: '#6d28d9',
    pink: '#ec4899',
    pink2: '#db2777',
    pink3: '#be185d',
    mint: '#10b981',
    mint2: '#059669',
    mint3: '#047857',
    gold: '#f59e0b',
    gold2: '#d97706',
    gold3: '#b45309',
    sky: '#0ea5e9',
    sky2: '#0284c7',
    rose: '#f43f5e',
    rose2: '#e11d48',
    txt: '#111827',
    txt2: '#4b5563',
    txt3: '#6b7280',
    txtLight: '#9ca3af',
    txtDark: '#111827',
    border: '#e5e7eb',
    border2: '#d1d5db',
    borderHover: '#8b5cf6',
    card: '#ffffff',
    card2: '#f9fafb',
    cardShadow: 'rgba(139, 92, 246, 0.2)',
    accent: '#8b5cf6',
    bg: '#ffffff',
    bg2: '#ffffff',
    bg3: '#fafafa'
  };

  const value = {
    themeName,
    mode,
    setTheme,
    setMode,
    toggleMode,
    colors: currentColors,
    themes: Object.keys(THEMES)
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeProvider, ThemeMode };
