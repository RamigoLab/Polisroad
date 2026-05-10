import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';
import { useAuth } from './useAuth';

export const usePreferiti = () => {
  const { session } = useAuth();
  const [preferiti, setPreferiti] = useState([]);

  useEffect(() => {
    if (!USE_SUPABASE) {
      const saved = localStorage.getItem('cds_preferiti');
      if (saved) {
        try { setPreferiti(JSON.parse(saved)); } catch(e) {}
      }
      return;
    }
    
    if (session?.user) {
      loadPreferiti();
    } else {
      setPreferiti([]);
    }
  }, [session]);

  const loadPreferiti = async () => {
    const { data } = await supabase.from('preferiti').select('prontuario_id').eq('user_id', session.user.id);
    if (data) setPreferiti(data.map(d => d.prontuario_id));
  };

  const togglePreferito = async (id) => {
    if (!USE_SUPABASE) {
      setPreferiti(prev => {
        const isFav = prev.includes(id);
        const newArr = isFav ? prev.filter(x => x !== id) : [...prev, id];
        localStorage.setItem('cds_preferiti', JSON.stringify(newArr));
        return newArr;
      });
      return;
    }

    if (!session?.user) return;
    const isFav = preferiti.includes(id);
    
    if (isFav) {
      await supabase.from('preferiti').delete().match({ user_id: session.user.id, prontuario_id: id });
      setPreferiti(prev => prev.filter(x => x !== id));
    } else {
      await supabase.from('preferiti').insert({ user_id: session.user.id, prontuario_id: id });
      setPreferiti(prev => [...prev, id]);
    }
  };

  const isPreferito = (id) => preferiti.includes(id);

  return { preferiti, togglePreferito, isPreferito };
};
