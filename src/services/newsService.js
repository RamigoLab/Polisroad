/**
 * newsService.js
 * Centralizza tutte le chiamate Supabase per le news.
 * Gli hook consumano queste funzioni invece di chiamare Supabase direttamente.
 */
import { supabase } from '../config/supabase';
import { mockNews } from '../data/news';
import { USE_SUPABASE } from '../config/constants';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function filterValidNews(items) {
  const now = Date.now();
  return items.filter(item => {
    if (!item.pubblicato) return true; // non pubblicati: includi (gestione admin)
    const createdAt = new Date(item.data_creazione || item.created_at).getTime();
    return !(Number.isFinite(createdAt) && (now - createdAt) > THIRTY_DAYS_MS);
  });
}

export async function getNews() {
  if (!USE_SUPABASE) return filterValidNews(mockNews);
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return filterValidNews(data || []);
}

export async function addNews(item) {
  const finalId = item.id || `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const dataCreazione = item.data_creazione || item.created_at || new Date().toISOString();

  const dbPayload = {
    id: finalId,
    titolo: item.titolo,
    contenuto: item.contenuto,
    categoria: item.categoria || 'informativa',
    pubblicato: item.pubblicato ?? true,
    data_creazione: dataCreazione,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('news').insert([dbPayload]).select();
  if (error) throw error;
  return { ...item, ...data[0] };
}

export async function updateNews(id, changes) {
  const dbPayload = {};
  if (changes.titolo !== undefined) dbPayload.titolo = changes.titolo;
  if (changes.contenuto !== undefined) dbPayload.contenuto = changes.contenuto;
  if (changes.categoria !== undefined) dbPayload.categoria = changes.categoria;
  if (changes.pubblicato !== undefined) dbPayload.pubblicato = changes.pubblicato;
  if (changes.data_creazione !== undefined) dbPayload.data_creazione = changes.data_creazione;

  const { error } = await supabase.from('news').update(dbPayload).eq('id', id);
  if (error) throw error;
}

export async function deleteNews(id) {
  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw error;
}
