/**
 * normativaService.js
 * Centralizza tutte le chiamate Supabase per la normativa (codice_strada).
 * Gli hook consumano queste funzioni invece di chiamare Supabase direttamente.
 */
import { supabase } from '../config/supabase';
import { mockNormativa } from '../data/normativa';
import { USE_SUPABASE } from '../config/constants';

// Helper per recuperare tutti i record superando il limite 1000 di Supabase
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

export async function getNormativa() {
  if (!USE_SUPABASE) return mockNormativa;
  return fetchAllRows('codice_strada', 'ordine');
}

export async function addNormativa(item) {
  const finalId = item.id || `norm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newItem = { ...item, id: finalId };
  const { data, error } = await supabase.from('codice_strada').insert([newItem]).select();
  if (error) throw error;
  return data[0];
}

export async function updateNormativa(id, changes) {
  const { error } = await supabase.from('codice_strada').update(changes).eq('id', id);
  if (error) throw error;
}

export async function deleteNormativa(id) {
  const { error } = await supabase.from('codice_strada').delete().eq('id', id);
  if (error) throw error;
}
