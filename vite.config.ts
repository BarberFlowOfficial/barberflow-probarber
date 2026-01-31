import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_KEY;
  const barberflowClientUrl = env.BARBERFLOW_CLIENT_URL;
  const barberflowIntegrateUrl = env.BARBERFLOW_INTEGRATE_URL;

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_KEY': JSON.stringify(supabaseKey),
      'import.meta.env.VITE_BARBERFLOW_CLIENT_URL': JSON.stringify(barberflowClientUrl),
      'import.meta.env.VITE_BARBERFLOW_INTEGRATE_URL': JSON.stringify(barberflowIntegrateUrl)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
