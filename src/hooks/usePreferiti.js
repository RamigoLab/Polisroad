import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useSyncQueue } from './useSyncQueue';
import { USE_SUPABASE } from '../config/constants';
import { getPreferiti, addPreferito, removePreferito } from '../services/prontuarioService';
import { logger } from '../utils/logger';
import { hapticLight } from '../utils/haptics';

// Chiave di cache: include userId così utenti diversi non condividono la cache
const queryKey = (userId) => ['preferiti', userId];

export const usePreferiti = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const { addToQueue } = useSyncQueue();

  // ─── LOCAL STATE FOR MOCK (no Supabase) ───────────────────────────────────
  const savedMock = localStorage.getItem('cds_preferiti');
  const mockPreferiti = savedMock ? JSON.parse(savedMock) : [];

  // ─── QUERY: carica preferiti (con cache 5 min) ────────────────────────────
  const { data: preferiti = [], error } = useQuery({
    queryKey: queryKey(userId),
    queryFn: () => getPreferiti(userId),
    enabled: !!userId && USE_SUPABASE,
  });

  // ─── MUTATION: toggle preferito con aggiornamento ottimistico ─────────────
  const mutation = useMutation({
    mutationFn: async (id) => {
      const isFav = preferiti.includes(id);
      if (!navigator.onLine) {
        addToQueue('TOGGLE_PREFERITO', { prontuarioId: id, action: isFav ? 'remove' : 'add' });
        return { queued: true };
      }
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

  const toggle = (id) => {
    if (!USE_SUPABASE) {
      hapticLight();
      const isFav = mockPreferiti.includes(id);
      const next = isFav ? mockPreferiti.filter(x => x !== id) : [...mockPreferiti, id];
      localStorage.setItem('cds_preferiti', JSON.stringify(next));
      return;
    }
    mutation.mutate(id);
  };

  const finalPreferiti = USE_SUPABASE ? preferiti : mockPreferiti;

  return {
    preferiti: finalPreferiti,
    error: USE_SUPABASE ? (error || null) : null,
    toggle,
    togglePreferito: toggle,
    isPreferito: (id) => finalPreferiti.includes(id),
  };
};
