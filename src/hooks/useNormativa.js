import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';
import { mockNormativa } from '../data/normativa';

export const useNormativa = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    if (!USE_SUPABASE) {
      setList(mockNormativa);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('normativa').select('*').order('articolo', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) setList(data);
      else setList(mockNormativa); // fallback se vuoto
    } catch (error) {
      console.error('Error fetching normativa:', error);
      setList(mockNormativa);
    } finally {
      setLoading(false);
    }
  };

  const add = async (item) => {
    if (!USE_SUPABASE) {
      setList([...list, { ...item, id: Date.now().toString() }]);
      return { error: null };
    }
    const { data, error } = await supabase.from('normativa').insert([item]).select();
    if (!error && data) setList([...list, data[0]]);
    return { error };
  };

  const update = async (id, changes) => {
    if (!USE_SUPABASE) {
      setList(list.map(item => item.id === id ? { ...item, ...changes } : item));
      return { error: null };
    }
    const { error } = await supabase.from('normativa').update(changes).eq('id', id);
    if (!error) setList(list.map(item => item.id === id ? { ...item, ...changes } : item));
    return { error };
  };

  const remove = async (id) => {
    if (!USE_SUPABASE) {
      setList(list.filter(item => item.id !== id));
      return { error: null };
    }
    const { error } = await supabase.from('normativa').delete().eq('id', id);
    if (!error) setList(list.filter(item => item.id !== id));
    return { error };
  };

  return { list, loading, add, update, remove, refresh: fetchData };
};
