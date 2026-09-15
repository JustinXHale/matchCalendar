import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'icons/icon.svg'],
      manifest: {
        name: 'Match Calendar',
        short_name: 'MatchCal',
        description: 'Personal match schedule and record for sports officials',
        theme_color: '#000000',
        background_color: '#F9FAFB',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('node_modules/firebase/firestore/')) {
            return 'vendor-firebase-firestore';
          }
          if (id.includes('node_modules/firebase/auth/')) {
            return 'vendor-firebase-auth';
          }
          if (id.includes('node_modules/firebase/')) {
            return 'vendor-firebase-core';
          }
          if (
            id.includes('node_modules/@patternfly/react-core/') ||
            id.includes('node_modules/@patternfly/react-icons/')
          ) {
            return 'vendor-patternfly';
          }
          if (id.includes('node_modules/react-router-dom/')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/@fortawesome/')) {
            return 'vendor-icons';
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
});
