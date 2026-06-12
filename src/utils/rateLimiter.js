// NOTA DI SICUREZZA: questo rate limiter opera solo lato client come protezione UX.
// La protezione reale contro brute-force è delegata a Supabase Auth (server-side).
// Non rimuovere la dipendenza dal rate limiting di Supabase Auth.
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const getStorageAttempts = () => {
  try {
    const raw = localStorage.getItem('polisroad_login_attempts');
    if (raw) {
      const parsed = JSON.parse(raw);
      return new Map(Object.entries(parsed));
    }
  } catch (e) {
    console.error("Error reading rate limit attempts:", e);
  }
  return new Map();
};

const saveStorageAttempts = (map) => {
  try {
    const obj = Object.fromEntries(map.entries());
    localStorage.setItem('polisroad_login_attempts', JSON.stringify(obj));
  } catch (e) {
    console.error("Error saving rate limit attempts:", e);
  }
};

export const loginRateLimiter = {
  canAttempt: (emailOrIp) => {
    const key = emailOrIp;
    const now = Date.now();
    const attempts = getStorageAttempts();

    if (attempts.has(key)) {
      const { count, lockedUntil } = attempts.get(key);

      if (now < lockedUntil) {
        return {
          allowed: false,
          reason: `Account temporaneamente bloccato. Riprova tra ${Math.ceil((lockedUntil - now) / 1000 / 60)} minuti.`
        };
      }

      // Reset after lockout
      if (count >= MAX_LOGIN_ATTEMPTS) {
        attempts.delete(key);
        saveStorageAttempts(attempts);
        return { allowed: true };
      }
    }

    return { allowed: true };
  },

  recordAttempt: (emailOrIp, success) => {
    const key = emailOrIp;
    const now = Date.now();
    const attempts = getStorageAttempts();

    if (success) {
      // Cancella tentativi falliti dopo login riuscito
      attempts.delete(key);
      saveStorageAttempts(attempts);
      return;
    }

    // Registra tentativo fallito
    const current = attempts.get(key) || { count: 0, lockedUntil: 0 };
    const newCount = current.count + 1;

    if (newCount >= MAX_LOGIN_ATTEMPTS) {
      attempts.set(key, {
        count: newCount,
        lockedUntil: now + LOCKOUT_DURATION
      });
    } else {
      attempts.set(key, {
        count: newCount,
        lockedUntil: current.lockedUntil
      });
    }
    saveStorageAttempts(attempts);
  }
};

