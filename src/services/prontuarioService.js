/**
 * prontuarioService.js
 * Centralizza tutte le chiamate Supabase per prontuario, preferiti e note personali.
 * Gli hook consumano queste funzioni invece di chiamare Supabase direttamente.
 */
import { supabase } from '../config/supabase';
import { mockProntuario } from '../data/prontuario';
import { USE_SUPABASE } from '../config/constants';

// ─── PRONTUARIO (lettura dati) ────────────────────────────────────────────────

async function fetchAllRows(table, orderCol) {
  let allData = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderCol)
      .range(from, from + step - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allData = [...allData, ...data];
    if (data.length < step) break;
    from += step;
  }
  return allData;
}

export async function getProntuario() {
  if (!USE_SUPABASE) return mockProntuario;
  return fetchAllRows('prontuario', 'articolo_numero');
}

export async function addProntuarioItem(item) {
  const { data, error } = await supabase.from('prontuario').insert([item]).select();
  if (error) throw error;
  return data[0];
}

export async function updateProntuarioItem(id, changes) {
  const { error } = await supabase.from('prontuario').update(changes).eq('id', id);
  if (error) throw error;
}

export async function deleteProntuarioItem(id) {
  const { error } = await supabase.from('prontuario').delete().eq('id', id);
  if (error) throw error;
}

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
