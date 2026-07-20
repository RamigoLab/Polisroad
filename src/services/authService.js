/**
 * authService.js
 * Centralizza tutte le chiamate Supabase per autenticazione e profili.
 */
import { supabase } from '../config/supabase';

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, nome, cognome, grado, forza, telefono, ruolo, approvato')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates });
  if (error) throw error;
}

export async function fetchUserCount() {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Login vero e proprio senza email/password — richiede che l'utente abbia
// già registrato un passkey su questo account (vedi registerPasskey sotto).
// Funzionalità Supabase in beta: l'API può cambiare senza preavviso, per
// questo resta sempre un'opzione aggiuntiva accanto a email+password, mai
// l'unico modo per accedere.
export async function signInWithPasskey() {
  const { data, error } = await supabase.auth.signInWithPasskey();
  if (error) throw error;
  return data;
}

// Registra un passkey per l'utente già loggato (da fare una volta, da Profilo).
export async function registerPasskey() {
  const { data, error } = await supabase.auth.registerPasskey();
  if (error) throw error;
  return data;
}

// Elenca i passkey già registrati per l'utente loggato — usato per mostrare
// lo stato reale in Profilo ("Registrato" vs "Registra") invece di un flag
// locale che potrebbe disallinearsi dal server.
export async function listPasskeys() {
  const { data, error } = await supabase.auth.passkey.list();
  if (error) throw error;
  return data || [];
}

export async function signUp(email, password, userData) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([{ id: data.user.id, email, ...userData, ruolo: 'operatore', approvato: false }]);
    if (profileError) throw profileError;
  }
  return data;
}

export async function resetPassword(email, redirectTo) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function updatePassword(password) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
