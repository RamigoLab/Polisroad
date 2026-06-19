import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem, removeItem } from '../utils/storage';

const STORAGE_KEY = 'polisroad_search_history';

/**
 * Hook to manage user's recent search queries in localStorage.
 * Uses the storage.js wrapper (btoa encoding) instead of raw localStorage.
 * Restricts the history count to 10 entries max and handles deduplication.
 */
export const useSearchHistory = (maxEntries = 10) => {
  const [history, setHistory] = useState(() => {
    try {
      const saved = getItem(STORAGE_KEY);
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage via obfuscated wrapper
  useEffect(() => {
    setItem(STORAGE_KEY, history);
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
    removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  };
};
