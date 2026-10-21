import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // One copy of React for every package (motion was added while the dev server ran).
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { include: ['react', 'react-dom', 'react-router-dom', 'motion/react', 'lenis'] },
  server: { port: 5173 },
});
