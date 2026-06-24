/**
 * haptics.js — Vibrazione aptica via Web Vibration API.
 * Degrada silenziosamente su dispositivi non supportati.
 */

const canVibrate = () =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

/** Tap leggero — azione minore (es. toggle preferito) */
export const hapticLight = () => {
  if (canVibrate()) navigator.vibrate(40);
};

/** Tap medio — azione importante (es. salvataggio, conferma) */
export const hapticMedium = () => {
  if (canVibrate()) navigator.vibrate(80);
};

/** Pattern di successo — azione completata (es. contestazione, badge sbloccato) */
export const hapticSuccess = () => {
  if (canVibrate()) navigator.vibrate([50, 30, 80]);
};

/** Pattern di errore — qualcosa è andato storto */
export const hapticError = () => {
  if (canVibrate()) navigator.vibrate([80, 40, 80, 40, 80]);
};
