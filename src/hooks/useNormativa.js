/**
 * useNormativa.js
 * Hook per la normativa (codice_strada).
 * I dati vengono dalla cache React Query gestita in DataContext.
 * Le mutazioni (add/update/remove) usano i services e invalidano la cache.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData, QUERY_KEYS } from '../context/DataContext';
import {
  addNormativa,
  updateNormativa,
  deleteNormativa,
} from '../services/normativaService';
import { USE_SUPABASE } from '../config/constants';
import { logger } from '../utils/logger';

export const useNormativa = () => {
  const { normativa: list, loading } = useData();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.normativa });

  // ─── ADD ─────────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (item) => {
      if (!USE_SUPABASE) {
        const finalId = item.id || `norm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return Promise.resolve({ ...item, id: finalId });
      }
      return addNormativa(item);
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData(QUERY_KEYS.normativa, (old = []) => [...old, newItem]);
    },
    onError: (e) => logger.error('addNormativa error:', e),
    onSettled: invalidate,
  });

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, changes }) => {
      if (!USE_SUPABASE) return Promise.resolve({ id, changes });
      return updateNormativa(id, changes).then(() => ({ id, changes }));
    },
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.normativa });
      const previous = queryClient.getQueryData(QUERY_KEYS.normativa);
      queryClient.setQueryData(QUERY_KEYS.normativa, (old = []) =>
        old.map(item => item.id === id ? { ...item, ...changes } : item)
      );
      return { previous };
    },
    onError: (e, _vars, context) => {
      logger.error('updateNormativa error:', e);
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.normativa, context.previous);
    },
    onSettled: invalidate,
  });

  // ─── REMOVE ───────────────────────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (id) => {
      if (!USE_SUPABASE) return Promise.resolve(id);
      return deleteNormativa(id).then(() => id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.normativa });
      const previous = queryClient.getQueryData(QUERY_KEYS.normativa);
      queryClient.setQueryData(QUERY_KEYS.normativa, (old = []) =>
        old.filter(item => item.id !== id)
      );
      return { previous };
    },
    onError: (e, _id, context) => {
      logger.error('deleteNormativa error:', e);
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.normativa, context.previous);
    },
    onSettled: invalidate,
  });

  const add = async (item) => {
    try {
      await addMutation.mutateAsync(item);
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  const update = async (id, changes) => {
    try {
      await updateMutation.mutateAsync({ id, changes });
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  const remove = async (id) => {
    try {
      await removeMutation.mutateAsync(id);
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  return { list, loading, add, update, remove };
};
