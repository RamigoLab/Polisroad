/**
 * AppLockContext.jsx
 * Stato dello sblocco rapido: se è attivo, se l'app è bloccata in questo
 * momento, timeout di inattività, credenziale biometrica locale.
 * Tutto locale al dispositivo (localStorage) — non è una sessione Supabase,
 * è un "cancello" sopra una sessione già autenticata.
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { hasPin, verifyPin, setPin as savePin, clearPin } from '../utils/pinStorage';
import { registerLocalCredential, verifyLocalCredential, isPlatformAuthenticatorAvailable } from '../utils/webauthn';

const SETTINGS_KEY = 'polisroad_lock_settings';
const MAX_PIN_ATTEMPTS = 5;
const DEFAULT_TIMEOUT_MIN = 5;

const readSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignora, torna ai default */ }
  return { enabled: false, timeoutMinutes: DEFAULT_TIMEOUT_MIN, credentialId: null };
};

const AppLockContext = createContext(null);

export const AppLockProvider = ({ children }) => {
  const [settings, setSettings] = useState(readSettings);
  const [isLocked, setIsLocked] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [forceReauth, setForceReauth] = useState(false); // troppi PIN sbagliati: serve login vero
  const timerRef = useRef(null);
  const enabledRef = useRef(settings.enabled);
  useEffect(() => {
    enabledRef.current = settings.enabled;
  }, [settings.enabled]);

  const persist = (next) => {
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!enabledRef.current) return;
    timerRef.current = setTimeout(() => {
      setIsLocked(true);
    }, settings.timeoutMinutes * 60 * 1000);
  }, [settings.timeoutMinutes]);

  // Timer di inattività: qualunque interazione lo resetta
  useEffect(() => {
    if (!settings.enabled) return;
    const events = ['mousemove', 'touchstart', 'keydown', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => events.forEach(e => window.removeEventListener(e, resetTimer));
  }, [settings.enabled, resetTimer]);

  // Blocco immediato quando l'app va in background (cambio app, spegnimento schermo)
  useEffect(() => {
    if (!settings.enabled) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setIsLocked(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [settings.enabled]);

  const enable = async (pin) => {
    await savePin(pin);
    persist({ ...settings, enabled: true });
  };

  const disable = () => {
    clearPin();
    persist({ enabled: false, timeoutMinutes: settings.timeoutMinutes, credentialId: null });
    setIsLocked(false);
  };

  const setTimeoutMinutes = (minutes) => {
    persist({ ...settings, timeoutMinutes: minutes });
  };

  const registerBiometric = async (displayName) => {
    const credentialId = await registerLocalCredential(displayName);
    persist({ ...settings, credentialId });
    return credentialId;
  };

  const removeBiometric = () => {
    persist({ ...settings, credentialId: null });
  };

  const unlockWithBiometric = async () => {
    if (!settings.credentialId) return false;
    const ok = await verifyLocalCredential(settings.credentialId);
    if (ok) {
      setIsLocked(false);
      setFailedAttempts(0);
    }
    return ok;
  };

  const unlockWithPin = async (pin) => {
    const ok = await verifyPin(pin);
    if (ok) {
      setIsLocked(false);
      setFailedAttempts(0);
      return true;
    }
    const next = failedAttempts + 1;
    setFailedAttempts(next);
    if (next >= MAX_PIN_ATTEMPTS) {
      setForceReauth(true);
    }
    return false;
  };

  const lockNow = () => setIsLocked(true);

  const value = {
    enabled: settings.enabled,
    timeoutMinutes: settings.timeoutMinutes,
    hasBiometric: !!settings.credentialId,
    isLocked,
    failedAttempts,
    attemptsRemaining: MAX_PIN_ATTEMPTS - failedAttempts,
    forceReauth,
    hasPinSet: hasPin(),
    enable,
    disable,
    setTimeoutMinutes,
    registerBiometric,
    removeBiometric,
    unlockWithBiometric,
    unlockWithPin,
    lockNow,
    isPlatformAuthenticatorAvailable,
  };

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
};

export const useAppLock = () => {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error('useAppLock deve essere usato dentro <AppLockProvider>');
  return ctx;
};
