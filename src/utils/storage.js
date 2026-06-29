import { logger } from './logger';
/**
 * storage.js
 * Wrapper attorno a localStorage con encoding base64 UTF-8.
 * Usa TextEncoder/TextDecoder invece delle funzioni deprecate escape()/unescape().
 */

function toBase64(str) {
  try {
    return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
  } catch {
    // Fallback per ambienti senza TextEncoder (raro)
    return btoa(unescape(encodeURIComponent(str)));
  }
}

function fromBase64(b64) {
  try {
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return decodeURIComponent(escape(atob(b64)));
  }
}

export const setItem = (key, value) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, toBase64(stringValue));
  } catch (e) {
    logger.error('Storage setItem error:', e);
  }
};

export const getItem = (key) => {
  try {
    const encoded = localStorage.getItem(key);
    if (!encoded) return null;
    const decoded = fromBase64(encoded);
    try {
      return JSON.parse(decoded);
    } catch {
      return decoded;
    }
  } catch (e) {
    logger.error('Storage getItem error:', e);
    return null;
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    logger.error('Storage removeItem error:', e);
  }
};
