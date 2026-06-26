import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // 'prompt': il nuovo SW viene installato ma NON prende controllo finché
      // l'utente non clicca "Riavvia & Aggiorna" nel banner PwaUpdater.
      registerType: 'prompt',
      injectRegister: 'auto',

      // injectManifest: Workbox inietta il precache manifest nel nostro sw.js
      // custom, dove gestiamo anche gli eventi push e notificationclick.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',

      injectManifest: {
        // Pattern dei file da precachare
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },

      // Il manifest viene definito qui (autorità unica) — il file
      // public/manifest.json viene ignorato in favore di questo.
      // IMPORTANTE: serve `purpose: 'any maskable'` su almeno un'icona
      // affinché Chrome mostri il prompt di installazione.
      manifest: {
        name: 'PolisRoad',
        short_name: 'PolisRoad',
        description: 'Codice della Strada per Forze dell\'Ordine',
        theme_color: '#1a3a5c',
        background_color: '#1a3a5c',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    })
  ],

  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // React separato (cache migliore)
          if (id.includes('react')) {
            return 'react'
          }

          // Supabase separato
          if (id.includes('@supabase')) {
            return 'supabase'
          }

          // Tutte le altre dipendenze
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  },

  server: {
    port: 5173,
    open: true
  },

  preview: {
    port: 5173
  }
})