import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';
import { mockNews } from '../data/news';

export const useNews = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    if (!USE_SUPABASE) {
      setList(mockNews);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) setList(data);
      else setList(mockNews);
    } catch (error) {
      console.error('Error fetching news:', error);
      setList(mockNews);
    } finally {
      setLoading(false);
    }
  };

  const add = async (item) => {
    if (!USE_SUPABASE) {
      setList([{ ...item, id: Date.now().toString(), created_at: new Date().toISOString() }, ...list]);
      return { error: null };
    }
    const { data, error } = await supabase.from('news').insert([item]).select();
    if (!error && data) setList([data[0], ...list]);
    return { error };
  };

  const update = async (id, changes) => {
    if (!USE_SUPABASE) {
      setList(list.map(item => item.id === id ? { ...item, ...changes } : item));
      return { error: null };
    }
    const { error } = await supabase.from('news').update(changes).eq('id', id);
    if (!error) setList(list.map(item => item.id === id ? { ...item, ...changes } : item));
    return { error };
  };

  const remove = async (id) => {
    if (!USE_SUPABASE) {
      setList(list.filter(item => item.id !== id));
      return { error: null };
    }
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (!error) setList(list.filter(item => item.id !== id));
    return { error };
  };

  return { list, loading, add, update, remove, refresh: fetchData };
};
