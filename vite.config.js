import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',

      injectManifest: {
        swSrc: resolve(__dirname, 'src/sw.js'),
        swDest: 'dist/sw.js',
        globDirectory: 'dist',
        globPatterns: [
          'index.html',
          'assets/**/*.{js,css}',
          '**/*.{ico,png,svg,woff2,webmanifest}',
        ],
        rollupFormat: 'iife',
      },

      manifest: {
        name: 'PolisRoad',
        short_name: 'PolisRoad',
        description: "Codice della Strada per Forze dell'Ordine",
        theme_color: '#1a3a5c',
        background_color: '#1a3a5c',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],

  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react')) return 'react'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },

  server: {
    port: 5173,
    open: true,
  },

  preview: {
    port: 5173,
  },
})
