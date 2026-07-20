/**
 * webauthn.js
 * Feature detection per WebAuthn — usato sia dallo sblocco rapido locale
 * sia dal login con passkey Supabase, per decidere se mostrare l'opzione
 * biometrica o solo il fallback (PIN / password).
 */

export const isWebAuthnSupported = () =>
  typeof window !== 'undefined' &&
  typeof window.PublicKeyCredential !== 'undefined' &&
  typeof navigator?.credentials?.create === 'function';

/**
 * Controlla se il dispositivo ha davvero un autenticatore biometrico
 * disponibile (Face ID, impronta, Windows Hello...). Non tutti i desktop
 * ce l'hanno — senza questo controllo mostreremmo un bottone biometrico
 * che fallisce sempre su quei dispositivi.
 */
export async function isPlatformAuthenticatorAvailable() {
  if (!isWebAuthnSupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

const b64urlToBuffer = (b64url) => {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(b64url.length + (4 - (b64url.length % 4)) % 4, '=');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
};

const bufferToB64url = (buf) => {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * Registra una credenziale WebAuthn LOCALE (platform authenticator) per lo
 * sblocco rapido — non passa mai da Supabase, resta sul dispositivo.
 * Ritorna l'id della credenziale (stringa) da salvare in localStorage.
 */
export async function registerLocalCredential(displayName) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'PolisRoad' },
      user: { id: userId, name: displayName || 'operatore', displayName: displayName || 'Operatore PolisRoad' },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
      timeout: 60000,
    },
  });
  if (!credential) throw new Error('Registrazione credenziale annullata');
  return bufferToB64url(credential.rawId);
}

/**
 * Chiede la verifica biometrica per una credenziale locale già registrata.
 * Se il browser/OS risolve la promise, la verifica è andata a buon fine —
 * non c'è un server con cui confrontare la firma, essendo solo un cancello
 * locale (la sessione Supabase sotto resta quella già autenticata).
 */
export async function verifyLocalCredential(credentialId) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: b64urlToBuffer(credentialId), type: 'public-key' }],
      userVerification: 'required',
      timeout: 60000,
    },
  });
  return !!assertion;
}
