import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn("ATTENZIONE: Le variabili d'ambiente SUPABASE_URL e SUPABASE_ANON_KEY non sono impostate. Le funzionalità di autenticazione saranno disabilitate. Per favore, aggiungile al tuo ambiente.");
}

// Inizializza il client con valori fittizi se non configurato, per evitare crash.
// La logica dell'app userà 'isSupabaseConfigured' per mostrare un messaggio di errore all'utente.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', 
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs'
);
