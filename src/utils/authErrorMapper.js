/**
 * authErrorMapper.js
 * Traduce i messaggi di errore di Supabase Auth in italiano chiaro e contestuale.
 * Usare questo invece di mostrare error.message direttamente all'utente.
 */

/**
 * Estrae i secondi di attesa dal messaggio Supabase rate-limit.
 * Es. "For security purposes, you can only request this after 47 seconds"
 */
function extractSeconds(message) {
  const match = message?.match(/after\s+(\d+)\s+second/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Mappa un errore Supabase Auth in un messaggio italiano leggibile.
 * @param {Error|{message:string}|string|null} error
 * @param {'login'|'register'|'reset'|'update'} context - contesto dell'operazione
 * @returns {string} messaggio pronto per essere mostrato all'utente
 */
export function mapAuthError(error, context = 'login') {
  if (!error) return 'Si è verificato un errore sconosciuto. Riprova.';

  const raw = (typeof error === 'string' ? error : error.message || '').toLowerCase();

  // ── RATE LIMIT ──────────────────────────────────────────────────────────────
  if (raw.includes('rate limit') || raw.includes('email rate limit')) {
    return 'Troppe richieste in poco tempo. Attendi qualche minuto prima di riprovare.';
  }
  if (raw.includes('for security purposes') || raw.includes('only request this after')) {
    const secs = extractSeconds(error.message || error);
    if (secs) {
      const min = Math.ceil(secs / 60);
      return secs >= 60
        ? `Per motivi di sicurezza devi attendere ancora circa ${min} minut${min === 1 ? 'o' : 'i'} prima di riprovare.`
        : `Per motivi di sicurezza devi attendere ancora ${secs} second${secs === 1 ? 'o' : 'i'} prima di riprovare.`;
    }
    return 'Per motivi di sicurezza devi attendere qualche istante prima di riprovare.';
  }

  // ── EMAIL GIÀ REGISTRATA ────────────────────────────────────────────────────
  if (
    raw.includes('user already registered') ||
    raw.includes('already been registered') ||
    raw.includes('email already') ||
    raw.includes('already exists')
  ) {
    return 'Questa email è già associata a un account. Prova ad accedere oppure usa il recupero password.';
  }

  // ── CREDENZIALI ERRATE ──────────────────────────────────────────────────────
  if (
    raw.includes('invalid login credentials') ||
    raw.includes('invalid credentials') ||
    raw.includes('wrong password') ||
    raw.includes('invalid password')
  ) {
    return 'Email o password non corretti. Controlla i dati inseriti e riprova.';
  }

  // ── UTENTE NON TROVATO ──────────────────────────────────────────────────────
  if (raw.includes('user not found') || raw.includes('no user found')) {
    return context === 'reset'
      ? 'Nessun account trovato con questa email. Controlla di averla scritta correttamente.'
      : 'Email o password non corretti.';
  }

  // ── EMAIL NON VERIFICATA ────────────────────────────────────────────────────
  if (raw.includes('email not confirmed') || raw.includes('not confirmed')) {
    return 'Devi confermare la tua email prima di accedere. Controlla la casella di posta (anche spam).';
  }

  // ── PASSWORD DEBOLE ─────────────────────────────────────────────────────────
  if (raw.includes('password should be') || raw.includes('password must be') || raw.includes('weak password')) {
    return 'La password non soddisfa i requisiti minimi di sicurezza. Deve avere almeno 8 caratteri, una maiuscola e un numero.';
  }

  // ── TOKEN SCADUTO / LINK NON VALIDO ─────────────────────────────────────────
  if (raw.includes('token has expired') || raw.includes('token expired')) {
    return 'Il link è scaduto. Richiedi un nuovo link di recupero password.';
  }
  if (raw.includes('invalid token') || raw.includes('token invalid')) {
    return 'Il link non è valido o è già stato utilizzato. Richiedi un nuovo link.';
  }

  // ── ERRORI DI RETE ──────────────────────────────────────────────────────────
  if (raw.includes('failed to fetch') || raw.includes('network') || raw.includes('fetch')) {
    return 'Errore di connessione. Controlla la tua connessione internet e riprova.';
  }

  // ── ACCOUNT DISABILITATO ────────────────────────────────────────────────────
  if (raw.includes('banned') || raw.includes('disabled') || raw.includes('deactivated')) {
    return 'Questo account è stato disabilitato. Contatta l\'amministratore.';
  }

  // ── TROPPI TENTATIVI DI LOGIN ───────────────────────────────────────────────
  if (raw.includes('too many requests') || raw.includes('too many attempts')) {
    return 'Troppi tentativi falliti. Attendi qualche minuto prima di riprovare.';
  }

  // ── FALLBACK ─────────────────────────────────────────────────────────────────
  return context === 'register'
    ? 'Registrazione non riuscita. Controlla i dati inseriti e riprova.'
    : context === 'reset'
    ? 'Impossibile inviare il link di recupero. Riprova tra qualche minuto.'
    : context === 'update'
    ? 'Impossibile aggiornare la password. Riprova tra qualche minuto.'
    : 'Accesso non riuscito. Controlla i dati e riprova.';
}
