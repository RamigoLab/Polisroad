import { logger } from './logger';
// src/utils/storage.js
// Simple wrapper around localStorage with base64 encoding for modest obfuscation.
// Not cryptographically secure, but avoids plain-text storage of flags.

export const setItem = (key, value) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    const encoded = btoa(unescape(encodeURIComponent(stringValue)));
    localStorage.setItem(key, encoded);
  } catch (e) {
    logger.error('Storage setItem error:', e);
  }
};

export const getItem = (key) => {
  try {
    const encoded = localStorage.getItem(key);
    if (!encoded) return null;
    const decoded = decodeURIComponent(escape(atob(encoded)));
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
