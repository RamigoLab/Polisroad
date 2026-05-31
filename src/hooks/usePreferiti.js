import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';
import { useAuth } from './useAuth';

export const usePreferiti = () => {
  const { session } = useAuth();
  const [preferiti, setPreferiti] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPreferiti = async () => {
      const { data, error } = await supabase.from('preferiti').select('prontuario_id').eq('user_id', session.user.id);
      if (error) {
        console.error('Failed to load favorites:', error);
        setError(error);
        return;
      }
      if (data) {
        setPreferiti(data.map(d => d.prontuario_id));
        setError(null);
      }
    };

    if (!USE_SUPABASE) {
      const saved = localStorage.getItem('cds_preferiti');
      if (saved) {
        try { setPreferiti(JSON.parse(saved)); } catch { /* ignore */ }
      }
      return;
    }
    
    if (session?.user) {
      loadPreferiti();
    } else {
      setPreferiti([]);
    }
  }, [session]);



  const togglePreferito = async (id) => {
    if (!USE_SUPABASE) {
      setPreferiti(prev => {
        const isFav = prev.includes(id);
        const newArr = isFav ? prev.filter(x => x !== id) : [...prev, id];
        localStorage.setItem('cds_preferiti', JSON.stringify(newArr));
        return newArr;
      });
      return { error: null };
    }

    if (!session?.user) return { error: { message: 'Utente non loggato' } };
    const isFav = preferiti.includes(id);
    
    if (isFav) {
      const { error } = await supabase.from('preferiti').delete().match({ user_id: session.user.id, prontuario_id: id });
      if (error) {
        console.error('Failed to remove favorite:', error);
        setError(error);
        return { error };
      }
      setPreferiti(prev => prev.filter(x => x !== id));
      setError(null);
      return { error: null };
    } else {
      const { error } = await supabase.from('preferiti').insert({ user_id: session.user.id, prontuario_id: id });
      if (error) {
        console.error('Failed to add favorite:', error);
        setError(error);
        return { error };
      }
      setPreferiti(prev => [...prev, id]);
      setError(null);
      return { error: null };
    }
  };

  const isPreferito = (id) => preferiti.includes(id);

  return { preferiti, error, togglePreferito, isPreferito, toggle: togglePreferito };
};
