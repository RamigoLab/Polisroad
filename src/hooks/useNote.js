import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';
import { useAuth } from './useAuth';

export const useNote = () => {
  const { session } = useAuth();
  const [note, setNote] = useState({});

  useEffect(() => {
    if (!USE_SUPABASE) {
      const saved = localStorage.getItem('cds_note');
      if (saved) {
        try { setNote(JSON.parse(saved)); } catch(e) {}
      }
      return;
    }
    
    if (session?.user) {
      loadNote();
    } else {
      setNote({});
    }
  }, [session]);

  const loadNote = async () => {
    const { data } = await supabase.from('note').select('prontuario_id, testo').eq('user_id', session.user.id);
    if (data) {
      const noteMap = {};
      data.forEach(n => noteMap[n.prontuario_id] = n.testo);
      setNote(noteMap);
    }
  };

  const salvaNota = async (prontuarioId, testo) => {
    if (!USE_SUPABASE) {
      setNote(prev => {
        const updated = { ...prev, [prontuarioId]: testo };
        if (!testo || testo.trim() === '') delete updated[prontuarioId];
        localStorage.setItem('cds_note', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    if (!session?.user) return;
    
    if (!testo || testo.trim() === '') {
      await supabase.from('note').delete().match({ user_id: session.user.id, prontuario_id: prontuarioId });
      setNote(prev => {
        const updated = { ...prev };
        delete updated[prontuarioId];
        return updated;
      });
    } else {
      const { error } = await supabase.from('note').upsert(
        { user_id: session.user.id, prontuario_id: prontuarioId, testo: testo },
        { onConflict: 'user_id, prontuario_id' }
      );
      if (!error) {
        setNote(prev => ({ ...prev, [prontuarioId]: testo }));
      }
    }
  };

  const getNota = (prontuarioId) => note[prontuarioId] || '';

  return { note, salvaNota, getNota };
};
