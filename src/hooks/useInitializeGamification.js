import { useEffect } from 'react';
import { useGamificationContext } from '../context/GamificationContext';
import { useAuth } from './useAuth';

import { logger } from '../utils/logger';
/**
 * Hook che si attiva ALL'AVVIO dell'app per:
 * 1. Aggiornare lo streak quotidiano
 * 2. Controllare e sbloccare nuovi badge
 * 3. Registrare l'accesso dell'utente
 *
 * Usa useGamificationContext invece di useGamification direttamente,
 * evitando una seconda istanza separata dell'hook con fetch duplicati.
 */
export const useInitializeGamification = () => {
  const { session } = useAuth();
  const { stats, loading, updateStreak, checkNewBadges } = useGamificationContext();

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
