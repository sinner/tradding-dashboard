import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves project sites from /{repo}/. Keep dev at / for convenience.
const githubPagesBase = '/tradding-dashboard/';

// GitHub Pages serves under /btc-dashboard/; local dev uses `/` so
// http://127.0.0.1:5173/ works without Vite's base-URL error page.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? githubPagesBase : '/',
  plugins: [react()],
  server: {
    open: '/',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          d3: ['d3'],
        },
      },
    },
  },
}));
