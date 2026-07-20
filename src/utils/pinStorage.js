/**
 * pinStorage.js
 * PIN dello sblocco rapido — sempre e solo locale (localStorage), mai
 * inviato a Supabase. Salvato come hash SHA-256 con salt casuale, mai in
 * chiaro: anche leggendo il localStorage del dispositivo non si risale al PIN.
 */

const STORAGE_KEY = 'polisroad_lock_pin';

const bufferToHex = (buf) =>
  Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

async function hashPin(pin, saltHex) {
  const enc = new TextEncoder();
  const data = enc.encode(saltHex + pin);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(digest);
}

export async function setPin(pin) {
  const salt = bufferToHex(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await hashPin(pin, salt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ salt, hash }));
}

export async function verifyPin(pin) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const { salt, hash } = JSON.parse(raw);
    const candidate = await hashPin(pin, salt);
    return candidate === hash;
  } catch {
    return false;
  }
}

export function hasPin() {
  return !!localStorage.getItem(STORAGE_KEY);
}

export function clearPin() {
  localStorage.removeItem(STORAGE_KEY);
}
