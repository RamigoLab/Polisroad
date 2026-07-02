# PolisRoad v1.9.8

Sistema PWA di supporto alle attività di controllo in materia di circolazione stradale, riservato alle forze dell'ordine italiane.

## Stack Tecnico

- **Frontend**: React 19 + Vite 5 (pinato a ^5.4.19 per compatibilità vite-plugin-pwa)
- **Icone**: lucide-react v0.383 — set unificato via `Icon.jsx`, strokeWidth 1.75
- **PWA**: vite-plugin-pwa con strategia `injectManifest` e custom `src/sw.js`
- **Backend**: Supabase (Auth PKCE, Database PostgreSQL, Edge Functions, RLS)
- **Data Fetching**: TanStack Query v5 con persistenza IndexedDB
- **Deployment**: Vercel + GitHub Desktop
- **Analytics**: PostHog EU cloud
- **Errori**: Sentry

## Novità 1.9.8

- Ricerca unificata: Ricerca Globale, Prontuario e Normativa usano lo stesso motore (`src/utils/searchEngine.js`), stessa soglia (3 caratteri), fuzzy matching ovunque
- Ricerca con sinonimi: frasi colloquiali (es. "senza assicurazione") suggeriscono subito la violazione giusta (es. Art. 193 CDS) con badge "risultato suggerito"
- Nuova sezione Admin > Sinonimi per gestire i sinonimi senza deploy
- Seed iniziale di 477 sinonimi su 172 violazioni del Prontuario

## Novità 1.9.7

- Primo giro di interventi a valle dell'audit di usabilità (vedi `PolisRoad-Audit-Usabilita.md`)
- Indicatore "ricerca in corso" nella SearchBar (Ricerca Globale, Prontuario, Normativa)
- Ricerca Globale: risultati espandibili navigabili da tastiera
- Rimosso codice gamification non più utilizzato (nessuna dipendenza attiva)

## Novità 1.9.6

- Fix errore 400 in AdminUtenti: colonna `created_at` non presente in `profiles`
- Header app piatto e uniforme su tutte le pagine (rimossi bordi arrotondati)
- BottomNav semplificata
- Fix errori di build (styles.js, changelog.js)
- Audit RLS completo su tutte le tabelle Supabase

## Azioni richieste su Supabase dopo il deploy

**1.9.8 — azione richiesta:** eseguire la migration `supabase/migrations/20260702_create_search_synonyms.sql`
sull'SQL editor di Supabase (o via CLI). Crea la tabella `search_synonyms`, le relative policy RLS,
e popola 477 sinonimi iniziali. Nessun'altra azione necessaria.

### 1. Aggiungi colonna created_at a profiles

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
```

### 2. Esegui le migration pendenti (se non ancora fatto)

- `20260629_drop_gamification_tables.sql` — rimuove `gamification` e `xp_history`
- `20260629_notify_admin_on_new_user.sql` — trigger push admin (solo piano Pro)

### 3. Redeploy Edge Functions

```bash
supabase functions deploy delete-user
supabase functions deploy send-push
```

## Configurazione Auth PKCE

In Supabase Dashboard → Authentication → URL Configuration:
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
VITE_CACHE_BUSTER=1.9.6
```

## Comandi

```bash
npm install
npm run dev       # sviluppo locale
npm run build     # build produzione
npm run preview   # anteprima build
```
