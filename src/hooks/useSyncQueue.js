import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './useAuth';
import { useToast } from '../components/ui/ToastManager';

/**
 * Hook to manage offline-first synchronization queue.
 * Persists failed database actions to localStorage and retries them automatically when online.
 */
export const useSyncQueue = () => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('polisroad_sync_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  // Save queue to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('polisroad_sync_queue', JSON.stringify(queue));
  }, [queue]);

  const addToQueue = useCallback((type, payload) => {
    const newAction = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type,
      payload,
      timestamp: Date.now(),
      attempts: 0,
    };
    setQueue((prev) => [...prev, newAction]);
    showToast('Offline: azione salvata in coda per la sincronizzazione.', 'warning');
  }, [showToast]);

  const processAction = useCallback(async (action) => {
    if (!session?.user) return false;

    const { type, payload } = action;
    const userId = session.user.id;

    try {
      if (type === 'SAVE_NOTE') {
        const { prontuarioId, testo } = payload;
        if (!testo || testo.trim() === '') {
          const { error } = await supabase
            .from('note')
            .delete()
            .match({ user_id: userId, prontuario_id: prontuarioId });
          if (error) throw error;
        } else {
          const { error } = await supabase.from('note').upsert(
            { user_id: userId, prontuario_id: prontuarioId, testo: testo },
            { onConflict: 'user_id, prontuario_id' }
          );
          if (error) throw error;
        }
      }
      return true; // Success
    } catch (err) {
      console.error('Failed to sync action:', action, err);
      return false; // Failed
    }
  }, [session]);

  const processQueue = useCallback(async () => {
    if (queue.length === 0 || !navigator.onLine || !session?.user) return;

    showToast('Sincronizzazione in corso...', 'info');
    const remaining = [];
    let successCount = 0;

    for (const action of queue) {
      const success = await processAction(action);
      if (success) {
        successCount++;
      } else {
        const updatedAction = { ...action, attempts: action.attempts + 1 };
        if (updatedAction.attempts < 3) {
          remaining.push(updatedAction);
        } else {
          console.warn('Action failed after 3 attempts, discarding:', action);
        }
      }
    }

    setQueue(remaining);

    if (successCount > 0) {
      showToast(`Sincronizzazione completata: ${successCount} azioni sincronizzate!`, 'success');
    }
    if (remaining.length > 0) {
      showToast(`${remaining.length} azioni ancora in coda. Riprovo più tardi.`, 'error');
    }
  }, [queue, processAction, session, showToast]);

  // Synchronize network status listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Sei di nuovo online!', 'success');
      processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Sei offline. Le modifiche saranno salvate in locale.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check/sync if we mount while online
    if (navigator.onLine && queue.length > 0) {
      processQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processQueue, queue.length, showToast]);

  return {
    queue,
    isOnline,
    addToQueue,
    processQueue,
  };
};
