import path from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BASE = '/btc-dashboard/';

/** Redirect `/` → base path so opening localhost:5173 works in dev. */
function redirectBase(): Plugin {
  return {
    name: 'redirect-base',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (url === '/' || url === '') {
          res.statusCode = 302;
          res.setHeader('Location', BASE);
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [redirectBase(), react()],
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
});
