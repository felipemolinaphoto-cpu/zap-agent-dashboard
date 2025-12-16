import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Permite acessar process.env no código do cliente (necessário para a API Key na Vercel)
    'process.env': process.env
  }
});