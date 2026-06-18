import { useState, useEffect } from 'react';

/**
 * Custom hook to manage the dark/light theme dynamically.
 * Synchronizes with localStorage and system preferences.
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('polisroad_theme');
    if (saved) return saved;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  const isDarkMode = theme === 'dark';

  const applyThemeColor = (validTheme) => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', validTheme === 'dark' ? '#0d1117' : '#1a3a5c');
    }
  };

  const setTheme = (newTheme) => {
    const validTheme = newTheme === 'dark' ? 'dark' : 'light';
    setThemeState(validTheme);
    localStorage.setItem('polisroad_theme', validTheme);
    if (validTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    applyThemeColor(validTheme);
  };

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  // Sync with system preferences dynamically if no user override exists
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const saved = localStorage.getItem('polisroad_theme');
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Ensure document matches current theme state on mount/change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    applyThemeColor(theme);
  }, [theme]);

  return {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme,
  };
};
