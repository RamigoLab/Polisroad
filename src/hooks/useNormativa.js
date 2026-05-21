import { useData } from '../context/DataContext.jsx';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';

export const useNormativa = () => {
  const { normativa: list, loading, setNormativa, refresh } = useData();

  const add = async (item) => {
    // Generate a unique string ID since the database id column is text
    const finalId = item.id || `norm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem = { ...item, id: finalId };

    if (!USE_SUPABASE) {
      setNormativa(prev => [...prev, newItem]);
      return { error: null };
    }

    const { data, error } = await supabase.from('codice_strada').insert([newItem]).select();
    if (!error && data && data[0]) {
      setNormativa(prev => [...prev, data[0]]);
    }
    return { error };
  };

  const update = async (id, changes) => {
    if (!USE_SUPABASE) {
      setNormativa(prev => prev.map(item => item.id === id ? { ...item, ...changes } : item));
      return { error: null };
    }
    const { error } = await supabase.from('codice_strada').update(changes).eq('id', id);
    if (!error) {
      // Use functional state updates to avoid sequential stale closures
      setNormativa(prev => prev.map(item => item.id === id ? { ...item, ...changes } : item));
    }
    return { error };
  };

  const remove = async (id) => {
    if (!USE_SUPABASE) {
      setNormativa(prev => prev.filter(item => item.id !== id));
      return { error: null };
    }
    const { error } = await supabase.from('codice_strada').delete().eq('id', id);
    if (!error) {
      setNormativa(prev => prev.filter(item => item.id !== id));
    }
    return { error };
  };

  return { list, loading, add, update, remove, refresh };
};
