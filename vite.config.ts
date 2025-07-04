import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carica le variabili d'ambiente per la modalità corrente (es. development)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Definisce le variabili da rendere disponibili nel codice
    define: {
      'process.env': env
    }
  }
})