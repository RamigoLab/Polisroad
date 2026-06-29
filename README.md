# PolisRoad v1.9.5

Sistema PWA di supporto alle attività di controllo in materia di circolazione stradale, riservato alle forze dell'ordine italiane.

## Stack Tecnico

- **Frontend**: React 19 + Vite 5 (pinato a ^5.4.19 per compatibilità vite-plugin-pwa)
- **PWA**: vite-plugin-pwa con strategia `injectManifest` e custom `src/sw.js`
- **Backend**: Supabase (Auth, Database PostgreSQL, Edge Functions, RLS)
- **Data Fetching**: TanStack Query v5 con persistenza IndexedDB
- **Deployment**: Vercel + GitHub Desktop
- **Analytics**: PostHog EU cloud (`https://eu.i.posthog.com`)
- **Errori**: Sentry

## Novità 1.9.5

- Fix: `useSyncQueue` non scrive più su `xp_history` (tabella rimossa con gamification)
- Fix: popup Home si chiude cliccando il backdrop (click-outside)
- Fix: label `NavCard` usa `C.text` per rispettare dark mode
- Fix: rimosso state `reportOpen` inutilizzato in Profilo
- Fix: rimosso `dataLoading` inutilizzato in App.jsx
- Fix: `flowType: 'pkce'` al posto di `'implicit'` (più sicuro, standard moderno)
- Fix: `storage.js` sostituisce `escape()`/`unescape()` deprecate con `TextEncoder`/`TextDecoder`
- Fix: CORS `send-push` Edge Function ristretto alle origini autorizzate (come `delete-user`)
- Fix: CSP Vercel aggiornata con `*.sentry.io`, `*.ingest.sentry.io` e `worker-src 'self'`
- Fix: AdminDashboard ping Supabase gestisce eccezioni di rete (`.catch()`)
- Aggiunto: migration `20260629_drop_gamification_tables.sql` per rimuovere `gamification` e `xp_history`

## Migrazioni da eseguire su Supabase (v1.9.5)

### ⚠️ IMPORTANTE — Eseguire in ordine

1. **`20260629_drop_gamification_tables.sql`** — Rimuove le tabelle `gamification` e `xp_history` ora inutilizzate.
   - Sicura: usa `IF EXISTS` su tutto.
   - Da eseguire via SQL Editor in Supabase Dashboard.

2. **`20260629_notify_admin_on_new_user.sql`** (da v1.9.4, se non già eseguita) — Trigger push all'admin su nuova registrazione.

   **Prerequisito: estensione `pg_net`**
   > `pg_net` è disponibile **solo su piani Supabase Pro e superiori**. Su piano Free, la migration viene eseguita senza errori ma il trigger fallirà silenziosamente (il RAISE WARNING interno non blocca l'insert del profilo).
   >
   > Per abilitarla: Dashboard → Database → Extensions → pg_net → Enable.

   Dopo aver eseguito la migration, configurare le variabili DB:
   ```sql
   ALTER DATABASE postgres SET app.supabase_url = 'https://<YOUR_PROJECT_REF>.supabase.co';
   ALTER DATABASE postgres SET app.service_role_key = '<YOUR_SERVICE_ROLE_KEY>';
   SELECT pg_reload_conf();
   ```

### Redeployare le Edge Functions

Dopo il deploy dell'app, redeployare le Edge Functions aggiornate:
- `delete-user` (aggiornata in v1.9.4 — check ruolo admin)
- `send-push` (aggiornata in v1.9.5 — CORS ristretto)

```bash
supabase functions deploy delete-user
supabase functions deploy send-push
```

### Supabase Auth — migrazione a PKCE flow

In v1.9.5 il client Supabase usa `flowType: 'pkce'` invece di `'implicit'`.
Verificare in Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://polisroad.vercel.app`
- **Redirect URLs**: aggiungere `https://polisroad.vercel.app/**`

Il PKCE flow è compatibile con lo stesso redirect URL già configurato.

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
