import { useData } from '../context/DataContext';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';

export const useNews = () => {
  const { news: list, loading, setNews, refresh } = useData();

  const add = async (item) => {
    // Generate a unique string ID since the database id column is text
    const finalId = item.id || `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dataCreazione = item.data_creazione || item.created_at || new Date().toISOString();

    if (!USE_SUPABASE) {
      const newItem = { 
        ...item, 
        id: finalId, 
        data_creazione: dataCreazione,
        created_at: new Date().toISOString() 
      };
      setNews([newItem, ...list]);
      return { error: null };
    }

    // Build payload matching EXACTLY the database columns
    const dbPayload = {
      id: finalId,
      titolo: item.titolo,
      contenuto: item.contenuto,
      categoria: item.categoria || 'informativa',
      pubblicato: item.pubblicato ?? true,
      data_creazione: dataCreazione,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('news').insert([dbPayload]).select();
    if (!error && data && data[0]) {
      // Keep support for local fields if any are present
      setNews([{ ...item, ...data[0] }, ...list]);
    }
    return { error };
  };

  const update = async (id, changes) => {
    if (!USE_SUPABASE) {
      setNews(list.map(item => item.id === id ? { ...item, ...changes } : item));
      return { error: null };
    }

    // Only update fields that exist in the database schema
    const dbPayload = {};
    if (changes.titolo !== undefined) dbPayload.titolo = changes.titolo;
    if (changes.contenuto !== undefined) dbPayload.contenuto = changes.contenuto;
    if (changes.categoria !== undefined) dbPayload.categoria = changes.categoria;
    if (changes.pubblicato !== undefined) dbPayload.pubblicato = changes.pubblicato;
    if (changes.data_creazione !== undefined) dbPayload.data_creazione = changes.data_creazione;

    const { error } = await supabase.from('news').update(dbPayload).eq('id', id);
    if (!error) {
      setNews(list.map(item => item.id === id ? { ...item, ...changes } : item));
    }
    return { error };
  };

  const remove = async (id) => {
    if (!USE_SUPABASE) {
      setNews(list.filter(item => item.id !== id));
      return { error: null };
    }
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (!error) setNews(list.filter(item => item.id !== id));
    return { error };
  };

  return { list, loading, add, update, remove, refresh };
};
