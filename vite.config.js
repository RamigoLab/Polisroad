import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // __BUILD_TIMESTAMP__ era referenziato in src/sw.js per dare un nome univoco
  // alla cache ad ogni deploy (polisroad-<timestamp>), così l'activate handler
  // può ripulire la cache della versione precedente. Non era mai definito qui:
  // il nome cache restava sempre "polisroad-dev" in produzione, quindi la
  // pulizia automatica non scattava mai e i file con hash delle build vecchie
  // restavano accumulati in Cache Storage senza mai essere rimossi.
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(Date.now().toString()),
  },
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
    // 'hidden': genera i file .map ma NON li referenzia nel bundle servito
    // (nessun //# sourceMappingURL nei file .js pubblici, quindi non sono
    // scaricabili/ispezionabili dal browser). Prima erano disabilitati del
    // tutto: ogni errore catturato da Sentry mostrava stack trace minificati
    // e illeggibili (es. "at t.a (index-xyz.js:1:2345)"). Lo script
    // "postbuild" in package.json elimina questi .map da dist/ dopo il
    // build, perché al momento nessuna pipeline li carica su Sentry — senza
    // quella pulizia, Vercel li pubblicherebbe comunque come file statici
    // (raggiungibili da URL diretto anche se non auto-caricati dal browser).
    // Per avere stack trace leggibili in Sentry in futuro: aggiungere
    // @sentry/vite-plugin con un auth token Sentry (da mettere come env var
    // su Vercel, mai nel codice) che carica i .map su Sentry PRIMA che
    // scattino postbuild/deploy, poi rimuovere questa riga da postbuild.
    sourcemap: 'hidden',
    minify: 'esbuild',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // react e supabase restano isolati apposta: sono grosse dipendenze
          // condivise da (quasi) tutte le pagine, così il loro hash cambia solo
          // quando si aggiorna la libreria stessa, non ad ogni deploy — ottimo
          // per la cache del browser tra una versione e l'altra dell'app.
          if (id.includes('react')) return 'react'
          if (id.includes('@supabase')) return 'supabase'
          // PRIMA: `if (id.includes('node_modules')) return 'vendor'` forzava
          // OGNI altra dipendenza (fuse.js, dompurify, posthog, sentry...) in
          // un unico chunk "vendor" da 311KB, precaricato su OGNI pagina —
          // anche Profilo, Home, Calcolatore, che non usano mai Fuse.js.
          // Rimossa: senza questa regola, Rollup applica lo splitting
          // automatico e lega ogni libreria solo ai chunk che la importano
          // davvero (es. fuse.js finisce solo nei chunk di ricerca).
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
