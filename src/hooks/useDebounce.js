import { useState, useEffect } from 'react';

/**
 * Hook per debounce di un valore.
 * @param {*} value Valore da debounce.
 * @param {number} delay Ritardo in ms (default 300).
 * @returns {*} Valore debounce.
 */
export const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};
