# Changelog PolisRoad

## [1.9.5] — 29 Giugno 2026

### Corretto
- **`useSyncQueue`**: rimosso blocco `SAVE_CONTESTAZIONE` che tentava di scrivere su `xp_history` (tabella eliminata con la gamification in v1.9.4) — le contestazioni offline non crashavano silenziosamente al rientro online
- **Home — popup modale**: aggiunto `onClick={handleDismissPopup}` al backdrop e `stopPropagation` sul contenuto — click-outside ora chiude il popup
- **Home — NavCard**: label usa `C.text` invece di `'#333'` hardcoded — rispetta correttamente la dark mode
- **Profilo**: rimosso state `reportOpen` dichiarato ma mai utilizzato nel render (codice morto residuo)
- **App.jsx**: rimosso `dataLoading` estratto da `useData()` ma mai referenziato
- **Auth — PKCE flow**: `flowType: 'pkce'` invece di `'implicit'`; il flow implicit espone i token nel hash fragment dell'URL, PKCE è lo standard OAuth2 moderno raccomandato da Supabase
- **`storage.js`**: sostituite le funzioni deprecate `escape()`/`unescape()` con `TextEncoder`/`TextDecoder` per l'encoding base64 UTF-8
- **`send-push` Edge Function**: CORS ristretto alle origini autorizzate (`polisroad.vercel.app`, `polisroad.it`) invece del wildcard `*`
- **`vercel.json` CSP**: aggiunti `https://*.sentry.io` e `https://*.ingest.sentry.io` a `connect-src`; aggiunto `worker-src 'self'` per Service Worker
- **AdminDashboard**: ping Supabase ora gestisce eccezioni di rete tramite `.catch()` separato

### Aggiunto
- **Migration `20260629_drop_gamification_tables.sql`**: rimuove le tabelle `gamification` e `xp_history` ormai inutilizzate (con `IF EXISTS` per sicurezza)

## [1.9.4] — 29 Giugno 2026
- Rimossa gamification (XP, badge, streak)
- Fix critico: delete-user Edge Function consentiva solo auto-eliminazione (403 per admin)
- Fix: race condition eliminazione account in Profilo
- Notifica push admin su nuova registrazione (`pg_net` trigger)
- SW bypass cache per chiamate Supabase
- Profilo a sezioni collassabili
- Home: footer unificato, NavCard con feedback touch
- Ricerca: filtri per tipo
- Calcolatore: persistenza sessionStorage
- AdminUtenti: data registrazione, fix pendingCount
- Dashboard: stato Supabase in tempo reale

## [1.9.3] — 28 Giugno 2026
- Fix crash Home (null guard featuredBadge)
- Fix recupero password

## [1.9.2] — 28 Giugno 2026
- Fix blocco login utenti non-admin
- Fix flash iOS schermata approvazione
- Fix build Vite

## [1.9.1] — 27 Giugno 2026
- Fix RLS deadlock profiles
- Fix push subscriptions RLS

## [1.9.0] — 26 Giugno 2026
- Wizard onboarding
- AdminNotifiche broadcast push
- AdminUtenti con delete
- PWA install prompt
- Ricerca globale
