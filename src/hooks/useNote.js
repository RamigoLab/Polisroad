import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';
import { useAuth } from './useAuth';
import { useSyncQueue } from './useSyncQueue';

import { logger } from '../utils/logger';
export const useNote = () => {
  const { session } = useAuth();
  const [note, setNote] = useState({});
  const [error, setError] = useState(null);
  const { addToQueue } = useSyncQueue();

  useEffect(() => {
    const loadNote = async () => {
      const { data, error } = await supabase.from('note').select('prontuario_id, testo').eq('user_id', session.user.id);
      if (error) {
        logger.error('Failed to load notes:', error);
        setError(error);
        return;
      }
      if (data) {
        const noteMap = {};
        data.forEach(n => noteMap[n.prontuario_id] = n.testo);
        setNote(noteMap);
        setError(null);
      }
    };

    if (!USE_SUPABASE) {
      const saved = localStorage.getItem('cds_note');
      if (saved) {
        try { setNote(JSON.parse(saved)); } catch { /* ignore */ }
      }
      return;
    }
    
    if (session?.user) {
      loadNote();
    } else {
      setNote({});
    }
  }, [session]);



  const salvaNota = async (prontuarioId, testo) => {
    if (!USE_SUPABASE) {
      setNote(prev => {
        const updated = { ...prev, [prontuarioId]: testo };
        if (!testo || testo.trim() === '') delete updated[prontuarioId];
        localStorage.setItem('cds_note', JSON.stringify(updated));
        return updated;
      });
      return { error: null };
    }

    if (!session?.user) return { error: { message: 'Utente non loggato' } };

    if (!navigator.onLine) {
      setNote(prev => {
        const updated = { ...prev, [prontuarioId]: testo };
        if (!testo || testo.trim() === '') delete updated[prontuarioId];
        return updated;
      });
      addToQueue('SAVE_NOTE', { prontuarioId, testo });
      return { error: null };
    }
    
    if (!testo || testo.trim() === '') {
      const { error } = await supabase.from('note').delete().match({ user_id: session.user.id, prontuario_id: prontuarioId });
      if (error) {
        logger.error('Failed to delete note:', error);
        setError(error);
        return { error };
      }
      setNote(prev => {
        const updated = { ...prev };
        delete updated[prontuarioId];
        return updated;
      });
      setError(null);
      return { error: null };
    } else {
      const { error } = await supabase.from('note').upsert(
        { user_id: session.user.id, prontuario_id: prontuarioId, testo: testo },
        { onConflict: 'user_id, prontuario_id' }
      );
      if (error) {
        logger.error('Failed to save note:', error);
        setError(error);
        return { error };
      }
      setNote(prev => ({ ...prev, [prontuarioId]: testo }));
      setError(null);
      return { error: null };
    }
  };

  const getNota = (prontuarioId) => note[prontuarioId] || '';

  return { note, error, save: salvaNota, getNota };
};
