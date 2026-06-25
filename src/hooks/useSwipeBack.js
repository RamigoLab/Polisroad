/**
 * useSwipeBack.js
 * Rileva uno swipe orizzontale da sinistra verso destra per tornare indietro.
 * Soglia: ≥60px orizzontali con <40px verticali (evita conflitti con lo scroll).
 *
 * @param {Function} onBack - callback da chiamare quando il gesto è rilevato
 * @param {boolean} enabled - attiva/disattiva il gesto (default true)
 */
import { useEffect, useRef } from 'react';

export const useSwipeBack = (onBack, enabled = true) => {
  const touchStart = useRef(null);

  useEffect(() => {
    if (!enabled || !onBack) return;

    const handleTouchStart = (e) => {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
    };

    const handleTouchEnd = (e) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = Math.abs(t.clientY - touchStart.current.y);
      touchStart.current = null;

      // Swipe verso destra, abbastanza orizzontale, partendo dal bordo sinistro
      if (dx >= 60 && dy < 40) {
        onBack();
      }
    };

    const handleTouchCancel = () => { touchStart.current = null; };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [onBack, enabled]);
};
