import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },

      manifest: {
        name: 'PolisRoad',
        short_name: 'PolisRoad',
        description: 'Applicazione operativa per rilievi e prontuario',
        theme_color: '#0f172a',
        background_color: '#0f172a',
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