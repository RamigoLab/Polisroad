/**
 * synonymsService.js
 * Centralizza le chiamate Supabase per i sinonimi di ricerca (search_synonyms).
 * Stesso pattern di prontuarioService.js.
 */
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';

export async function getSearchSynonyms() {
  if (!USE_SUPABASE) return [];
  const { data, error } = await supabase
    .from('search_synonyms')
    .select('*')
    .eq('attivo', true)
    .order('peso', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addSynonym(item) {
  const { data, error } = await supabase.from('search_synonyms').insert([item]).select();
  if (error) throw error;
  return data[0];
}

export async function updateSynonym(id, changes) {
  const { error } = await supabase.from('search_synonyms').update(changes).eq('id', id);
  if (error) throw error;
}

export async function deleteSynonym(id) {
  const { error } = await supabase.from('search_synonyms').delete().eq('id', id);
  if (error) throw error;
}
