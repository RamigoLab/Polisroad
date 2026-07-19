import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'scratch_colors.js', 'scratch_colors.cjs']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': 'off',
      // Sicurezza: blocca costrutti pericolosi
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
    },
  },
  {
    files: ['scripts/**/*.js', 'vite.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // sw.js gira nello scope globale del Service Worker (self, caches,
    // clients, ecc.), diverso da quello del browser normale — senza questo,
    // eslint segnalava 'clients' come non definito. __BUILD_TIMESTAMP__ è
    // iniettato a build-time da vite.config.js (vedi commento lì), non
    // esiste finché vite non lo sostituisce nel bundle finale.
    files: ['src/sw.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        __BUILD_TIMESTAMP__: 'readonly',
      },
    },
  },
])
