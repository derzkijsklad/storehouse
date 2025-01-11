import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    'import.meta.env.MODE': JSON.stringify(mode),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
