// src/utils/validation.js
// Centralised input validation and sanitisation utilities for the PolisRoad app.
// Uses DOMPurify for HTML sanitisation.

import DOMPurify from 'dompurify';

export const validators = {
  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : 'Email non valida';
  },
  required: (value, fieldName = 'Campo') =>
    value?.trim() ? null : `${fieldName} è obbligatorio`,
  minLength: (value, min, fieldName = 'Campo') =>
    value?.length >= min ? null : `${fieldName} deve avere almeno ${min} caratteri`,
  maxLength: (value, max, fieldName = 'Campo') =>
    value?.length <= max ? null : `${fieldName} non può superare ${max} caratteri`,
  password: (value) => {
    if (!value || value.length < 8) return 'Min 8 caratteri';
    if (!/[A-Z]/.test(value)) return 'Richiede maiuscola';
    if (!/[0-9]/.test(value)) return 'Richiede numero';
    return null;
  },
  range: (value, min, max, fieldName = 'Valore') => {
    const num = parseFloat(value);
    return num >= min && num <= max
      ? null
      : `${fieldName} deve essere tra ${min} e ${max}`;
  }
};

export const sanitizers = {
  text: (value) => {
    return DOMPurify.sanitize(value.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  },
  html: (value) => {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
      ALLOWED_ATTR: []
    });
  },
  url: (value) => {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      return url.href;
    } catch {
      return null;
    }
  }
};

export const validateAndSanitize = (value, validator, sanitizer) => {
  const error = validator(value);
  if (error) return { value: null, error };
  return { value: sanitizer(value), error: null };
};
