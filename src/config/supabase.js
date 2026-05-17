import { createClient } from '@supabase/supabase-js';
import { USE_SUPABASE } from './constants';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Controlla se le variabili esistono prima di creare il client
const isConfigured = supabaseUrl && supabaseAnonKey;

// Esporta un flag per sapere se Supabase è realmente configurato
export const isSupabaseConfigured = USE_SUPABASE && isConfigured;

if (USE_SUPABASE && !isConfigured) {
  console.warn("⚠️ PolisRoad: Variabili Supabase mancanti (.env). L'app userà i dati locali (Demo Mode).");
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
