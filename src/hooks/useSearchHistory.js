import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage user's recent search queries in localStorage.
 * Restricts the history count to 10 entries max and handles deduplication.
 */
export const useSearchHistory = (maxEntries = 10) => {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('polisroad_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('polisroad_search_history', JSON.stringify(history));
  }, [history]);

  const addSearch = useCallback((query) => {
    if (!query || query.trim().length < 3) return;
    const cleanQuery = query.trim();

    setHistory((prev) => {
      // Remove query if it already exists (deduplication)
      const filtered = prev.filter((item) => item.toLowerCase() !== cleanQuery.toLowerCase());
      // Prepend the new search and slice to max entries
      return [cleanQuery, ...filtered].slice(0, maxEntries);
    });
  }, [maxEntries]);

  const removeSearch = useCallback((query) => {
    setHistory((prev) => prev.filter((item) => item !== query));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  };
};
