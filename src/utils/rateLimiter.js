const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const loginRateLimiter = {
  // Memorizza tentativi falliti
  attempts: new Map(),

  canAttempt: (emailOrIp) => {
    const key = emailOrIp;
    const now = Date.now();

    if (loginRateLimiter.attempts.has(key)) {
      const { count, lockedUntil } = loginRateLimiter.attempts.get(key);

      if (now < lockedUntil) {
        return {
          allowed: false,
          reason: `Account temporaneamente bloccato. Riprova tra ${Math.ceil((lockedUntil - now) / 1000 / 60)} minuti.`
        };
      }

      // Reset after lockout
      if (count >= MAX_LOGIN_ATTEMPTS) {
        loginRateLimiter.attempts.delete(key);
        return { allowed: true };
      }
    }

    return { allowed: true };
  },

  recordAttempt: (emailOrIp, success) => {
    const key = emailOrIp;
    const now = Date.now();

    if (success) {
      // Cancella tentativi falliti dopo login riuscito
      loginRateLimiter.attempts.delete(key);
      return;
    }

    // Registra tentativo fallito
    const current = loginRateLimiter.attempts.get(key) || { count: 0, lockedUntil: 0 };
    const newCount = current.count + 1;

    if (newCount >= MAX_LOGIN_ATTEMPTS) {
      loginRateLimiter.attempts.set(key, {
        count: newCount,
        lockedUntil: now + LOCKOUT_DURATION
      });
    } else {
      loginRateLimiter.attempts.set(key, {
        count: newCount,
        lockedUntil: current.lockedUntil
      });
    }
  }
};
