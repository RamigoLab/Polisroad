/**
 * useSearchSynonyms.js
 * Hook per i sinonimi di ricerca (search_synonyms).
 * I dati vengono dalla cache React Query gestita in DataContext.
 * Le mutazioni (add/update/remove) usano synonymsService e invalidano la cache.
 * Stesso pattern di useProntuario.js.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData, QUERY_KEYS } from '../context/DataContext';
import {
  addSynonym,
  updateSynonym,
  deleteSynonym,
} from '../services/synonymsService';
import { logger } from '../utils/logger';

export const useSearchSynonyms = () => {
  const { searchSynonyms: list, synonymsLoading: loading } = useData();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.searchSynonyms });

  const addMutation = useMutation({
    mutationFn: (item) => addSynonym(item),
    onSuccess: (newItem) => {
      queryClient.setQueryData(QUERY_KEYS.searchSynonyms, (old = []) => [...old, newItem]);
    },
    onError: (e) => logger.error('addSynonym error:', e),
    onSettled: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }) => updateSynonym(id, changes).then(() => ({ id, changes })),
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.searchSynonyms });
      const previous = queryClient.getQueryData(QUERY_KEYS.searchSynonyms);
      queryClient.setQueryData(QUERY_KEYS.searchSynonyms, (old = []) =>
        old.map(item => item.id === id ? { ...item, ...changes } : item)
      );
      return { previous };
    },
    onError: (e, _vars, context) => {
      logger.error('updateSynonym error:', e);
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.searchSynonyms, context.previous);
    },
    onSettled: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id) => deleteSynonym(id).then(() => id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.searchSynonyms });
      const previous = queryClient.getQueryData(QUERY_KEYS.searchSynonyms);
      queryClient.setQueryData(QUERY_KEYS.searchSynonyms, (old = []) =>
        old.filter(item => item.id !== id)
      );
      return { previous };
    },
    onError: (e, _id, context) => {
      logger.error('deleteSynonym error:', e);
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.searchSynonyms, context.previous);
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

  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.searchSynonyms });
  return { list, loading, add, update, remove, refresh };
};
