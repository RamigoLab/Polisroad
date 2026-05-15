import { useData } from '../context/DataContext';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';

export const useNews = () => {
  const { news: list, loading, setNews, refresh } = useData();

  const add = async (item) => {
    if (!USE_SUPABASE) {
      const newItem = { ...item, id: Date.now().toString(), created_at: new Date().toISOString() };
      setNews([newItem, ...list]);
      return { error: null };
    }
    const { data, error } = await supabase.from('news').insert([item]).select();
    if (!error && data) setNews([data[0], ...list]);
    return { error };
  };

  const update = async (id, changes) => {
    if (!USE_SUPABASE) {
      setNews(list.map(item => item.id === id ? { ...item, ...changes } : item));
      return { error: null };
    }
    const { error } = await supabase.from('news').update(changes).eq('id', id);
    if (!error) setNews(list.map(item => item.id === id ? { ...item, ...changes } : item));
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
