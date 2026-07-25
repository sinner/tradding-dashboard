import path from 'node:path';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project site: https://sinner.github.io/tradding-dashboard/
// Local `pnpm dev` uses `/` so http://127.0.0.1:5173/ works without a base-URL error.
const githubPagesBase = '/tradding-dashboard/';

const { version: appVersion } = JSON.parse(
  readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'),
) as { version: string };

export default defineConfig(({ command }) => ({
  base: command === 'build' ? githubPagesBase : '/',
  plugins: [
    react(),
    {
      name: 'inject-app-version',
      transformIndexHtml(html) {
        return html.replaceAll('%APP_VERSION%', appVersion);
      },
    },
  ],
  // Available in app code as import.meta.env.VITE_APP_VERSION
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
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
