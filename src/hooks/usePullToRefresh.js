/**
 * usePullToRefresh.js
 * Rileva il gesto "tira verso il basso" per aggiornare i dati.
 * Attivo solo quando lo scroll del contenitore è già a 0.
 * Mostra un indicatore visivo durante il trascinamento e il refresh.
 *
 * @param {Function} onRefresh - callback async da chiamare per aggiornare i dati
 * @param {React.RefObject} scrollRef - ref del div scrollabile (di solito il pageContent)
 * @param {boolean} enabled - attiva/disattiva il gesto (default true)
 * @returns {{ isPulling, isRefreshing, pullProgress }} - stato per il rendering dell'indicatore
 */
import { useState, useRef, useCallback, useEffect } from 'react';

const THRESHOLD = 72;   // px di trascinamento per attivare il refresh
const MAX_PULL  = 100;  // px massimi di spostamento visivo

export const usePullToRefresh = (onRefresh, scrollRef, enabled = true) => {
  const [isPulling, setIsPulling]       = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0); // 0-1

  const startY   = useRef(null);
  const pulling  = useRef(false);

  const handleTouchStart = useCallback((e) => {
    const el = scrollRef?.current;
    if (!enabled || isRefreshing) return;
    if (el && el.scrollTop > 0) return; // non attivare se non siamo in cima
    startY.current = e.touches[0].clientY;
    pulling.current = false;
  }, [enabled, isRefreshing, scrollRef]);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) { startY.current = null; return; }

    pulling.current = true;
    setIsPulling(true);
    setPullProgress(Math.min(dy / MAX_PULL, 1));
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) { startY.current = null; return; }
    const progress = Math.min((pullProgress * MAX_PULL) / THRESHOLD, 1);
    setIsPulling(false);
    startY.current = null;
    pulling.current = false;

    if (progress >= 1) {
      setIsRefreshing(true);
      setPullProgress(0);
      try {
        await onRefresh?.();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullProgress(0);
    }
  }, [pullProgress, onRefresh]);

  useEffect(() => {
    if (!enabled) return;
    const el = scrollRef?.current || document;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove',  handleTouchMove,  { passive: true });
    el.addEventListener('touchend',   handleTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove',  handleTouchMove);
      el.removeEventListener('touchend',   handleTouchEnd);
    };
  }, [enabled, scrollRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isPulling, isRefreshing, pullProgress };
};
