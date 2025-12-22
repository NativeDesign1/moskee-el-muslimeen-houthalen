import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './config.js';

// Creëer Supabase client
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);
