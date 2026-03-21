import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        '@aparajita/capacitor-biometric-auth',
      ],
      output: {
        manualChunks: {
          // Split large chart library into separate chunk
          'recharts': ['recharts'],
          // Split jsPDF and html2canvas (used in export)
          'pdf-export': ['jspdf', 'html2canvas'],
          // Split React vendors
          'react-vendor': ['react', 'react-dom'],
          // Split UI library
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select'],
        },
      },
    },
  },
  // Use '/' for web deployment, '' for Capacitor mobile apps
  base: '/',
});
