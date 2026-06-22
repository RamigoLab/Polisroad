import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured } from '../config/supabase';
import { useAuth } from './useAuth';
import { BADGES } from '../config/badges';
import {
  getGamificationStats,
  updateGamificationStats,
  insertXpHistory,
} from '../services/gamificationService';
import { logger } from '../utils/logger';

const queryKey = (userId) => ['gamification', userId];

export const useGamification = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  // ─── QUERY: statistiche utente ────────────────────────────────────────────
  const { data: stats = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: queryKey(userId),
    queryFn: () => getGamificationStats(userId),
    enabled: !!userId && isSupabaseConfigured,
    onError: (e) => logger.error('Error fetching gamification stats:', e),
  });

  const error = queryError?.message || null;

  // Helper: aggiorna la cache locale senza refetch
  const updateCache = useCallback((updater) => {
    queryClient.setQueryData(queryKey(userId), (old) =>
      old ? (typeof updater === 'function' ? updater(old) : { ...old, ...updater }) : old
    );
  }, [queryClient, userId]);

  // ─── ADD XP ───────────────────────────────────────────────────────────────
  const addXP = useCallback(async (amount, action = 'general') => {
    if (!userId || !stats || !isSupabaseConfigured) return;
    const safeAmount = Number(amount);
    if (!Number.isFinite(safeAmount) || safeAmount <= 0 || safeAmount > 100) {
      return { error: 'Invalid XP amount' };
    }
    try {
      const newXp = (stats.xp || 0) + safeAmount;
      const newLevel = Math.floor(Math.sqrt(newXp / 10)) + 1;
      const updates = { xp: newXp, level: newLevel };
      if (action === 'search')       updates.total_searches = (stats.total_searches || 0) + 1;
      if (action === 'favorite')     updates.total_favorites = (stats.total_favorites || 0) + 1;
      if (action === 'calculator')   updates.calculator_uses = (stats.calculator_uses || 0) + 1;
      if (action === 'article')      updates.total_articles_viewed = (stats.total_articles_viewed || 0) + 1;
      if (action === 'contestazione') updates.total_contestazioni = (stats.total_contestazioni || 0) + 1;

      // Aggiornamento ottimistico immediato
      updateCache(updates);

      await updateGamificationStats(userId, updates);
      await insertXpHistory(userId, action, safeAmount);

      return { leveledUp: newLevel > (stats.level || 1), newLevel };
    } catch (e) {
      logger.error('addXP error:', e);
      // Rollback: ricarica dal server
      queryClient.invalidateQueries({ queryKey: queryKey(userId) });
      return { error: e.message };
    }
  }, [userId, stats, updateCache, queryClient]);

  // ─── UPDATE STREAK ────────────────────────────────────────────────────────
  const updateStreak = useCallback(async () => {
    if (!userId || !stats) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      if (stats.last_activity_date === today) return;

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = stats.last_activity_date === yesterday ? (stats.current_streak || 0) + 1 : 1;
      const newLongest = Math.max(newStreak, stats.longest_streak || 0);

      const updates = {
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
      };
      updateCache(updates);
      await updateGamificationStats(userId, updates);

      let bonus = 0;
      if (newStreak >= 14) bonus = 25;
      else if (newStreak >= 7) bonus = 10;
      else if (newStreak >= 3) bonus = 5;
      if (bonus > 0) await addXP(bonus, 'streak_bonus');
    } catch (e) {
      logger.error('updateStreak error:', e);
    }
  }, [userId, stats, updateCache, addXP]);

  // ─── BADGE ────────────────────────────────────────────────────────────────
  const getUnlockedBadges = useCallback(() => {
    if (!stats) return [];
    return (stats.unlocked_badges || []).map(id => BADGES[id]).filter(Boolean);
  }, [stats]);

  const checkNewBadges = useCallback(async () => {
    if (!userId || !stats || !isSupabaseConfigured) return [];
    const unlockedSet = new Set(stats.unlocked_badges || []);
    const newlyUnlocked = [];
    Object.entries(BADGES).forEach(([key, badge]) => {
      if (!unlockedSet.has(key) && badge.unlockCondition(stats)) {
        newlyUnlocked.push(key);
        unlockedSet.add(key);
      }
    });
    if (newlyUnlocked.length) {
      const newBadges = Array.from(unlockedSet);
      updateCache({ unlocked_badges: newBadges });
      await updateGamificationStats(userId, { unlocked_badges: newBadges });
    }
    return newlyUnlocked;
  }, [userId, stats, updateCache]);

  const setFeaturedBadge = useCallback(async (badgeId) => {
    if (!userId) return;
    updateCache({ featured_badge: badgeId });
    await updateGamificationStats(userId, { featured_badge: badgeId });
  }, [userId, updateCache]);

  const resetContestazioni = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      updateCache({ total_contestazioni: 0 });
      return { error: null };
    }
    try {
      updateCache({ total_contestazioni: 0 });
      await updateGamificationStats(userId, { total_contestazioni: 0 });
      return { error: null };
    } catch (e) {
      logger.error('resetContestazioni error:', e);
      return { error: e };
    }
  }, [userId, updateCache]);

  return {
    stats,
    loading,
    error,
    addXP,
    updateStreak,
    getUnlockedBadges,
    checkNewBadges,
    setFeaturedBadge,
    resetContestazioni,
    level: stats?.level || 1,
    xp: stats?.xp || 0,
    currentStreak: stats?.current_streak || 0,
    longestStreak: stats?.longest_streak || 0,
    featuredBadge: stats?.featured_badge || null,
    unlockedBadges: getUnlockedBadges(),
  };
};
