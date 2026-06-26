import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useSyncQueue } from './useSyncQueue';
import { USE_SUPABASE } from '../config/constants';
import { getNote, upsertNota, deleteNota } from '../services/prontuarioService';
import { logger } from '../utils/logger';

const queryKey = (userId) => ['note', userId];

export const useNote = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const { addToQueue } = useSyncQueue();

  // ─── MOCK (no Supabase) ───────────────────────────────────────────────────
  if (!USE_SUPABASE) {
    const saved = localStorage.getItem('cds_note');
    const note = saved ? JSON.parse(saved) : {};
    const save = (prontuarioId, testo) => {
      const updated = { ...note, [prontuarioId]: testo };
      if (!testo?.trim()) delete updated[prontuarioId];
      localStorage.setItem('cds_note', JSON.stringify(updated));
    };
    return { note, error: null, save, getNota: (id) => note[id] || '' };
  }

  // ─── QUERY: carica tutte le note utente (con cache) ───────────────────────
  const { data: note = {}, error } = useQuery({
    queryKey: queryKey(userId),
    queryFn: () => getNote(userId),
    enabled: !!userId,
  });

  // ─── MUTATION: salva/elimina nota con aggiornamento ottimistico ───────────
  const mutation = useMutation({
    mutationFn: async ({ prontuarioId, testo }) => {
      if (!navigator.onLine) {
        addToQueue('SAVE_NOTE', { prontuarioId, testo });
        return { queued: true };
      }
      if (!testo?.trim()) {
        await deleteNota(userId, prontuarioId);
      } else {
        await upsertNota(userId, prontuarioId, testo);
      }
    },
    onMutate: async ({ prontuarioId, testo }) => {
      await queryClient.cancelQueries({ queryKey: queryKey(userId) });
      const previous = queryClient.getQueryData(queryKey(userId));
      queryClient.setQueryData(queryKey(userId), (old = {}) => {
        const updated = { ...old };
        if (!testo?.trim()) {
          delete updated[prontuarioId];
        } else {
          updated[prontuarioId] = testo;
        }
        return updated;
      });
      return { previous };
    },
    onError: (err, _vars, context) => {
      logger.error('Save nota failed:', err);
      if (context?.previous) {
        queryClient.setQueryData(queryKey(userId), context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      // Invalida solo se non era offline (l'offline è già in coda)
      if (navigator.onLine) {
        queryClient.invalidateQueries({ queryKey: queryKey(userId) });
      }
    },
  });

  const save = (prontuarioId, testo) => mutation.mutateAsync({ prontuarioId, testo });

  return {
    note,
    error: error || null,
    save,
    getNota: (id) => note[id] || '',
  };
};
