import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Reduce main-thread work on load: split heavy/rarely-needed vendor code
    // into its own chunk instead of one giant bundle.
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/database'],
        },
      },
    },
    // Helps spot any future regressions back toward a bloated bundle.
    chunkSizeWarningLimit: 400,
  },
});
