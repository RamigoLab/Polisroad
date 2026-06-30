# PolisRoad v1.9.5

Sistema PWA di supporto alle attività di controllo in materia di circolazione stradale, riservato alle forze dell'ordine italiane.

## Stack Tecnico

- **Frontend**: React 19 + Vite 5 (pinato a ^5.4.19 per compatibilità vite-plugin-pwa)
- **Icone**: lucide-react v0.383 — set unificato via `Icon.jsx`, strokeWidth 1.75, colori da tema
- **PWA**: vite-plugin-pwa con strategia `injectManifest` e custom `src/sw.js`
- **Backend**: Supabase (Auth PKCE, Database PostgreSQL, Edge Functions, RLS)
- **Data Fetching**: TanStack Query v5 con persistenza IndexedDB
- **Deployment**: Vercel + GitHub Desktop
- **Analytics**: PostHog EU cloud
- **Errori**: Sentry

## Novità 1.9.5

**Redesign grafico**
- Sistema di colori aggiornato via CSS custom properties (light/dark mode)
- Header con gradient `primary → accent` su tutte le pagine
- Card con `box-shadow` leggera e `border` sottile — aspetto moderno senza 3D
- Palette icone coerente: ogni sezione ha bg+color dedicati definiti in `C.icon*`

**Profilo ridisegnato**
- Struttura a gruppi iOS-style con label di sezione
- Statistiche di utilizzo reali (preferiti, note, segnalazioni)
- Blocco Help Desk con azioni dirette
- Zona pericolosa separata con margine deliberato

**Bug fix**
- `useSyncQueue` non scrive più su `xp_history` (rimossa con gamification)
- Auth PKCE flow, CSP Sentry, CORS send-push, storage.js TextEncoder
- Popup backdrop click-outside, NavCard dark mode, codice morto rimosso

## Migrazioni Supabase (v1.9.5)

1. **`20260629_drop_gamification_tables.sql`** — rimuove `gamification` e `xp_history`
2. **`20260629_notify_admin_on_new_user.sql`** (da v1.9.4) — trigger push admin

   ⚠️ `pg_net` richiede piano Supabase **Pro o superiore**. Su Free tier il trigger viene creato ma non può inviare richieste HTTP — fallirà silenziosamente senza bloccare l'insert del profilo.

## Edge Functions da redeployare

```bash
supabase functions deploy delete-user   # check admin + self (v1.9.4)
supabase functions deploy send-push     # CORS ristretto (v1.9.5)
```

## Auth PKCE — configurazione Supabase

In Dashboard → Authentication → URL Configuration verificare:
- **Site URL**: `https://polisroad.vercel.app`
- **Redirect URLs**: `https://polisroad.vercel.app/**`

## Variabili d'Ambiente

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_POSTHOG_KEY=phc_...
VITE_POSTHOG_HOST=https://eu.i.posthog.com
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_VAPID_PUBLIC_KEY=...
VITE_CACHE_BUSTER=1.9.5
```

## Comandi

```bash
npm install
npm run dev       # sviluppo locale
npm run build     # build produzione
npm run preview   # anteprima build
```
