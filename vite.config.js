import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      devOptions: {
        enabled: process.env.VITE_PWA_DEV === 'true'
      },
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'PolisRoad',
        short_name: 'PolisRoad',
        description: "Codice della Strada per Forze dell'Ordine",
        theme_color: '#1a3a5c',
        background_color: '#f5f7fa',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    // Bundle analyzer — attivo solo con: npm run build:analyze
    // Genera dist/stats.html con grafico interattivo delle dimensioni
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 'treemap' | 'sunburst' | 'network'
    }),
  ].filter(Boolean),

  build: {
    rollupOptions: {
      output: {
        // Chunking manuale: separa le librerie grosse in chunk dedicati
        // per massimizzare il caching del browser
        manualChunks: {
          'react-core':  ['react', 'react-dom'],
          'query':       ['@tanstack/react-query', '@tanstack/react-query-persist-client'],
          'supabase':    ['@supabase/supabase-js'],
          'fuse':        ['fuse.js'],
          'posthog':     ['posthog-js'],
          'idb':         ['idb-keyval'],
        }
      }
    }
  }
}))
