import { createClient } from '@supabase/supabase-js';
import { USE_SUPABASE } from './constants';
import { logger } from '../utils/logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const isSupabaseConfigured = USE_SUPABASE && isConfigured;

if (USE_SUPABASE && !isConfigured) {
  logger.warn("PolisRoad: variabili Supabase mancanti (.env). L'app userà i dati locali.");
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true,
      },
    })
  : null;
