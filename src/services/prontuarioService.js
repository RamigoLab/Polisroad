/**
 * prontuarioService.js
 * Centralizza tutte le chiamate Supabase per preferiti e note personali.
 * Gli hook consumano queste funzioni invece di chiamare Supabase direttamente.
 */
import { supabase } from '../config/supabase';

// ─── PREFERITI ────────────────────────────────────────────────────────────────

export async function getPreferiti(userId) {
  const { data, error } = await supabase
    .from('preferiti')
    .select('prontuario_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map(d => d.prontuario_id);
}

export async function addPreferito(userId, prontuarioId) {
  const { error } = await supabase
    .from('preferiti')
    .insert({ user_id: userId, prontuario_id: prontuarioId });
  if (error) throw error;
}

export async function removePreferito(userId, prontuarioId) {
  const { error } = await supabase
    .from('preferiti')
    .delete()
    .match({ user_id: userId, prontuario_id: prontuarioId });
  if (error) throw error;
}

// ─── NOTE ─────────────────────────────────────────────────────────────────────

export async function getNote(userId) {
  const { data, error } = await supabase
    .from('note')
    .select('prontuario_id, testo')
    .eq('user_id', userId);
  if (error) throw error;
  const map = {};
  data.forEach(n => { map[n.prontuario_id] = n.testo; });
  return map;
}

export async function upsertNota(userId, prontuarioId, testo) {
  const { error } = await supabase
    .from('note')
    .upsert(
      { user_id: userId, prontuario_id: prontuarioId, testo },
      { onConflict: 'user_id, prontuario_id' }
    );
  if (error) throw error;
}

export async function deleteNota(userId, prontuarioId) {
  const { error } = await supabase
    .from('note')
    .delete()
    .match({ user_id: userId, prontuario_id: prontuarioId });
  if (error) throw error;
}
