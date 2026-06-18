import { useEffect } from 'react';
import { useGamification } from './useGamification';
import { useAuth } from './useAuth';

import { logger } from '../utils/logger';
/**
 * Hook che si attiva ALL'AVVIO dell'app per:
 * 1. Aggiornare lo streak quotidiano
 * 2. Controllare e sbloccare nuovi badge
 * 3. Registrare l'accesso dell'utente
 */
export const useInitializeGamification = () => {
  const { session } = useAuth();
  const { stats, loading, updateStreak, checkNewBadges } = useGamification();

  useEffect(() => {
    if (!session?.user?.id || loading || !stats) return;

    const initialize = async () => {
      try {
        // Step 1: Aggiorna lo streak quotidiano
        await updateStreak();
        
        // Step 2: Controlla e sblocca nuovi badge
        const newBadges = await checkNewBadges();
        
        if (newBadges && newBadges.length > 0) {
          logger.log('🏆 Nuovi badge sbloccati:', newBadges);
        }
      } catch (e) {
        logger.error('❌ Gamification initialization error:', e);
      }
    };

    initialize();
  }, [session?.user?.id, loading, stats, updateStreak, checkNewBadges]);
};
