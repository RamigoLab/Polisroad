import { useData } from '../context/DataContext';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';

export const useNormativa = () => {
  const { normativa: list, loading, setNormativa, refresh } = useData();

  const add = async (item) => {
    if (!USE_SUPABASE) {
      const newItem = { ...item, id: Date.now().toString(), ordine: list.length + 1 };
      setNormativa([...list, newItem]);
      return { error: null };
    }
    const { data, error } = await supabase.from('codice_strada').insert([item]).select();
    if (!error && data) setNormativa([...list, data[0]]);
    return { error };
  };

  const update = async (id, changes) => {
    if (!USE_SUPABASE) {
      setNormativa(list.map(item => item.id === id ? { ...item, ...changes } : item));
      return { error: null };
    }
    const { error } = await supabase.from('codice_strada').update(changes).eq('id', id);
    if (!error) setNormativa(list.map(item => item.id === id ? { ...item, ...changes } : item));
    return { error };
  };

  const remove = async (id) => {
    if (!USE_SUPABASE) {
      setNormativa(list.filter(item => item.id !== id));
      return { error: null };
    }
    const { error } = await supabase.from('codice_strada').delete().eq('id', id);
    if (!error) setNormativa(list.filter(item => item.id !== id));
    return { error };
  };

  return { list, loading, add, update, remove, refresh };
};
