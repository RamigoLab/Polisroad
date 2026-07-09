# PolisRoad v2.0.0

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

## Novità 2.0.0

Milestone che chiude il ciclo di audit completo avviato con la 1.9.7 — vedi `CHANGELOG.md` per il dettaglio di ogni intervento (ricerca unificata, sinonimi, bug fix, config deploy, accessibilità, performance).

- Service Worker: fallback esplicito (504) invece di risposta `undefined` per asset non precachati offline
- Verificati punto per punto (e confermati già corretti) i rilievi di un audit esterno generico su ENV/Supabase, race condition login, PKCE, lazy loading — dettaglio in `CHANGELOG.md`
- Validato con Lighthouse reale: Performance 100/100, Best Practices 100/100, Accessibilità 94/100 (2 problemi reali corretti: contrasto tab inattivi, landmark `<main>` mancante)
- Risolto: la cronologia ricerche recenti non si poteva cancellare (due liste sovrapposte, una senza bottone di rimozione)
- Ottimizzate le performance di ordinamento e ricerca nel Prontuario
- Rimossa la funzione "Registra Contestazione" (Prontuario e Modalità Operatore): residuo della gamification rimossa, non salvava più nulla da nessuna parte pur suggerendo il contrario. Rimosso anche `src/config/badges.js`, file orfano mai più referenziato

## Novità 1.9.9

- Feedback tattile (vibrazione) distinto per successo/avviso/errore, applicato in modo coerente in tutta l'app tramite il sistema di toast centrale
- **Fix importante**: l'app non si apriva più se chiusa mentre offline e poi riaperta senza connessione (il Service Worker non serviva `index.html` per le richieste di navigazione a `/`)
- Aggiunta conferma prima di disattivare le notifiche push su tutti i dispositivi
- Badge "nota presente" su Prontuario e Modalità Operatore
- Modalità Operatore: riepilogo contestazioni registrate durante il turno (dati di sessione, non persistiti)
- Dialog di conferma coerente in tutta l'app (Admin + Profilo) al posto del popup nativo del browser
- Accessibilità da tastiera estesa a Home, Normativa, Prontuario, Operatore, Profilo e pannelli Admin
- Contrasto colori del testo secondario migliorato (7.55:1 in tema chiaro, prima 4.83:1) per l'uso all'aperto
- Code-splitting: rimosso il chunk "vendor" monolitico precaricato ovunque — Fuse.js ora si carica solo nelle pagine che cercano davvero
- Sentry: aggiunto tag di release e sourcemap (hidden, ripuliti da dist/ dopo la build) — errori ora leggibili e distinguibili per versione
- Corretta documentazione `.env.example` (rimossa variabile fantasma, aggiunta quella mancante)
- CSP (`vercel.json`): rimossi permessi inutilizzati
- Primo di una serie di piccoli interventi di rifinitura UX/config post-audit (vedi `AUDIT-GENERALE-1.9.8.md`)

## Novità 1.9.8

- Ricerca unificata: Ricerca Globale, Prontuario, Normativa e Modalità Operatore usano lo stesso motore (`src/utils/searchEngine.js`), stessa soglia (3 caratteri), fuzzy matching ovunque
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

**2.0.0:** nessuna azione richiesta (nessuna modifica al database).

**1.9.9:** nessuna azione richiesta (nessuna modifica al database).

**1.9.8 — azione richiesta:** eseguire la migration `supabase/migrations/20260702_create_search_synonyms.sql`
sull'SQL editor di Supabase (o via CLI). Crea la tabella `search_synonyms`, le relative policy RLS,
e popola 477 sinonimi iniziali. Nessun'altra azione necessaria.

> ⚠️ **Se avete già eseguito questa migration prima del 4 luglio 2026** (audit generale): le policy
> di scrittura (`INSERT`/`UPDATE`/`DELETE`) sono state corrette per usare `public.is_admin()` invece
> di una sub-query diretta su `profiles`, per coerenza con il pattern di sicurezza già in uso nel
> resto del progetto. Non è un problema bloccante (funzionava comunque), ma se volete allineare
> anche il database già in produzione, rieseguite solo il blocco `CREATE POLICY` per
> `search_synonyms_insert_admin`, `search_synonyms_update_admin` e `search_synonyms_delete_admin`
> dalla versione aggiornata del file (i `DROP POLICY IF EXISTS` iniziali rendono l'operazione sicura
> da rieseguire senza toccare i dati già presenti).

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
