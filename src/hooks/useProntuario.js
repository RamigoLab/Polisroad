import { useData } from '../context/DataContext';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';

export const useProntuario = () => {
  const { prontuario: list, loading, setProntuario, refresh } = useData();

  const add = async (item) => {
    if (!USE_SUPABASE) {
      const newItem = { ...item, id: Date.now().toString() };
      setProntuario([...list, newItem]);
      return { error: null };
    }
    const { data, error } = await supabase.from('prontuario').insert([item]).select();
    if (!error && data) setProntuario([...list, data[0]]);
    return { error };
  };

  const update = async (id, changes) => {
    if (!USE_SUPABASE) {
      setProntuario(list.map(item => item.id === id ? { ...item, ...changes } : item));
      return { error: null };
    }
    const { error } = await supabase.from('prontuario').update(changes).eq('id', id);
    if (!error) setProntuario(list.map(item => item.id === id ? { ...item, ...changes } : item));
    return { error };
  };

  const remove = async (id) => {
    if (!USE_SUPABASE) {
      setProntuario(list.filter(item => item.id !== id));
      return { error: null };
    }
    const { error } = await supabase.from('prontuario').delete().eq('id', id);
    if (!error) setProntuario(list.filter(item => item.id !== id));
    return { error };
  };

  return { list, loading, add, update, remove, refresh };
};
