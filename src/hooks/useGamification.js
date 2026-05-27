import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from './useAuth';
import { BADGES } from '../config/badges';

/**
 * Hook per gestire la logica di gamification.
 * - Recupera le statistiche dell'utente da Supabase.
 * - Funzioni per aggiungere XP, aggiornare lo streak, verificare sblocco badge and set featured badge.
 */
export const useGamification = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------------------------------------------------------------
  // Fetch stats al mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const fetchStats = async () => {
      try {
        const { data, error: err } = await supabase
          .from('gamification')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (err && err.code === 'PGRST116') {
          // Nessuna riga: creane una nuova
          const { data: newData, error: errInsert } = await supabase
            .from('gamification')
            .insert([{ user_id: userId }])
            .select()
            .single();
          if (errInsert) throw errInsert;
          setStats(newData);
        } else if (err) {
          throw err;
        } else {
          setStats(data);
        }
      } catch (e) {
        console.error('Error fetching gamification stats:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userId]);

  // ---------------------------------------------------------------------------
  // Add XP (e eventuali aggiornamenti di contatori)
  // ---------------------------------------------------------------------------
  const addXP = useCallback(
    async (amount, action = 'general') => {
      if (!userId || !stats || !isSupabaseConfigured || !supabase) return;
      try {
        const safeAmount = Number(amount);
        if (!Number.isFinite(safeAmount) || safeAmount <= 0 || safeAmount > 100) {
          return { error: 'Invalid XP amount' };
        }

        const { data: latestStats, error: fetchError } = await supabase
          .from('gamification')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (fetchError) throw fetchError;

        const currentStats = latestStats || stats;
        const currentXp = currentStats.xp || 0;
        const newXp = currentXp + safeAmount;
        const newLevel = Math.floor(Math.sqrt(newXp / 10)) + 1;

        // Aggiorna i contatori specifici basati sull'azione
        const updates = {
          xp: newXp,
          level: newLevel,
          updated_at: new Date()
        };
        if (action === 'search') updates.total_searches = (currentStats.total_searches || 0) + 1;
        if (action === 'favorite') updates.total_favorites = (currentStats.total_favorites || 0) + 1;
        if (action === 'calculator') updates.calculator_uses = (currentStats.calculator_uses || 0) + 1;
        if (action === 'article') updates.total_articles_viewed = (currentStats.total_articles_viewed || 0) + 1;
        if (action === 'contestazione') updates.total_contestazioni = (currentStats.total_contestazioni || 0) + 1;
        if (action === 'streak_bonus') {
          // lo streak_bonus è solo XP extra, niente contatore aggiuntivo
        }

        const { error: err } = await supabase
          .from('gamification')
          .update(updates)
          .eq('user_id', userId);
        if (err) throw err;

        // Log to history
        await supabase.from('xp_history').insert([
          { user_id: userId, action, xp_earned: safeAmount }
        ]);

        // Aggiorna lo stato locale
        setStats(prev => ({
          ...prev,
          ...updates,
          // Mantieni i contatori già aggiornati
          total_searches: updates.total_searches ?? prev.total_searches,
          total_favorites: updates.total_favorites ?? prev.total_favorites,
          calculator_uses: updates.calculator_uses ?? prev.calculator_uses,
          total_articles_viewed: updates.total_articles_viewed ?? prev.total_articles_viewed,
          total_contestazioni: updates.total_contestazioni ?? prev.total_contestazioni
        }));

        // Ritorna informazioni di livello
        return { leveledUp: newLevel > (currentStats?.level || 1), newLevel };
      } catch (e) {
        console.error('addXP error:', e);
        return { error: e.message };
      }
    },
    [userId, stats]
  );

  // ---------------------------------------------------------------------------
  // Aggiorna lo streak giornaliero
  // ---------------------------------------------------------------------------
  const updateStreak = useCallback(async () => {
    if (!userId || !stats) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const last = stats.last_activity_date;
      if (last === today) return; // già aggiornato

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isConsecutive = last === yesterday;
      const newStreak = isConsecutive ? (stats.current_streak || 0) + 1 : 1;
      const newLongest = Math.max(newStreak, stats.longest_streak || 0);

      const { error: err } = await supabase
        .from('gamification')
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
          updated_at: new Date()
        })
        .eq('user_id', userId);
      if (err) throw err;

      setStats(prev => ({
        ...prev,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today
      }));

      // Bonus XP per lo streak
      let bonus = 0;
      if (newStreak >= 14) bonus = 25;
      else if (newStreak >= 7) bonus = 10;
      else if (newStreak >= 3) bonus = 5;
      if (bonus > 0) await addXP(bonus, 'streak_bonus');
    } catch (e) {
      console.error('updateStreak error:', e);
    }
  }, [userId, stats, addXP]);

  // ---------------------------------------------------------------------------
  // Badge handling
  // ---------------------------------------------------------------------------
  const getUnlockedBadges = useCallback(() => {
    if (!stats) return [];
    const ids = stats.unlocked_badges || [];
    return ids.map(id => BADGES[id]).filter(Boolean);
  }, [stats]);

  const checkNewBadges = useCallback(async () => {
    if (!userId || !stats || !isSupabaseConfigured || !supabase) return [];
    const unlockedSet = new Set(stats.unlocked_badges || []);
    const newlyUnlocked = [];
    Object.entries(BADGES).forEach(([key, badge]) => {
      if (!unlockedSet.has(key) && badge.unlockCondition(stats)) {
        newlyUnlocked.push(key);
        unlockedSet.add(key);
      }
    });
    if (newlyUnlocked.length) {
      const { error: err } = await supabase
        .from('gamification')
        .update({ unlocked_badges: Array.from(unlockedSet), updated_at: new Date() })
        .eq('user_id', userId);
      if (err) throw err;
      setStats(prev => ({ ...prev, unlocked_badges: Array.from(unlockedSet) }));
    }
    return newlyUnlocked;
  }, [userId, stats]);

  const setFeaturedBadge = useCallback(async badgeId => {
    if (!userId) return;
    const { error: err } = await supabase
      .from('gamification')
      .update({ featured_badge: badgeId, updated_at: new Date() })
      .eq('user_id', userId);
    if (err) throw err;
    setStats(prev => ({ ...prev, featured_badge: badgeId }));
  }, [userId]);

  // ---------------------------------------------------------------------------
  // Expose helpers
  // ---------------------------------------------------------------------------
  return {
    stats,
    loading,
    error,
    addXP,
    updateStreak,
    getUnlockedBadges,
    checkNewBadges,
    setFeaturedBadge,
    level: stats?.level || 1,
    xp: stats?.xp || 0,
    currentStreak: stats?.current_streak || 0,
    longestStreak: stats?.longest_streak || 0,
    featuredBadge: stats?.featured_badge || null,
    unlockedBadges: getUnlockedBadges()
  };
};
