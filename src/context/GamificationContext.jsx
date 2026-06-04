import React, { createContext, useCallback } from 'react';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../hooks/useAuth';

export const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
  const { session } = useAuth();
  const { 
    stats, 
    loading, 
    error,
    addXP, 
    updateStreak, 
    checkNewBadges,
    getUnlockedBadges,
    setFeaturedBadge,
    resetContestazioni,
    level,
    xp,
    currentStreak,
    longestStreak,
    featuredBadge,
    unlockedBadges
  } = useGamification();

  // Wrapper con error handling e logging
  const safeAddXP = useCallback(async (amount, action) => {
    if (!session?.user?.id) {
      console.warn('⚠️ No user session for XP');
      return;
    }
    try {
      const result = await addXP(amount, action);
      if (result && !result.error) {
        console.log(`✅ XP +${amount} for action: ${action}`);
      }
      return result;
    } catch (e) {
      console.error(`❌ Error adding XP for action ${action}:`, e);
    }
  }, [session?.user?.id, addXP]);

  const value = {
    // Stats
    stats,
    loading,
    error,
    level,
    xp,
    currentStreak,
    longestStreak,
    featuredBadge,
    unlockedBadges,
    
    // Methods
    addXP: safeAddXP,
    updateStreak,
    checkNewBadges,
    getUnlockedBadges,
    setFeaturedBadge,
    resetContestazioni
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

// Custom hook per usare il context
export const useGamificationContext = () => {
  const context = React.useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamificationContext must be used within GamificationProvider');
  }
  return context;
};
