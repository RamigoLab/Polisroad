import { createClient } from '@supabase/supabase-js';
import { USE_SUPABASE } from './constants';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inizializza il client solo se USE_SUPABASE è true
export const supabase = USE_SUPABASE ? createClient(supabaseUrl, supabaseAnonKey) : null;
