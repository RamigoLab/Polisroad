import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './useAuth';
import { useToast } from '../components/ui/ToastManager';
import { logger } from '../utils/logger';

/**
 * Hook per la sincronizzazione offline-first.
 * Persiste in localStorage le azioni fallite e le riprova al ritorno online.
 *
 * Tipi supportati:
 *  - SAVE_NOTE          { prontuarioId, testo }
 *  - TOGGLE_PREFERITO   { prontuarioId, action: 'add'|'remove' }
 */
export const useSyncQueue = () => {
  const { session } = useAuth();
  const { showToast } = useToast();

  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('polisroad_sync_queue');
      const parsed = saved ? JSON.parse(saved) : [];
      // Filtra eventuali SAVE_CONTESTAZIONE rimasti in coda da versioni precedenti
      return parsed.filter(a => a.type !== 'SAVE_CONTESTAZIONE');
    } catch { return []; }
  });

  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const queueRef = useRef(queue);
  useEffect(() => {
    queueRef.current = queue;
    localStorage.setItem('polisroad_sync_queue', JSON.stringify(queue));
  }, [queue]);

  const addToQueue = useCallback((type, payload) => {
    setQueue(prev => [...prev, {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type, payload,
      timestamp: Date.now(),
      attempts: 0,
    }]);
    showToast('Offline: azione salvata, verrà sincronizzata al rientro online.', 'warning');
  }, [showToast]);

  const processAction = useCallback(async (action) => {
    if (!session?.user) return false;
    const { type, payload } = action;
    const userId = session.user.id;

    try {
      if (type === 'SAVE_NOTE') {
        const { prontuarioId, testo } = payload ?? {};
        if (!prontuarioId) return true;
        if (!testo?.trim()) {
          const { error } = await supabase.from('note').delete()
            .match({ user_id: userId, prontuario_id: prontuarioId });
          if (error) throw error;
        } else {
          const { error } = await supabase.from('note')
            .upsert({ user_id: userId, prontuario_id: prontuarioId, testo },
              { onConflict: 'user_id, prontuario_id' });
          if (error) throw error;
        }

      } else if (type === 'TOGGLE_PREFERITO') {
        const { prontuarioId, action: favAction } = payload ?? {};
        if (!prontuarioId) return true;
        if (favAction === 'add') {
          const { error } = await supabase.from('preferiti')
            .insert({ user_id: userId, prontuario_id: prontuarioId });
          if (error && error.code !== '23505') throw error;
        } else {
          const { error } = await supabase.from('preferiti')
            .delete().match({ user_id: userId, prontuario_id: prontuarioId });
          if (error) throw error;
        }

      } else {
        logger.warn('useSyncQueue: tipo azione non riconosciuto, scartato:', type);
        return true; // scarta senza bloccare la coda
      }

      return true;
    } catch (err) {
      logger.error('Failed to sync action:', action, err);
      return false;
    }
  }, [session]);

  const processQueue = useCallback(async () => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0 || !navigator.onLine || !session?.user) return;

    showToast('Sincronizzazione in corso...', 'info');
    const remaining = [];
    let successCount = 0;

    for (const action of currentQueue) {
      const success = await processAction(action);
      if (success) {
        successCount++;
      } else {
        const updated = { ...action, attempts: action.attempts + 1 };
        if (updated.attempts < 3) remaining.push(updated);
        else logger.warn('Azione scartata dopo 3 tentativi:', action);
      }
    }

    setQueue(remaining);
    if (successCount > 0) showToast(`Sincronizzati ${successCount} elementi.`, 'success');
    if (remaining.length > 0) showToast(`${remaining.length} elementi ancora in coda.`, 'error');
  }, [processAction, session, showToast]);

  const processQueueRef = useRef(processQueue);
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Sei di nuovo online!', 'success');
      processQueueRef.current();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Sei offline. Le modifiche saranno salvate localmente.', 'warning');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  const queueLength = queue.length;
  useEffect(() => {
    if (navigator.onLine && queueLength > 0 && session?.user) {
      processQueueRef.current();
    }
  }, [queueLength, session]);

  return { queue, isOnline, addToQueue, processQueue };
};
