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
        skipWaiting: true,

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 giorno
              }
            }
          }
        ]
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
    cssMinify: true,
    chunkSizeWarningLimit: 700,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // 🔥 PRIORITÀ: chunk intelligenti

          // React core
          if (id.includes('react')) {
            return 'react'
          }

          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase'
          }

          // librerie grandi comuni
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  },

  resolve: {
    alias: {
      '@': '/src'
    }
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js'
    ]
  },

  server: {
    port: 5173,
    open: true
  },

  preview: {
    port: 5173
  }
})