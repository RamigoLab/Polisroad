import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { USE_SUPABASE } from '../config/constants';
import { getPreferiti, addPreferito, removePreferito } from '../services/prontuarioService';
import { logger } from '../utils/logger';

// Chiave di cache: include userId così utenti diversi non condividono la cache
const queryKey = (userId) => ['preferiti', userId];

export const usePreferiti = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  // ─── MOCK (no Supabase) ───────────────────────────────────────────────────
  if (!USE_SUPABASE) {
    const saved = localStorage.getItem('cds_preferiti');
    const preferiti = saved ? JSON.parse(saved) : [];
    const toggle = (id) => {
      const isFav = preferiti.includes(id);
      const next = isFav ? preferiti.filter(x => x !== id) : [...preferiti, id];
      localStorage.setItem('cds_preferiti', JSON.stringify(next));
    };
    return { preferiti, error: null, toggle, togglePreferito: toggle, isPreferito: (id) => preferiti.includes(id) };
  }

  // ─── QUERY: carica preferiti (con cache 5 min) ────────────────────────────
  const { data: preferiti = [], error } = useQuery({
    queryKey: queryKey(userId),
    queryFn: () => getPreferiti(userId),
    enabled: !!userId,
    onError: (e) => logger.error('Failed to load favorites:', e),
  });

  // ─── MUTATION: toggle preferito con aggiornamento ottimistico ─────────────
  const mutation = useMutation({
    mutationFn: async (id) => {
      const isFav = preferiti.includes(id);
      if (isFav) {
        await removePreferito(userId, id);
      } else {
        await addPreferito(userId, id);
      }
      return { id, wasFav: isFav };
    },
    onMutate: async (id) => {
      // Cancella query in volo per evitare sovrascritture
      await queryClient.cancelQueries({ queryKey: queryKey(userId) });
      const previous = queryClient.getQueryData(queryKey(userId));
      // Aggiornamento ottimistico immediato
      queryClient.setQueryData(queryKey(userId), (old = []) =>
        old.includes(id) ? old.filter(x => x !== id) : [...old, id]
      );
      return { previous };
    },
    onError: (err, _id, context) => {
      // Rollback se la mutation fallisce
      logger.error('Toggle preferito failed:', err);
      if (context?.previous) {
        queryClient.setQueryData(queryKey(userId), context.previous);
      }
    },
    onSettled: () => {
      // Invalida la cache per sincronizzare col server
      queryClient.invalidateQueries({ queryKey: queryKey(userId) });
    },
  });

  const toggle = (id) => mutation.mutate(id);

  return {
    preferiti,
    error: error || null,
    toggle,
    togglePreferito: toggle,
    isPreferito: (id) => preferiti.includes(id),
  };
};
