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

    // Analyzer attivo solo con: npm run build -- --mode analyze
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),

  ].filter(Boolean),

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('react')) {
            return 'react-core'
          }

          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }

          if (id.includes('@supabase')) {
            return 'supabase'
          }

          if (id.includes('fuse.js')) {
            return 'fuse'
          }

          if (id.includes('posthog-js')) {
            return 'posthog'
          }

          if (id.includes('idb-keyval')) {
            return 'idb'
          }

          return 'vendor'
        }
      }
    }
  },

  optimizeDeps: {
    include: ['react', 'react-dom']
  }

}))
