/**
 * useProntuario.js
 * Hook per il prontuario delle infrazioni.
 * I dati vengono dalla cache React Query gestita in DataContext.
 * Le mutazioni (add/update/remove) usano prontuarioService e invalidano la cache.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData, QUERY_KEYS } from '../context/DataContext';
import {
  addProntuarioItem,
  updateProntuarioItem,
  deleteProntuarioItem,
} from '../services/prontuarioService';
import { USE_SUPABASE } from '../config/constants';
import { logger } from '../utils/logger';

export const useProntuario = () => {
  const { prontuario: list, loading } = useData();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.prontuario });

  // ─── ADD ─────────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (item) => {
      if (!USE_SUPABASE) {
        return Promise.resolve({ ...item, id: Date.now().toString() });
      }
      return addProntuarioItem(item);
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData(QUERY_KEYS.prontuario, (old = []) => [...old, newItem]);
    },
    onError: (e) => logger.error('addProntuario error:', e),
    onSettled: invalidate,
  });

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, changes }) => {
      if (!USE_SUPABASE) return Promise.resolve({ id, changes });
      return updateProntuarioItem(id, changes).then(() => ({ id, changes }));
    },
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.prontuario });
      const previous = queryClient.getQueryData(QUERY_KEYS.prontuario);
      queryClient.setQueryData(QUERY_KEYS.prontuario, (old = []) =>
        old.map(item => item.id === id ? { ...item, ...changes } : item)
      );
      return { previous };
    },
    onError: (e, _vars, context) => {
      logger.error('updateProntuario error:', e);
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.prontuario, context.previous);
    },
    onSettled: invalidate,
  });

  // ─── REMOVE ───────────────────────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (id) => {
      if (!USE_SUPABASE) return Promise.resolve(id);
      return deleteProntuarioItem(id).then(() => id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.prontuario });
      const previous = queryClient.getQueryData(QUERY_KEYS.prontuario);
      queryClient.setQueryData(QUERY_KEYS.prontuario, (old = []) =>
        old.filter(item => item.id !== id)
      );
      return { previous };
    },
    onError: (e, _id, context) => {
      logger.error('deleteProntuario error:', e);
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.prontuario, context.previous);
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

  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.prontuario });
  return { list, loading, add, update, remove, refresh };
};
