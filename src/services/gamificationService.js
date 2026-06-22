/**
 * gamificationService.js
 * Centralizza tutte le chiamate Supabase per la gamification.
 */
import { supabase } from '../config/supabase';

export async function getGamificationStats(userId) {
  const { data, error } = await supabase
    .from('gamification')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Nessuna riga: creane una nuova
    const { data: newData, error: insertErr } = await supabase
      .from('gamification')
      .insert([{ user_id: userId }])
      .select()
      .single();
    if (insertErr) throw insertErr;
    return newData;
  }
  if (error) throw error;
  return data;
}

export async function updateGamificationStats(userId, updates) {
  const { error } = await supabase
    .from('gamification')
    .update({ ...updates, updated_at: new Date() })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function insertXpHistory(userId, action, xpEarned) {
  const { error } = await supabase
    .from('xp_history')
    .insert([{ user_id: userId, action, xp_earned: xpEarned }]);
  if (error) throw error;
}
