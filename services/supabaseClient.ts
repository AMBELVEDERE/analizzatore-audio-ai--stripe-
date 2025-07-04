import { createClient } from '@supabase/supabase-js'

// Legge le variabili d'ambiente fornite da Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Esporta il client di Supabase configurato
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);