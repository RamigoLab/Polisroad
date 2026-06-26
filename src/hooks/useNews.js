/**
 * useNews.js
 * Hook per le news.
 * I dati vengono dalla cache React Query gestita in DataContext.
 * Le mutazioni (add/update/remove) usano newsService e invalidano la cache.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useData, QUERY_KEYS } from '../context/DataContext';
import { addNews, updateNews, deleteNews } from '../services/newsService';
import { USE_SUPABASE } from '../config/constants';
import { logger } from '../utils/logger';

export const useNews = () => {
  const { news: list, loading } = useData();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.news });

  // ─── ADD ─────────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (item) => {
      if (!USE_SUPABASE) {
        const finalId = item.id || `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return Promise.resolve({
          ...item,
          id: finalId,
          data_creazione: item.data_creazione || new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      }
      return addNews(item);
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData(QUERY_KEYS.news, (old = []) => [newItem, ...old]);
    },
    onError: (e) => logger.error('addNews error:', e),
    onSettled: invalidate,
  });

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, changes }) => {
      if (!USE_SUPABASE) return Promise.resolve({ id, changes });
      return updateNews(id, changes).then(() => ({ id, changes }));
    },
    onMutate: async ({ id, changes }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.news });
      const previous = queryClient.getQueryData(QUERY_KEYS.news);
      queryClient.setQueryData(QUERY_KEYS.news, (old = []) =>
        old.map(item => item.id === id ? { ...item, ...changes } : item)
      );
      return { previous };
    },
    onError: (e, _vars, context) => {
      logger.error('updateNews error:', e);
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.news, context.previous);
    },
    onSettled: invalidate,
  });

  // ─── REMOVE ───────────────────────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (id) => {
      if (!USE_SUPABASE) return Promise.resolve(id);
      return deleteNews(id).then(() => id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.news });
      const previous = queryClient.getQueryData(QUERY_KEYS.news);
      queryClient.setQueryData(QUERY_KEYS.news, (old = []) =>
        old.filter(item => item.id !== id)
      );
      return { previous };
    },
    onError: (e, _id, context) => {
      logger.error('deleteNews error:', e);
      if (context?.previous) queryClient.setQueryData(QUERY_KEYS.news, context.previous);
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

  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.news });
  return { list, loading, add, update, remove, refresh };
};
