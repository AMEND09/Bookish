import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['gun', 'gun/sea', 'gun/lib/then']
  },
  base: "/Bookish/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
          gun: ['gun']
        }
      }
    },
    sourcemap: false // Disable source maps to avoid source map errors
  },
  server: {
    open: true,
    hmr: {
      overlay: false // Disable error overlay for WebSocket issues
    }
  }
});
