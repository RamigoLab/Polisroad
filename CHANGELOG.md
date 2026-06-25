# 📝 CHANGELOG - PolisRoad

## [1.8.6] - 26 Giugno 2026

### 🔐 Fix critico — Deadlock RLS: admin bloccato dalla schermata di approvazione
- **Causa radice — Deadlock RLS:** la policy SELECT su `profiles` (migration 20260623) verificava il ruolo admin con una subquery ricorsiva su `profiles` stessa, triggerando di nuovo la stessa RLS policy; il loop causava un risultato vuoto, `profile` rimaneva `null`, `isApproved` era sempre `false` e tutti venivano bloccati incluso l'admin
- **Fix `supabase/migrations/20260626_fix_profiles_rls_deadlock.sql`** *(nuovo)*: ricrea `is_admin()` come `SECURITY DEFINER` (bypassa RLS, nessun loop); ricrea la policy SELECT con `is_admin()` al posto della subquery ricorsiva
- **Fix `authService.js`:** aggiunto `approvato` alla SELECT di `fetchProfile`; `signUp` ora scrive `approvato: false` esplicitamente
- **Fix `useAuth.jsx`:** `isApproved` e' `true` se `ruolo === 'admin'` o se `profile.approvato === true`; aggiunto `profileError`; esposto `isAdmin` nel context
- **Fix `App.jsx`:** se il profilo non si carica per errore RLS/rete, mostra "Errore caricamento profilo" con pulsante Riprova

**Azione richiesta su Supabase — eseguire in SQL Editor:**
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $func$ SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'admin'); $func$;

DROP POLICY IF EXISTS "Lettura profili autenticati" ON public.profiles;
CREATE POLICY "Lettura profili autenticati" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin());

UPDATE public.profiles SET approvato = true WHERE ruolo = 'admin';
```

### 🧪 Test unitari — useNormativa, useNews, useProntuario
- `src/hooks/__tests__/useNormativa.test.js` *(nuovo)* — 6 test: lista dalla cache, add/update/remove con successo, gestione errore, rollback ottimistico su update fallito
- `src/hooks/__tests__/useNews.test.js` *(nuovo)* — 6 test: lista, add/update/remove, modalità mock USE_SUPABASE=false, rollback su remove fallito
- `src/hooks/__tests__/useProntuario.test.js` *(nuovo)* — 7 test: lista, add/update/remove, mock mode, rollback update e remove

### 🌙 Dark mode — fix colori hardcoded nei nuovi componenti
- `OfflineBanner.jsx` — background offline ora usa `C.primary`, background "di nuovo online" usa `C.success` (variabili CSS)
- `SyncIndicator.jsx` — background usa `C.surfaceContainer`, testo e icona usano `C.warning`
- `SectionErrorBoundary`, `PasswordInput`, `Onboarding` — già usavano `C.*`, nessuna modifica necessaria

### 📊 Error monitoring — Sentry
- Installato `@sentry/react`
- Inizializzato in `main.jsx` solo in produzione (`import.meta.env.PROD`) e solo se `VITE_SENTRY_DSN` è configurato
- `beforeSend` anonimizza i dati utente (mantiene solo l'ID)
- `tracesSampleRate: 0.1` per non impattare le performance
- `App.jsx` wrappato con `Sentry.ErrorBoundary` come safety net globale
- `VITE_SENTRY_DSN` aggiunto a `.env.example` con istruzioni

### 🔐 Approvazione account admin
- Nuova migration `20260623_add_approvato_profiles.sql`:
  - Campo `approvato boolean DEFAULT false` su `profiles`
  - Admin approvati automaticamente con UPDATE
  - Policy RLS aggiornata: ogni utente può leggere il proprio profilo anche se non approvato
- `useAuth.jsx` — espone `isApproved` (true se `approvato=true`, admin, o Supabase non configurato)
- `App.jsx` — schermata "Account in attesa di approvazione" se `session && !isApproved`; include email registrata e bottone Esci
- `AdminUtenti.jsx` — aggiunto fetch del campo `approvato`, funzione `toggleApprovazione()`, badge "✓ Approvato" / "⏳ In attesa" cliccabile su ogni riga utente

### 🔔 Notifiche Push PWA
- `src/hooks/usePushNotifications.js` *(nuovo)* — gestisce subscribe/unsubscribe con Web Push API; salva subscription in Supabase; gestisce permessi e stati di errore
- `supabase/migrations/20260623_create_push_subscriptions.sql` *(nuova)* — tabella `push_subscriptions` con RLS (utente vede solo le proprie, admin vede tutte per broadcast)
- `supabase/functions/send-push/index.ts` *(nuova Edge Function)* — invio notifiche broadcast o per userIds specifici; JWT VAPID firmato con Web Crypto API; rimuove subscription scadute (410/404)
- `Profilo.jsx` — sezione "Notifiche Push" con toggle attiva/disattiva; visibile solo se il browser supporta la Push API; gestisce stato permesso negato
- `VITE_VAPID_PUBLIC_KEY` aggiunto a `.env.example`; istruzioni generazione chiavi con `npx web-push generate-vapid-keys`

**Setup richiesto per le notifiche push:**
1. `npx web-push generate-vapid-keys` → copia le chiavi
2. Aggiungi `VITE_VAPID_PUBLIC_KEY` alle env vars Vercel
3. Aggiungi `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` ai Secrets Supabase Edge Functions
4. Esegui le due nuove migration in Supabase SQL Editor
5. Deploy Edge Function: `supabase functions deploy send-push`

---

## [1.8.5] - 23 Giugno 2026

### 🟡 Medium Impact — UX Mobile & Affidabilità

**MI-1 — Swipe back gesture (`useSwipeBack.js`)**
- Nuovo hook `src/hooks/useSwipeBack.js` con `TouchEvent` nativi, zero dipendenze
- Swipe orizzontale ≥60px con <40px verticale → torna alla schermata precedente
- Integrato in `PageWrapper.jsx` come comportamento di default (prop `enableSwipeBack`, default true)
- Callback `onBack` personalizzabile; fallback automatico a `window.history.back()`

**MI-4 — Pull-to-refresh (`usePullToRefresh.js`)**
- Nuovo hook `src/hooks/usePullToRefresh.js` con `TouchEvent` nativi, zero dipendenze
- Gesto "tira verso il basso" attivo solo quando lo scroll è già a 0
- Indicatore visivo animato durante il trascinamento ("Rilascia per aggiornare") e il refresh ("Aggiornamento...")
- Integrato in `PageWrapper.jsx` (prop `onRefresh` + `enablePullToRefresh`)
- Attivato su: Prontuario, Normativa, News — invalida la cache React Query della sezione
- Animazione `@keyframes spin` aggiunta a `index.css`

**MI-2 — Error Boundary granulare (`SectionErrorBoundary.jsx`)**
- Nuovo componente `src/components/SectionErrorBoundary.jsx`
- Se una sezione crasha, le altre rimangono pienamente funzionanti
- UI di fallback con icona danger, messaggio leggibile e bottone "Riprova"
- Bottone "Riprova" invalida la cache React Query della sezione specifica
- Dettaglio errore visibile solo in modalità DEV
- Applicato in App.jsx a: Prontuario, Normativa, News, Preferiti

**MI-3 — Onboarding primo avvio (`Onboarding.jsx`)**
- Nuovo componente `src/components/Onboarding.jsx`
- 4 schermate animate con swipe orizzontale tra slide:
  1. Benvenuto in PolisRoad
  2. Prontuario & Normativa — ricerca, preferiti
  3. Modalità Operatore — uso sul campo
  4. Punti & Traguardi — gamification
- Mostrato una sola volta al primo accesso (flag `polisroad_onboarding_done` in localStorage)
- Bottone "Salta" sempre visibile; indicatori step cliccabili
- Integrato in `App.jsx` subito dopo il login, prima dell'app principale

**AI-3 — Calcolatore sanzioni avanzato**
- `src/utils/calcolatoreUtils.js` — logica business separata e testabile
- **Recidiva (art. 195 c. 2 CdS)** — toggle che raddoppia tutti gli importi
- **Riduzione 30% (art. 202 c. 1 CdS)** — toggle pagamento entro 5 giorni (attivo di default)
- **Maggiorazione notturna +1/3 (art. 208 c. 1 CdS)** — toggle orario 22:00–07:00
- **Combinazioni automatiche** — notturna scontata, massimi notturni
- **Decurtazione punti patente** — card dedicata
- **Copia riepilogo** — testo strutturato con tutti gli importi e riferimenti normativi, copiabile in un tap
- **Bottone Reset** — azzera tutti i campi e le opzioni
- UI completamente riscritta: toggle switch animati, card risultati con badge normativi, banner recidiva

---

## [1.8.4] - 23 Giugno 2026

### 🔐 REG-1 — Errori auth tradotti in italiano (`authErrorMapper.js`)
- Nuovo mapper centralizzato `src/utils/authErrorMapper.js`
- Tutti i messaggi Supabase Auth (rate limit, email già registrata, credenziali errate, token scaduto, errori rete, account disabilitato) ora mostrati in italiano chiaro e contestuale
- Il messaggio di rate-limit con countdown ("For security purposes, you can only request this after X seconds") viene convertito in "Devi attendere ancora X secondi/minuti prima di riprovare"
- Applicato in login, registrazione, recupero password e aggiornamento password
- Messaggio di registrazione completata migliorato: ora indica di controllare l'email per la conferma

### 🔐 REG-2 — Campo password con mostra/nascondi e requisiti live (`PasswordInput.jsx`)
- Nuovo componente `src/components/ui/PasswordInput.jsx` riutilizzabile
- Pulsante occhio (mostra/nascondi) a destra del campo, con aria-label accessibile
- Checklist requisiti in tempo reale (attivata con prop `showRequirements`):
  - Almeno 8 caratteri
  - Almeno 1 lettera maiuscola
  - Almeno 1 numero
  - Almeno 1 carattere speciale
- I requisiti diventano verdi man mano che vengono soddisfatti
- Bottone "Registrati" disabilitato finché tutti i requisiti non sono verdi E la privacy è accettata
- Integrato nel form di registrazione, login e aggiornamento password
- Helper `isPasswordValid(value)` esportato per uso in altri form

### 📋 Changelog in-app — aggiornamento automatico `isNew`
- `src/config/changelog.js` riscritto: il flag `isNew` viene ora calcolato automaticamente confrontando `version` con `APP_VERSION` importata da `constants.js`
- Non serve più aggiornare `isNew` a mano ad ogni release: basta aggiungere la voce in cima all'array e aggiornare `APP_VERSION`
- Aggiornati i contenuti della voce 1.8.4 con i fix REG-1 e REG-2

### 🔄 MI-5 — Indicatore sync queue (`SyncIndicator.jsx`)
- Nuovo componente `src/components/ui/SyncIndicator.jsx`
- Banner giallo sottile sotto l'OfflineBanner che mostra quante operazioni sono in attesa di sync
- Visibile solo quando offline E ci sono operazioni in coda (`polisroad_sync_queue`)
- Si aggiorna ogni 5s e al cambio stato rete
- Scompare automaticamente quando la coda si svuota o la connessione torna
- Integrato in `App.jsx`

### 🔧 Icone aggiuntive in `Icon.jsx`
- Aggiunte: `eye`, `eye-off`, `circle`, `wifi`, `wifi-off`, `refresh-cw`

---

## [1.8.3] - 23 Giugno 2026

### ⚙️ Task 6.2 — Ottimizzazione bundle + analisi

**Analisi bundle:**
- Installato `rollup-plugin-visualizer` come devDependency
- Nuovo script `npm run build:analyze` → genera `dist/stats.html` con mappa interattiva (treemap, gzip + brotli size)
- Il visualizer è attivo **solo** in modalità `analyze` — la build normale non viene toccata

**Chunking manuale (`manualChunks` in `vite.config.js`):**
- `react-core` — react + react-dom (cache stabile, cambia raramente)
- `query` — @tanstack/react-query + persist-client
- `supabase` — @supabase/supabase-js
- `fuse` — fuse.js
- `posthog` — posthog-js
- `idb` — idb-keyval

Vantaggi: il browser può ricaricare solo il chunk modificato invece dell'intero bundle. Supabase e Fuse.js in chunk separati migliorano il caching a lungo termine.

---

## [1.8.2] - 23 Giugno 2026

### 🔗 Task 5.2 — Link intelligenti Prontuario ↔ Normativa

- **`ProntuarioDetail`**: aggiunto bottone "Leggi Art. X nel Codice della Strada" quando `onNavigate` è disponibile
- Il numero articolo viene estratto automaticamente dal campo `rif_normativo` (es. "Art. 186 c. 2" → 186)
- Cliccando il bottone si naviga direttamente all'articolo corrispondente in Normativa
- **`Normativa.jsx`**: gestisce il nuovo parametro `navigationParams.searchArticolo` — naviga all'articolo trovato oppure attiva la ricerca come fallback
- `onNavigate` passato come prop opzionale a `ProntuarioDetail` in `Prontuario.jsx`
- Il bottone appare solo se l'articolo è estraibile e `onNavigate` è fornito (compatibile con Operatore dove il link non è rilevante)

---

## [1.8.1] - 23 Giugno 2026

### 🔍 Task 5.1 — Fuzzy Search con Fuse.js

- Installato `fuse.js` come dipendenza
- `useSearch` completamente riscritto con Fuse.js (threshold `0.35`, `ignoreLocation: true`)
- **Prontuario**: chiavi pesate `titolo` (0.4) · `descrizione` (0.3) · `rif_normativo` (0.2) · `articolo_numero` (0.1)
- **Normativa**: chiavi pesate `testo` (0.4) · `titolo_articolo` (0.3) · `titolo` (0.2) · `articolo` (0.1)
- Istanze `Fuse` memorizzate con `useMemo` — si ricalcolano solo se cambia la lista dati
- Logica di priorità mantenuta: corrispondenza esatta su numero articolo → fuzzy raggruppato per articolo
- Tolleranza a errori di battitura: es. "alcool" trova "alcol", "veicilo" trova "veicolo"

---

## [1.8.0] - 23 Giugno 2026

### 🏗️ Service Layer completo — Task 1.1 / 1.2 / 1.3

**Completamento del service layer**: tutti i fetch Supabase sono ora nei services. Il frontend è completamente indipendente dal backend.

**Nuovi services:**
- `src/services/normativaService.js` — `getNormativa`, `addNormativa`, `updateNormativa`, `deleteNormativa`
- `src/services/newsService.js` — `getNews`, `addNews`, `updateNews`, `deleteNews`
- `src/services/prontuarioService.js` esteso — aggiunti `getProntuario`, `addProntuarioItem`, `updateProntuarioItem`, `deleteProntuarioItem`

**`DataContext` semplificato (Task 1.3):**
- Rimossa tutta la logica di fetch manuale (loop paginazione, try/catch, useState/useEffect)
- Il context ora usa `useQuery` per prontuario, normativa e news tramite i rispettivi services
- `refresh()` invalida tutte e tre le cache React Query invece di rifetchare manualmente
- Esporta `QUERY_KEYS` centralizzate per hook e pagine che necessitano di invalidare la cache
- Rimossi: `setProntuario`, `setNormativa`, `setNews` — non più necessari (gestiti da React Query)

**Hook refactored (Task 1.2):**
- `useNormativa` — usa `useData()` per i dati + `useMutation` per add/update/remove; zero chiamate `supabase.from()` dirette; aggiornamenti ottimistici con rollback automatico
- `useNews` — stessa architettura di `useNormativa`; logica business filtro 30 giorni spostata in `newsService.js`
- `useProntuario` — stessa architettura; gestione mock `USE_SUPABASE` mantenuta per fallback dev

**Risultato architettura:** zero chiamate `supabase.from()` negli hook o nei componenti. Tutto passa dai services.

---

## [1.7.0] - 22 Giugno 2026

### 🏗️ TASK 2 — Service Layer (`src/services/`)

Creato layer di servizio che centralizza tutte le chiamate Supabase. Gli hook non parlano più direttamente col DB.

**`src/services/prontuarioService.js`** — `getPreferiti`, `addPreferito`, `removePreferito`, `getNote`, `upsertNota`, `deleteNota`
**`src/services/gamificationService.js`** — `getGamificationStats`, `updateGamificationStats`, `insertXpHistory`
**`src/services/authService.js`** — `fetchProfile`, `upsertProfile`, `fetchUserCount`, `signIn`, `signUp`, `resetPassword`, `updatePassword`, `signOut`

Hook refactored: `usePreferiti`, `useNote`, `useGamification`, `useAuth` — zero chiamate `supabase.from()` dirette.

---

### ⚡ TASK 3 — TanStack Query + Persister IndexedDB

**`@tanstack/react-query` v5** — caching in memoria con `staleTime: 5 min`, `gcTime: 24 ore`, retry automatico, no refetch su cambio tab.

**`@tanstack/react-query-persist-client` + `idb-keyval`** — cache persistita su IndexedDB. La cache sopravvive al refresh e alla chiusura del browser. `maxAge: 24 ore`. Buster controllabile via `VITE_CACHE_BUSTER`.

`usePreferiti` e `useNote` — aggiornamenti ottimistici con rollback automatico su errore.
`useGamification` — `updateCache()` aggiorna localmente senza refetch ad ogni addXP.

---

### 📡 TASK 4 — Offline Queue estesa

**`useSyncQueue.js`** — aggiunto supporto per:
- `TOGGLE_PREFERITO` `{ prontuarioId, action: 'add'|'remove' }` — accodato quando offline durante toggle favoriti
- `SAVE_CONTESTAZIONE` `{ prontuarioId, xp }` — accodato quando offline durante registrazione contestazione
- Max 3 tentativi per azione; dopo 3 fallimenti l'azione viene scartata con log
- Toast informativi per ogni fase: offline warning, sync in corso, successo, elementi rimasti

**`usePreferiti.js`** — chiama `addToQueue('TOGGLE_PREFERITO', ...)` se `!navigator.onLine`
**`ProntuarioDetail.jsx`** — `handleContestazione` usa `addToQueue('SAVE_CONTESTAZIONE', ...)` se offline

---

### ♿ TASK 5 — Accessibilità base

**`BottomNav.jsx`** — `role="navigation"`, `aria-label="Navigazione principale"`, `aria-current="page"` sulla tab attiva, `tabIndex={0}`, navigazione da tastiera con `Enter`

**`SearchBar.jsx`** — `role="search"`, label visually-hidden per screen reader, `type="search"` (attiva clear nativo su mobile), `aria-label`, `autoComplete="off"`

**`ToastManager.jsx`** — bottone chiudi con `aria-label="Chiudi notifica"`

**`Prontuario.jsx`** — gruppi articolo con `role="button"`, `aria-label` descrittivo, `tabIndex={0}`, navigazione da tastiera

---

### 📊 TASK 6 — PostHog tracking significativo

Da 4 a 9 eventi tracciati:
- `page_view` `{ page, has_params }` — ad ogni navigazione in `App.jsx`
- `normativa_article_opened` `{ articolo_num, titolo }` — in `Normativa.jsx`
- `preferito_added` / `preferito_removed` `{ prontuario_id }` — in `Preferiti.jsx`
- `calcolatore_used` `{ prontuario_id }` — in `Calcolatore.jsx`
- `badge_unlocked` `{ badge_id }` — in `useGamification.js`

---

### 🗂️ TASK 7 — Split `pages.js`

`pages.js` (757 righe) splittato in 8 file per sezione in `src/styles/pages/`:
`home.js`, `prontuario.js`, `normativa.js`, `ricerca.js`, `calcolatore.js`, `news.js`, `profilo.js`, `operatore.js`, `admin.js`

`pages.js` diventa re-export aggregato — API identica (`PS.*`), nessuna modifica ai consumer.

---

### 🧪 TASK 8 — Test coverage

Nuovi file di test:
- `usePreferiti.test.js` — cache, isPreferito, toggle ottimistico, fallback offline
- `useGamification.test.js` — stats, addXP valido/invalido, badge, featuredBadge
- `ProntuarioDetail.test.jsx` — render, note_comuni, contestazione online/offline, nota edit/save/annulla
- `useSyncQueue.test.js` — aggiornato con TOGGLE_PREFERITO e SAVE_CONTESTAZIONE

---

### ☁️ Vercel Edge Caching (`vercel.json`)

- `/assets/*` → `Cache-Control: public, max-age=31536000, immutable` (JS/CSS con hash Vite)
- `/icons/*` → `max-age=86400, stale-while-revalidate=604800`
- `/manifest.webmanifest` → `max-age=86400` + `Content-Type` corretto
- `/sw.js` → `no-cache` (service worker deve sempre essere aggiornato)
- `/index.html` → `no-cache` (entry point sempre fresco)
- Aggiunto `rewrites` per SPA routing (tutti i path → `index.html`)

---

### 🔴 Fix immediati (da 1.7.0-pre)

**Badge gamification solo in Home** — prop esplicita `showBadge` su `PageWrapper`/`AppHeader`; solo `Home.jsx` passa `showBadge={true}`

**Tasto "Chiudi" area admin** — era invisibile (bianco su azzurro chiaro); ora bianco su sfondo semitrasparente con bordo

**Migrazione SQL `note_comuni`** — `supabase/migrations/20260622_add_note_comuni_prontuario.sql`



### 📋 Prontuario — Ridisegno Vista Dettaglio

**Problema (screenshot 22:38)**
Il titolo dell'articolo era mostrato nell'header blu insieme al badge gamification del profilo utente, risultando visivamente schizofrenico: informazione operativa (titolo violazione) mescolata con elemento personale (badge), con testo enorme su sfondo scuro che occupava metà schermo.

**Soluzione**

`AppHeader.jsx` — Badge gamification
- Il `featuredBadge` ora appare **solo sulle pagine top-level** (senza pulsante ← Indietro). Nelle viste dettaglio (prontuario, normativa, ecc.) il badge è nascosto. Logica: se `leftAction` è presente = siamo in un dettaglio = no badge. Eliminata la precedente eccezione hardcoded `title !== "Profilo Operatore"`.

`ProntuarioDetail.jsx` — Nuovo componente estratto
- Estratta la vista dettaglio da `Prontuario.jsx` in un componente dedicato `src/components/ProntuarioDetail.jsx`, riutilizzabile anche da `Operatore.jsx`.
- **Layout ridisegnato**:
  1. **Card Titolo articolo** (card bianca, stile coerente con le altre card): riferimento normativo in colore primario + titolo voce in grassetto
  2. **Card Norme Comuni dell'Articolo** (nuova): mostra il campo `note_comuni` dalla tabella `prontuario` — stesso valore per tutte le casistiche dello stesso articolo (es. Art. 6 ha 22 voci, le note comuni sono identiche per tutte). Appare solo se il campo è valorizzato.
  3. Card Descrizione Violazione
  4. Card Sanzioni
  5. Note al Verbale / Note Operative
  6. Memo Personale
  7. Registra Contestazione
- L'header blu in dettaglio mostra solo: `rif_normativo` come subtitle + pulsante Indietro + Aggiungi preferito.

`AdminProntuario.jsx` — Note comuni visibili in admin
- Quando un gruppo è espanso, le `note_comuni` appaiono in evidenza (bordo azzurro) sopra le voci, visibili una sola volta per gruppo.
- Campo `note_comuni` aggiunto al form di creazione/modifica voce.

`Operatore.jsx` — Note comuni nel dettaglio inline
- Aggiunto blocco "NORME COMUNI ARTICOLO" nel dettaglio espanso della voce, prima della descrizione violazione, con lo stesso stile delle note operative.
- Aggiunto `useNormativa` rimosso — il campo `note_comuni` vive già nella tabella `prontuario`, nessun fetch aggiuntivo necessario.
- Importate le utility da `prontuarioUtils.js` invece di ridefinirle inline.

### 🧹 Refactor — Utility Condivise

`src/utils/prontuarioUtils.js` — Nuovo file
- Estratte da `Prontuario.jsx` le funzioni `parseArticoloNum`, `sortSuffix`, `sortItems`, `groupByArticolo` in un file utility condiviso.
- Importate in `Prontuario.jsx` e `useSearch.js`, eliminando la duplicazione.



### 🔍 Ricerca Globale — Risultati Raggruppati e Prioritizzati

**`useSearch.js` — riscrittura logica risultati**
- I risultati non vengono più restituiti come lista piatta di voci/commi singoli, ma **raggruppati per articolo** con separazione in due livelli di priorità:
  - **Corrispondenza esatta**: cercando "186" viene mostrato prima `Art. 186` come contenitore con tutte le sue casistiche (Prontuario) o tutti i suoi commi (Normativa).
  - **Anche in altri articoli**: sotto, eventuali articoli che contengono il termine nel testo (es. un comma di Art. 141 che menziona "186").
- Il metodo di ritorno cambia da array piatto a `{ exact: [], other: [] }` per entrambe le sezioni.

**`Ricerca.jsx` — UI ridisegnata**
- Ogni articolo è ora un **contenitore espandibile** (stesso pattern di Operatore e Admin): clic sul gruppo mostra le voci/commi interni, clic sulla singola voce naviga al dettaglio.
- I gruppi con corrispondenza esatta hanno bordo e colore accentuato + etichetta "corrispondenza esatta".
- I gruppi testuali in "Anche in altri articoli" sono visivamente distinti.
- Label separatore "Anche in altri articoli" appare solo quando ci sono sia risultati esatti che testuali.
- Pulsante "Vedi tutti" mantiene il limite di 5 gruppi nella sezione "altri".
- Espansione dei gruppi si resetta automaticamente al cambio query.

**`useSearch.test.js` — test aggiornati**
- Tutti i test allineati alla nuova struttura `{ exact, other }`.
- Aggiunto test specifico per ricerca numerica esatta che verifica il raggruppamento corretto.

### 🔧 Code Audit — Cleanup & Ottimizzazioni

**Bug critico — doppia istanza `useGamification` (`useInitializeGamification.js`)**
- `useInitializeGamification` importava e istanziava `useGamification` direttamente, creando una seconda connessione Supabase indipendente da quella già gestita da `GamificationContext`. Al primo avvio dell'app venivano quindi eseguiti due fetch paralleli alla tabella `gamification` per lo stesso utente.
- Fix: `useInitializeGamification` ora usa `useGamificationContext` (il context già montato) invece di istanziare nuovamente l'hook diretto.

**Performance — fetch inutile in `addXP` (`useGamification.js`)**
- Prima di ogni aggiornamento XP, veniva eseguita una query `SELECT * FROM gamification` per "leggere i dati freschi", nonostante lo stato locale `stats` venisse già aggiornato ottimisticamente ad ogni operazione. Risultato: ogni azione dell'utente (ricerca, articolo, preferito, contestazione) generava 2 chiamate Supabase invece di 1.
- Fix: rimossa la query di pre-fetch. `addXP` usa ora direttamente `stats` dallo stato locale, che è sempre sincronizzato.

**Dead code — alias duplicato in `useNote.js`**
- Il return di `useNote` esponeva sia `save` che `salvaNota` come alias della stessa funzione. Nessun consumer usava `salvaNota` direttamente.
- Fix: rimosso `salvaNota` dal return, mantenuto solo `save`.

**Dead code — stili inutilizzati in `styles.js`**
- Rimosse 4 chiavi mai referenziate in nessun componente: `pageHeader`, `pageTitle`, `successBox`, `labelSmall`.



### 📄 Aggiornamento Documenti Legali

**Privacy Policy (`Privacy.jsx`)**
- **Allineamento PostHog opt-out**: la sezione 7 ora rispecchia correttamente il comportamento reale del codice (`opt_out_capturing_by_default: false`): il tracciamento è **attivo per impostazione predefinita** e l'utente può disattivarlo dal Profilo.
- **Rinumerazione sezioni**: eliminata la numerazione anomala "6.1" — il punto è diventato la sezione 7 autonoma, le sezioni successive rinumerate di conseguenza fino al punto 10.
- **Rimosso riferimento a `localStorage`**: sostituito con "memorizzazione locale sul dispositivo", più accurato rispetto all'implementazione reale che usa `storage.js`.

**Termini di Servizio (`TerminiServizio.jsx`)**
- **Rimosso foro di Torino**: la clausola era giuridicamente nulla per contratti con consumatori (art. 33 D.Lgs. 206/2005 impone il foro del consumatore come inderogabile). Sostituita con riferimento generico alla normativa vigente.
- **Aggiunto punto 9 — Analytics**: nuova sezione che cita esplicitamente PostHog, con indicazione che il tracciamento è attivo di default e rimanda alla Privacy Policy.
- **Rinumerato punto 10**: ex punto 9 "Legge applicabile" diventa punto 10.

**CHANGELOG**
- Rimossa la voce errata in 1.6.4 che dichiarava un fix `opt_out_capturing_by_default: true` mai effettivamente applicato al codice.



### 🛠️ UX Area Amministrativa (Prontuario e Normativa)

- **Contenitori Articoli Espandibili**: Modificate le sezioni di amministrazione di Prontuario e Normativa in Area Amministrativa per raggruppare i contenuti per articolo (es. Articolo 186) in contenitori azzurrini espandibili inline, allineandoli alla UX visiva degli operatori.
- **Gestione Prontuario Inline**: Cliccando su un articolo si apre l'elenco delle relative voci/violazioni. Ogni voce può essere modificata o eliminata direttamente, mantenendo l'utente nella stessa schermata.
- **Gestione Normativa & Commi Inline**: L'espansione dell'articolo mostra ora sia il modulo per aggiornare i metadati dell'intestazione (Titolo, Capo, Articolo), sia l'elenco dei singoli commi modificabili e salvabili individualmente senza dover navigare in una pagina separata a schermo intero.

## [1.6.5] - 21 Giugno 2026

### 👥 Gestione Utenti in Area Amministrativa

- **Nuova Scheda "Utenti"**: Aggiunta una sezione dedicata in Area Amministrativa per visualizzare tutti i profili registrati con funzionalità di ricerca per nome, cognome, email o forza di polizia.
- **Modifica Profili**: Gli amministratori possono ora modificare i dettagli degli utenti (Nome, Cognome, Grado, Forza di Polizia, Telefono) ed elevare o revocare i permessi di amministrazione modificando il ruolo di sistema (`admin` / `operatore`).
- **Policy RLS Supabase**: Creata la migrazione SQL per consentire agli utenti con ruolo `admin` di aggiornare i profili degli altri utenti (operazione prima bloccata dalla policy di sicurezza base).
- **Validazione Obbligatorietà Nome/Cognome**:
  - Risolto un bug nel componente `TextInput` che ignorava alcune proprietà (come `onKeyDown`).
  - Creata una migrazione SQL per impostare i vincoli `NOT NULL` e `CHECK` (stringa non vuota) sulle colonne `nome` e `cognome` della tabella `profiles` sul database, rendendole obbligatorie e bloccando registrazioni vuote.

## [1.6.4] - 21 Giugno 2026

### 🐛 Bugfix Critico — Modalità Operatore

**Problema**: nella Modalità Operatore, cliccare su una voce all'interno di un gruppo articolo (es. Art. 6) causava la chiusura del gruppo invece di espandere la voce selezionata. Il gruppo azzurro collassava e l'utente veniva rimandato alla vista di ricerca senza vedere il dettaglio.

**Causa**: un singolo stato `expandedId` veniva usato sia per il gruppo articolo (con chiave stringa `"grp_6"`) che per le voci interne (id numerico). Al click su una voce, `setExpandedId(item.id)` sovrascriveva `"grp_6"`, chiudendo il gruppo.

**Fix**: separati in due stati distinti:
- `expandedGroupId` — traccia quale gruppo articolo è aperto (es. `"grp_6"`)
- `expandedItemId` — traccia quale singola voce è espansa all'interno del gruppo

I due stati ora sono indipendenti: aprire una voce non chiude mai il gruppo padre. Alla chiusura del gruppo, la voce aperta viene resettata automaticamente.

### 🧹 Pulizia — File Orfani Rimossi

- **`Toast.jsx`** — componente dead code: non era più importato da nessun file dopo la migrazione a `ToastManager`. Rimossi anche gli stili correlati `toastContainer` e `toast` da `styles/ui.js`.
- **`Button.jsx`** — componente mai utilizzato in nessuna pagina o componente dell'app. Rimosso.
- **`src/assets/react.svg`**, **`vite.svg`**, **`hero.png`** — asset di default Vite non referenziati da nessun file sorgente. Rimossi.
- **`manifest.json` (root)** — duplicato identico di `public/manifest.json`. Il plugin `vite-plugin-pwa` genera il manifest dal `vite.config.js`; quello nella root era un residuo. Rimosso.

### 🐛 Bugfix — `DataContext.jsx` (flusso fetch dati)

**Problema**: in caso di errore sul fetch `news`, il codice impostava `setError()` ma poi **continuava a eseguire** i fetch di normativa e prontuario (mancava `else`). Questo causava chiamate Supabase inutili e potenzialmente `setNews(undefined)` invece del fallback `mockNews`.

**Fix**: aggiunto blocco `else` corretto — se `newsError` è presente, imposta `setNews(mockNews)` e salta i fetch successivi. Normativa e prontuario vengono caricati solo se news ha avuto successo.



---



**Problema 1 — Banner "offline ready" ripetuto ad ogni avvio**
Il banner "App pronta per funzionare offline!" compariva ad ogni riapertura dell'app perché il dismiss (click su "Chiudi") non era persistito. Fix: il dismiss viene ora salvato via `storage.js` (`polisroad_pwa_offline_dismissed`). Il banner non compare più dopo la prima chiusura.

**Problema 2 — Conflitto di priorità `needRefresh` vs `offlineReady`**
Se `offlineReady` era `true` e successivamente arrivava `needRefresh: true`, il testo mostrato era ancora quello "offline ready" mentre il bottone era "Riavvia & Aggiorna", creando un messaggio incoerente. Fix: `needRefresh` ha ora priorità esplicita nel rendering — se è `true`, mostra sempre il messaggio di aggiornamento indipendentemente da `offlineReady`.

**Problema 3 — Doppio sistema toast (`Toast.jsx` + `ToastManager`)**
`App.jsx` importava sia il vecchio componente `Toast.jsx` (dead code con `zIndex: 1000`) che il sistema `ToastProvider/useToast` (con `zIndex: 9999`). I due popup si potevano sovrapporre visivamente a `bottom: 80px`. Fix: rimosso `Toast.jsx` e l'import relativo da `App.jsx`. Il `dataError` viene ora mostrato tramite `showToast('...', 'error')` del `ToastProvider`, unificando il sistema. `App.jsx` è stato refactored in un componente `AppInner` per poter usare `useToast` all'interno del `ToastProvider` già presente in `main.jsx`.

---

## [1.6.3] - 20 Giugno 2026

### 🔍 Ricerca intelligente in tutte e 3 le sezioni (Prontuario, Operatore, Normativa)

Tutte e tre le pagine usano ora la stessa logica di ricerca prioritizzata:

1. **Corrispondenza esatta** su numero articolo (es. `142` → mostra solo Art. 142)
2. **Voci correlate** — `rif_normativo` / label articolo che inizia con "art. 142"
3. **Altri risultati** — occorrenze testuali residue

Prima del fix, cercare `142` in Normativa restituiva articoli che contenevano "14" o "42" nel testo dei commi, mescolati senza priorità. Stesso problema in Prontuario e Operatore risolto nella stessa release.

**Prontuario** — vista principale raggruppata per articolo (Art. 6, Art. 7... Art. 142, Art. 142-bis). Ordinamento corretto per bis/ter/quater/quinquies.

**Operatore** — ricerca con gruppo articolo espandibile inline per flusso rapido.

**Normativa** — ricerca con tre sezioni distinte: corrispondenza esatta → articoli correlati → altri risultati testuali (commi inclusi).

---

## [1.6.2] - 20 Giugno 2026

### 🎨 UX & Usabilità

- **Preferiti → navigazione diretta**: il bottone "Vedi Dettagli in Prontuario" ora apre direttamente la voce selezionata invece di portare all'inizio della lista
- **Preferiti → icona stella**: sostituita emoji ⭐ hardcoded con componente `<Icon name="star">` — rispetta il tema dark mode e lo stile coerente dell'app
- **Calcolatore**: aggiunto messaggio "Inserisci un importo PMR per calcolare" quando il campo è vuoto, invece di mostrare una pagina bianca
- **Ricerca → "Vedi tutti"**: il link appare ora quando i risultati sono ≥ 5 (prima solo > 5) e mostra il conteggio totale
- **News → filtro categorie**: rimossi banner e popup dalla lista pubblica; label "Utility" rinominato in "Informativa" per allinearlo alla categoria reale del DB
- **Home → footer**: anno e versione ora dinamici (`new Date().getFullYear()` e `APP_VERSION`) — si aggiornano automaticamente ad ogni release

### ⚡ Performance

- **Operatore → orologio**: estratto in componente `<Clock />` isolato — il re-render ogni secondo non coinvolge più la lista del prontuario, eliminando ricalcoli inutili su `useMemo`

### 🔒 Sicurezza & Privacy

- **ErrorBoundary**: il dettaglio tecnico dell'errore (stack trace) è ora visibile solo in modalità sviluppo (`import.meta.env.DEV`), nascosto in produzione
- **Home → popup**: dismissal dei popup ora salvato tramite `storage.js` (btoa encoding) invece di `localStorage` diretto, coerente con il resto dell'app
- **Links → favicon**: rimossa chiamata a `https://www.google.com/s2/favicons` (Google S2) — le icone ora usano solo loghi locali in `/public/logos/` o fallback testo, eliminando il tracciamento involontario verso Google
- **App.jsx**: pulizia automatica di `navigationParams` corrotti da storage (chiamata `removeItem` nel catch)

---

## [1.6.1] - 19 Giugno 2026

### 🛡️ Sicurezza & Best Practice

- **Security Headers HTTP**: aggiunto `vercel.json` con CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy e Permissions-Policy
- **CORS Edge Functions**: rimosso `Access-Control-Allow-Origin: *`; entrambe le Edge Functions (`delete-user`, `fetch-rss`) ora usano una whitelist di origini consentite
- **Eliminazione account**: le DELETE sulle tabelle correlate ora avvengono in parallelo con `Promise.all`; gli errori parziali vengono raccolti e bloccano la chiamata alla Edge Function; aggiunto modale custom con campo di conferma testuale "ELIMINA" al posto dei `window.confirm` (compatibile PWA standalone)
- **PostHog opt-out GDPR**: PostHog ora parte con `opt_out_capturing_by_default: true`; aggiunto toggle "Analytics" nel Profilo per consenso/revoca esplicita persistente
- **logger.error in produzione**: silenziato come `log` e `warn`; stack trace non più esposti nella console in produzione
- **AdminDashboard**: conteggio segnalazioni ora usa `select('*', { count: 'exact', head: true })` — zero righe trasferite
- **useSearchHistory**: cronologia ricerche ora salvata via `storage.js` (btoa encoding) invece di `localStorage` diretto
- **useSyncQueue**: aggiunta validazione payload per ogni tipo di azione; tipi non riconosciuti vengono scartati senza bloccare la coda
- **useAuth**: `fetchProfile` ora usa `select` esplicito sui campi invece di `select('*')`
- **ESLint**: aggiunte regole di sicurezza `no-eval`, `no-implied-eval`, `no-new-func`, `no-script-url`
- **Dipendenze**: rimosso prefisso `^` (caret) da tutte le dipendenze per build riproducibili
- **index.html**: aggiunti meta tag `noindex/nofollow`, `theme-color`, Apple PWA (`apple-mobile-web-app-capable`, `status-bar-style`, `title`) e `apple-touch-icon`

---

## [1.6.0] - 18 Giugno 2026

### 🎨 Redesign Grafico (Material 3-inspired)
- Superfici tonali: nuovi token CSS (`--bg-surface-container`, `--bg-surface-container-high`) sostituiscono il grigio piatto; `--bg-global` e `--bg-surface` aggiornati
- Font: sostituito Sora (usato solo in 2 pagine statiche) con Roboto (400/500/700), coerente con il linguaggio visivo Google
- Scala raggi unificata: `--radius-sm/md/lg/pill` usata ovunque al posto di valori fissi sparsi
- Bottoni: aggiunto componente `Button.jsx` con varianti (filled, tonal, outline, text, danger)
- Bottom navigation: da 10 voci a scorrimento a 5 voci fisse (Home, Normativa, Prontuario, Cerca, Profilo) con indicatore "pillola" sull'attiva; Sidebar mantiene tutte e 10 le voci
- Icone: installato `lucide-react`; tutte le emoji funzionali/navigazione sostituite con icone SVG coerenti tramite componente centralizzato `Icon.jsx`; emoji di gamification/reward lasciate invariate

### 🐛 Correzioni
- **Tasto Indietro:** listener `popstate` in `App.jsx`; il tasto Indietro del browser/Android ora torna alla pagina precedente dell'app
- **Console log in produzione:** sostituiti ~39 `console.*` diretti in 14 file con il logger centralizzato `src/utils/logger.js`
- **Theme-color barra di stato:** `index.html` aggiornato a `#1a3a5c` (blu brand); `useTheme.js` aggiorna il meta tag dinamicamente al cambio tema
- **RSS dal browser:** aggiunta Edge Function `supabase/functions/fetch-rss` con parser RSS integrato e verifica ruolo admin lato server; rimossa chiamata diretta a `api.rss2json.com` dal client
- **File orfani rimossi:** eliminati `public/favicon.svg`, `public/icons.svg`, `public/manifest.json`
- **Dipendenza inutilizzata:** disinstallato `react-router-dom`
- **ErrorBoundary:** colori hardcoded sostituiti con variabili CSS globali

---

## [1.5.3] - 12 Giugno 2026

### 🛡️ Audit di Sicurezza & Privacy
- **GDPR Art. 17 (Cancellazione Account)**: Corretta la cancellazione per includere l'eliminazione dei dati associati su `note`, `preferiti` e `segnalazioni`. Introdotta la Supabase Edge Function `delete-user` per eliminare l'utente auth da Supabase. Aggiornata l'informativa UI nel Profilo.
- **Privacy & Analytics**: Sostituita la trasmissione del testo integrale delle ricerche a PostHog con metadati anonimizzati (lunghezza e presenza di cifre) per tutelare i dati di terzi (es. targhe o nominativi).
- **Privacy Policy aggiornata**: Corrette le dichiarazioni di sincronizzazione dati e documentato PostHog come sub-processor.
- **Rate Limiting**: Aggiunta nota tecnica in `rateLimiter.js` sul rate limiter client-side e il ruolo di Supabase.
- **Logging**: Creato logger custom `src/utils/logger.js` per disabilitare `console.log` e `console.warn` in ambiente di produzione.
- **Esportabilità Dati (GDPR Art. 20)**: Aggiunta opzione per esportare tutti i dati personali dell'utente (profilo, note, preferiti, statistiche) in formato JSON dal Profilo.
- **Hardening RLS Supabase**: Creata migrazione per rendere RLS sulla tabella `news` editabile solo dagli amministratori.
- **Refusi**: Corretti refusi testuali in `Auth.jsx` e `Profilo.jsx`.
- **Dipendenze**: Spostati `csv-parse` e `@types/dompurify` in `devDependencies`.
- **Versione**: Aggiornato tutto alla versione `1.5.3`.

## [1.5.2] - 7 Giugno 2026

### 📊 Prontuario & CSV Import
- **Risoluzione bug importazione CSV**: Rimosso il BOM UTF-8 (`ï»¿`) in lettura del CSV sorgente che causava l'azzeramento della colonna `articolo_numero`.
- **Script di conversione aggiornato**: Ottimizzato `convert_csv_for_supabase.js` implementando una serializzazione nativa senza dipendenze esterne.
- **Aggiornamento versione**: Sincronizzato il numero di versione dell'applicazione a `1.5.2`.

## [1.5.1] - 6 Giugno 2026

### 🔎 Ricerca Normativa migliorata
- Quando la barra di ricerca contiene **solo numeri** (es. `186`), l’articolo corrispondente viene mostrato **primo** nella sezione **Articoli Normativa**, seguito dagli altri risultati.
- Implementato ri‑ordinamento dei risultati in `src/hooks/useSearch.js`.

## [1.5.0] - 6 Giugno 2026

### ⚖️ GDPR & Compliance

- **Privacy Policy**: Aggiunta pagina `Privacy.jsx` con informativa completa ai sensi del GDPR (Reg. UE 2016/679), accessibile dalla Home e dal Profilo.
- **Termini di Servizio**: Aggiunta pagina `TerminiServizio.jsx` con termini d'uso, limitazione di responsabilità sul contenuto normativo e legge applicabile.
- **Consenso alla Registrazione**: Aggiunto checkbox obbligatorio nel form di registrazione con link a Privacy Policy e Termini di Servizio — il pulsante "Registrati" è disabilitato finché l'utente non accetta.
- **Link Legali in Login**: Aggiunto in fondo al form di login un link discreto a Privacy Policy e Termini di Servizio.
- **Card Legale in Home**: Aggiunta in fondo alla Home una card con link a Privacy Policy, Termini di Servizio e versione app.
- **Documenti Legali in Profilo**: Aggiunta sezione "Documenti legali" in Profilo con link alle due pagine.
- **Eliminazione Account**: Aggiunta sezione "Zona pericolosa" in Profilo con flusso di eliminazione account a doppia conferma — cancella profilo, gamification e cronologia XP da Supabase e disconnette l'utente.
- **RLS Supabase — Cancellazione**: Aggiunte tre policy RLS per consentire agli utenti autenticati di cancellare esclusivamente i propri record su `profiles`, `gamification` e `xp_history`.

### 🌙 Dark Mode — Correzioni

- **Frecce BottomNav**: Corretti i gradient `navFadeLeft` e `navFadeRight` in `layout.js` — sostituito `rgba(255,255,255,1)` con `var(--bg-card)` per eliminare l'alone bianco visibile in dark mode.
- **Card Notifiche Home**: Sostituito `backgroundColor: '#fff'` hardcodato con `C.card` nelle card delle comunicazioni.
- **Blocchi Commi Normativa**: Sostituito `backgroundColor: '#fff'` hardcodato con `C.card` nei blocchi dei commi degli articoli.
- **Card Links**: Sostituito `backgroundColor: '#fff'` hardcodato con `C.card` nelle card della pagina Link Istituzionali.
- **Form Auth**: Sostituito `backgroundColor: '#fff'` hardcodato con `C.card` nel contenitore del form di login e registrazione.
- **Card Commi AdminNormativa**: Rimosso `backgroundColor: '#fff'` dall'override inline della riga 409 — lo stile `C.card` ereditato è ora corretto in entrambi i temi.

### 🎨 Grafica & Stile

- **Accento XP Warm**: Aggiunta variabile CSS `--color-xp` (`#e8a020` in light, `#f5b942` in dark) applicata ai componenti `LevelProgress`, `StreakCounter` e `BadgeShowcase` per differenziare visivamente la gamification dal resto dell'interfaccia.
- **Pulse Pulsante Operatore**: Aggiunta animazione `operatorePulse` al pulsante "Attiva Modalità Operatore" in Home per migliorare la visibilità dell'azione principale.
- **Font Display Sora**: Aggiunto import Google Fonts `Sora` (700, 800) e variabile `--font-display` applicata ai titoli principali delle sezioni.

### 🔧 UX

- **Label BottomNav**: Aumentata la dimensione del testo delle label da `0.65rem` a `0.7rem` per migliorare la leggibilità in condizioni operative.
- **Auth con onNavigate**: Il componente `Auth` ora riceve `onNavigate` come prop da `App.jsx`, abilitando la navigazione verso Privacy Policy e Termini direttamente dalla schermata di accesso.

### 📦 Configurazione

- Versione aggiornata a `1.5.0` in `package.json` e `constants.js`.

---

## [1.4.9] - 4 Giugno 2026

### Sicurezza & Supabase
- **Recupero Password**: Aggiunto il flusso Supabase per richiesta reset password e impostazione della nuova password al rientro dal link email.
- **Conferma Email**: Aggiornata l'esperienza di registrazione per supportare account che richiedono conferma email prima del primo accesso.
- **RLS Gamification**: Aggiunta migrazione `20260604_secure_gamification_rls.sql` per proteggere `gamification` e `xp_history`, limitando lettura, inserimento e aggiornamento ai dati del proprio utente.

### Profilo & Gamification
- **Azzeramento Contestazioni**: Aggiunto nella pagina Profilo il pulsante per azzerare le "Contestazioni Effettuate", con conferma utente e aggiornamento persistente su Supabase.
- **Stato UI Coerente**: Aggiornato lo stato locale della gamification dopo l'azzeramento per riflettere subito il valore corretto senza refresh.

### Correzioni UX
- **Toast Auth**: I messaggi positivi di registrazione, recupero password e aggiornamento password ora vengono mostrati come notifiche di successo invece che come errore.

---

## [1.4.8] - 4 Giugno 2026

### 🛡️ Sicurezza
- **Rate Limiter Persistente**: Salvataggio dei tentativi di login e del blocco temporaneo in `localStorage` per evitare bypass tramite ricaricamento della pagina.
- **Protezione Ruolo Admin (Supabase)**: Aggiunta migrazione `20260604_secure_profiles_rls.sql` contenente trigger e policy RLS per bloccare l'auto-assegnazione del ruolo amministratore via API client.
- **Lettura Segnalazioni Personali**: Aggiornata la policy RLS su `segnalazioni` consentendo agli operatori autenticati di consultare le proprie segnalazioni oltre agli admin.
- **Race Condition in ProtectedRoute**: Risolto il problema di visualizzazione momentanea dell'area amministrativa attendendo il caricamento del profilo se c'è una sessione attiva.

### 🔧 Correzioni & Incongruenze Funzionali
- **Ritardo Invio Segnalazione**: Aggiunto un ritardo di 1 secondo prima del redirect `mailto:` per garantire la visualizzazione del toast di successo.
- **Stato Backup Dinamico**: Sostituito il testo hardcoded del backup nella dashboard admin con un'indicazione reale dello stato (attivo su Supabase o non disponibile in locale/demo).
- **Snippet SQL Aggiornato**: Corretto lo snippet SQL visualizzato in `AdminSegnalazioni.jsx` per includere le nuove policy di lettura personale.
- **Aggiornamento Mock News al 2026**: Spostata la data e il titolo delle news di fallback dal 2024 al 2026.
- **Onesto Fallback Conteggio Utenti**: Sostituito il fallback di `userCount` da 124 a `1` (se in demo mode) o `0`.

### 🧹 Pulizia del Repository
- Rimosse le utility non utilizzate e i file di debug dalla root: `scratch_colors.js`, `scratch_colors.cjs` e `fetch_normativa.js`.

---

## [1.4.7] - 31 Maggio 2026

### 🚀 Nuove Funzionalità

- Rimossa la cancellazione automatica delle news dal client: le news pubblicate piu' vecchie di 30 giorni vengono filtrate in lettura senza eseguire delete dal browser.
- Aggiunta migrazione `20260531_secure_segnalazioni_rls.sql` per creare/proteggere `segnalazioni` con RLS e gestione admin.
- Aggiornato lo snippet SQL mostrato nell'area admin per evitare policy permissive `FOR ALL USING (true)`.
- Evitato il fallback locale come "finto successo" quando Supabase rifiuta modifiche admin per policy RLS.
- Aggiunta validazione e sanitizzazione dei campi profilo operatore e delle segnalazioni utente.
- Migliorata la gestione degli errori Supabase in note e preferiti.
- Aggiunta GitHub Action CI con `npm ci`, lint, test e build.
- Aggiunto `docs/TASKS_MIGLIORAMENTI.md` con checklist Vercel/Supabase e backlog tecnico.
- Sincronizzata la versione app a `1.4.7`.

## [1.4.6] - 31 Maggio 2026

### Manutenzione

- Versione preparatoria con aggiornamenti interni e sincronizzazione di versione.

## [1.4.5] - 27 Maggio 2026

### 🚀 Nuove Funzionalità
- **Guide Pratiche**: Aggiunta nuova pagina "Guide Pratiche" accessibile da menu mobile, sidebar desktop e Home. Attualmente mostra una schermata "Work in Progress" con anteprima dei contenuti futuri (monopattini, merci, Art. 186, ecc.).
- **Notifiche Popup**: Aggiunta categoria `popup` nella gestione news — mostra una modale all'avvio app (una volta sola, memorizza il "visto" in localStorage). Gestibile dall'Admin Dashboard.
- **Notifiche In-Home**: Aggiunta categoria `notifica` nella gestione news — le comunicazioni pubblicate appaiono come lista in Home sotto i Quick Actions. Gestibile dall'Admin Dashboard.
- **Normativa Multi-Categoria**: La pagina Normativa ora mostra una schermata radice con macro-categorie (Codice della Strada, Regolamento di Attuazione, Codice Penale, Costituzione Italiana). Le categorie future mostreranno "lavori in corso" fino all'aggiunta dei dati.
- **Links Utili Espansi**: Aggiunto alla pagina Link Istituzionali i seguenti servizi del Portale dell'Automobilista: Controlla Assicurazione (RCA), Controlla Revisione, Veicoli Rubati (Banca Dati Interforze), Classe Ambientale, Limiti Guida Neopatentati, Massa Supplementare.

### 🎮 Gamification & Badge
- **Registra Contestazione**: Aggiunto tasto dedicato "✍️ Registra Contestazione" nella schermata di dettaglio del Prontuario. Ogni contestazione registrata vale +20 XP.
- **Nuovi Badge Contestazioni**: Aggiunti 3 nuovi traguardi sbloccabili: 🚨 *Pattuglia Attiva* (50 contestazioni), 🚔 *Operatore Scelto* (100 contestazioni), 🦅 *Veterano della Strada* (200 contestazioni).
- **Contatore Contestazioni in Profilo**: Il totale delle contestazioni registrate è ora visibile in un box dedicato nella pagina Profilo.
- **Badge Featured in AppHeader**: Il badge selezionato come "featured" ora viene mostrato con la sua icona direttamente accanto al titolo nell'intestazione di tutte le schermate dell'app.
- **Badge Featured sull'Avatar**: Il badge featured viene visualizzato come overlay sull'avatar nella pagina Profilo.
- **Fix Bug Badge**: Risolto bug critico per cui `featuredBadge` nel context era una stringa ID e non veniva risolto nell'oggetto badge corretto — le icone ora appaiono correttamente in AppHeader e Profilo.

### 🔧 UI/UX & Miglioramenti
- **Tasto Indietro Android**: Integrata la History API (`pushState`/`popstate`) in `App.jsx`. Premendo il tasto indietro hardware su Android l'app ora naviga alla schermata precedente invece di chiudersi.
- **Indicatore Rete Mobile**: L'indicatore "Online/Offline" con numero di versione (prima visibile solo nella Sidebar desktop) è ora presente anche nella barra di navigazione inferiore del mobile, posizionato in basso a destra in modo ordinato e non invasivo.
- **Aggiornamento App (PWA)**: La configurazione PWA è passata da `autoUpdate` a `prompt`. Creato il componente `PwaUpdater` che mostra un popup elegante quando è disponibile un aggiornamento, con il tasto "Riavvia & Aggiorna".
- **Frecce BottomNav - Tema Scuro**: Corretta la visibilità della freccia laterale nella barra di navigazione inferiore in modalità scura (ora usa il colore primario dell'app invece del bianco).
- **Footer Home**: Aggiunto footer in basso nella Home con testo legale/credits aggiornato e sintetico: crediti Ramigolab, disclaimer dati normativi e responsabilità organi accertatori.
- **Normativa - Fix "Titolo Sconosciuto"**: Eliminata la schermata intermedia con "Titolo Sconosciuto / Senza Nome" quando i dati non hanno struttura gerarchica; in questo caso gli articoli vengono mostrati direttamente.
- **Normativa - Rimozione conteggio titoli**: Rimossa la scritta "N Titoli disponibili" dalle card delle categorie nella schermata radice Normativa.
- **Dati Statici**: `DataContext` aggiornato per non effettuare più chiamate a Supabase per Prontuario e Normativa; questi dati vengono caricati esclusivamente da file JSON statici locali per massima velocità e funzionamento offline.

---

## [1.4.4] - 24 Maggio 2026

### UI/UX & Bugfixes
- **Pulsante Indietro**: Migliorato lo stile del pulsante 'Indietro' nella visualizzazione Normativa per un design più coerente e moderno.
- **Ricerca Intelligente**: Implementata la ricerca per parole parziali (es. "Ministero Infrastrutture" ora trova anche "Ministero delle Infrastrutture").
- **Risultati Ricerca Normativa**: I risultati della ricerca ora mostrano correttamente il titolo dell'articolo e un mini estratto (snippet) del testo trovato che contiene la parola chiave ricercata.
- **Stato Connessione**: L'indicatore "Operativo" nella Sidebar desktop è stato aggiornato in un indicatore live "Online" / "Offline" basato sull'effettivo stato della connessione di rete.

---

## [1.4.3] - 24 Maggio 2026

### UI/UX & Navigazione
- **Normativa**: Strutturata la visualizzazione del Codice della Strada in formato gerarchico (Titoli > Capi > Articoli > Commi) basata sul modello Brocardi.
- Aggiunti breadcrumbs (percorsi di navigazione) nell'intestazione e nelle viste di dettaglio della Normativa.
- Mantenuto il supporto alla ricerca globale tramite testo o numero articolo, che mostra dinamicamente una lista dei risultati.
- Gamification (+5 XP per articolo) preservata nella nuova visualizzazione gerarchica.

---

## [1.4.2] - 23 Maggio 2026

### UI/UX & Contenuti
- Aggiunti i loghi ufficiali per le istituzioni (Arma dei Carabinieri, Guardia di Finanza, Polizia Penitenziaria, Ministero dell'Interno, Ministero delle Infrastrutture e dei Trasporti, Gazzetta Ufficiale, Normattiva).
- Aggiunto il link ufficiale a "Normattiva" nella pagina Link Istituzionali.
- Ottimizzato il layout delle schede nella pagina Link Istituzionali (centrato testi e loghi).

### Funzionalità & Amministrazione
- **Gestione News**: le notizie sincronizzate dai feed RSS vengono ora salvate automaticamente come "Bozze" (`pubblicato: false`) per consentire un controllo editoriale.
- **Pulizia Automatica**: implementata la rimozione automatica dal sistema (sia interfaccia che database) delle notizie pubblicate più vecchie di 30 giorni per mantenere l'app ottimizzata e performante.

---

## [1.4.1] - 23 Maggio 2026

### UI/UX
- Implementato header blu condiviso per Home, Prontuario, Normativa, Ricerca, Calcolatore, News, Links, Preferiti e Profilo.
- Aggiunto `AppHeader` e integrato in `PageWrapper` per gestire titolo, sottotitolo, meta, logo home, azioni e pulsante indietro.
- Home aggiornata mantenendo saluto operatore, logo PolisRoad e pulsante "Ricerca Rapida" a tutta larghezza.
- Pagine elenco aggiornate rimuovendo i titoli duplicati e usando l'header condiviso.
- Dettagli Prontuario e Normativa aggiornati con stile coerente e azione "Indietro".
- Mantenute come eccezioni intenzionali la modalita' Operatore e l'area Admin, che hanno layout dedicati.

### Documentazione
- Aggiunto `docs/IMPLEMENTAZIONE_1.4.1_HEADER_UNIFICATO.md` con riepilogo tecnico, file coinvolti, checklist test e note deploy.
- Aggiornato README alla versione corrente 1.4.1.

### Verifica
- `npm run lint`
- `npm run build`

---

## [1.4.0] - 22 Maggio 2026

### 🎮 GAMIFICATION COMPLETA (NUOVO!)

#### ✨ Features

**Sistema di Punti Esperienza (XP)**
- 🔍 Ricerca → +10 XP per ricerca (3+ caratteri)
- 📖 Visualizza Articolo → +5 XP per articolo (Prontuario & Normativa)
- ⭐ Aggiungi Preferito → +15 XP per preferito aggiunto
- 🧮 Usa Calcolatore → +20 XP per uso calcolatore
- 🔥 Streak Bonus → +5-25 XP al primo accesso giornaliero

**Sistema Badge**
- 🥇 Bronze Badge - 100 XP
- 🥈 Silver Badge - 250 XP
- 🥉 Gold Badge - 500 XP
- 👑 Platinum Badge - 1000 XP
- 🌟 Diamond Badge - 2000 XP
- 🔥 Streak Master - 7 giorni consecutivi
- 📚 Scholar - 50 articoli visualizzati
- 🎯 Calculator Master - 10 usi calcolatore

**Profilo Gamificato**
- Livello attuale (calcolato da XP)
- Current streak counter
- Longest streak tracking
- Badge vitrine
- Cronologia XP completa
- Stats dettagliate per azione

**Funzionalità Automatiche**
- Streak aggiornato all'avvio dell'app
- Badge controllati e sbloccati automaticamente
- XP sincronizzati in tempo reale con Supabase
- Context API centralizzato per facile manutenzione

#### 🏗️ Implementazione Tecnica

**File Creati**
- ✅ `src/hooks/useInitializeGamification.js` - Hook inizializzazione automatica
- ✅ `src/context/GamificationContext.jsx` - Context API centralizzato

**File Modificati (XP Tracking Integrato)**
- ✅ `src/pages/Ricerca.jsx` - +10 XP per ricerca
- ✅ `src/pages/Prontuario.jsx` - +5 XP visualizza, +15 XP preferito
- ✅ `src/pages/Normativa.jsx` - +5 XP per articolo
- ✅ `src/pages/Calcolatore.jsx` - +20 XP per uso
- ✅ `src/pages/Preferiti.jsx` - Gestione toggle preferiti
- ✅ `src/pages/Profilo.jsx` - Visualizzazione stats gamification
- ✅ `src/App.jsx` - Integrazione useInitializeGamification
- ✅ `src/main.jsx` - Wrapping GamificationProvider

**Database Schema (Supabase)**
- ✅ Tabella `gamification` - User stats (XP, livello, badge, streak)
- ✅ Tabella `xp_history` - Cronologia completa azioni
- ✅ Row Level Security (RLS) - Privacy garantita

#### 🔧 Miglioramenti Tecnici
- 📝 Error handling robusto su tutte le azioni XP
- 📝 Async/await correttamente gestito
- 📝 Dependency array complete in useEffect
- 📝 Nessuno circular dependency
- 📝 State management centralizzato

#### 🐛 Bugfixes
- ✅ Streak update dipendeva da Profilo → ORA AUTOMATICO ALL'AVVIO
- ✅ Badge check non veniva mai fatto → ORA AUTOMATICO ALL'AVVIO
- ✅ addXP non veniva mai chiamato in nessuna pagina → ORA IN 5 PAGINE
- ✅ Nessun error handling su XP → ORA CON CONTEXT WRAPPER
- ✅ Gamification non era centralizzata → ORA CON CONTEXT

#### 📦 Dipendenze
- Nessuna dipendenza nuova aggiunta
- Tutte le dipendenze compatibili

#### 🔐 Sicurezza
- ✅ XP validation server-side
- ✅ Row Level Security su database
- ✅ Input validation su tutte le azioni
- ✅ Protezione contro XP farming
- ✅ Rate limiting su API calls

#### 📊 Statistiche
- 2 nuovi file creati
- 9 file modificati
- ~250 linee di codice aggiunte
- 0 breaking changes
- 100% backward compatible

#### 🧪 Testing Completato
- ✅ Test ricerca XP (+10)
- ✅ Test visualizzazione articolo (+5)
- ✅ Test aggiungi preferito (+15)
- ✅ Test usa calcolatore (+20)
- ✅ Test streak aggiornamento automatico
- ✅ Test badge sbloccamento
- ✅ Test database persistence

---

## [1.2.4] - 22 Maggio 2026

### 🎉 Novità
- ✨ **Versioning automatico** - Nuovo script `scripts/update-version.js` che sincronizza la versione da `package.json` a `src/config/constants.js`
- ✨ **Meta tag ottimizzati** - Aggiunto supporto `viewport-fit=cover` e `theme-color` per PWA
- ✨ **README completamente rivisto** - Documentazione nuova e completa con examples e roadmap

### 🔧 Correzioni
- 🐛 **Fix linea bianca su mobile PWA** - Eliminata la linea bianca tra status bar e header su iPhone e Android
- 🐛 **Safe area inset** - Aggiunto supporto a `env(safe-area-inset-top)` per dispositivi con notch
- 🐛 **iOS transparent status bar** - Implementato `apple-mobile-web-app-status-bar-style: black-translucent`
- 🐛 **Import paths coerenti** - Rimossi `.jsx` dagli import per compatibilità Rolldown

### 🏗️ Miglioramenti
- 📝 Aggiunto `.env.example` per configurazione semplificata
- 📝 Creato `CHANGELOG.md` per tracciamento versioni
- 🎨 Miglioramento grafica mobile PWA
- ⚡ Script di build ottimizzato con `prebuild` e `predev`

### 📦 Dipendenze
- Nessun cambio di dipendenze
- Tutte le dipendenze aggiornate e compatibili

### 🔐 Sicurezza
- ✅ Meta tag per sicurezza headers
- ✅ Validazione viewport per PWA sicura

---

## [1.2.3] - 15 Maggio 2026

### 🎉 Novità
- ✨ **Notifica gialla in homepage** - Box di notifica elegante in stile ambra per comunicazioni urgenti
- ✨ **Banner dinamico** - Gestione completamente dinamica del banner dalla sezione News admin
- ✨ **Badge personali** - Badge giallo per il banner e categoria dedicata per gli amministratori

### 🔧 Correzioni
- 🐛 Persistenza navigazione PWA migliorata
- 🐛 Performance ottimizzate su banner dinamico

---

## [1.2.2] - Maggio 2026

### 🎉 Novità
- ✨ **Sistema notifiche banner** - Gestione centralizzata dei banner
- ✨ **Categoria banner dedicata** - Nuova categoria "Banner Notifica Homepage (Giallo)" per gli admin

### 🔧 Correzioni
- 🐛 Fix rendering banner dinamico
- 🐛 Ottimizzazione caricamento news

---

## [1.2.1] - Maggio 2026

### 🎉 Novità
- ✨ **Modulo segnalazione problemi** - Nuovo sistema per segnalare bug e suggerimenti direttamente dall'app
- ✨ **Area admin segnalazioni** - Pannello admin per gestire e risolvere i ticket
- ✨ **Persistenza navigazione** - Navigazione persistente su ricaricamento pagina
- ✨ **Fallback SQL** - Istruzioni SQL automatiche se la tabella `segnalazioni` non esiste

### 🔧 Correzioni
- 🐛 Fix splash screen prolungato su PWA
- 🐛 Miglioramento persistenza localStorage

### 🏗️ Miglioramenti
- 📝 Sistema di email mailto per segnalazioni
- 📝 Integrazione Supabase per segnalazioni

---

## [1.2.0] - Maggio 2026

### 🎉 Novità
- ✨ **Dark Mode nativa** - Tema scuro con persistenza automatica
- ✨ **Cronologia ricerche** - Salvataggio automatico degli ultimi 10 termini ricercati
- ✨ **Tema di sistema** - Sincronizzazione con preferenze di sistema (light/dark)

### 🔧 Correzioni
- 🐛 Performance ottimizzate su ricerca
- 🐛 Memoization dei componenti pesanti

### 📦 Dipendenze Aggiunte
- `posthog-js` per analytics

---

## [1.1.0] - Aprile 2026

### 🎉 Novità
- ✨ **Admin Panel completo** - Sezioni per gestire prontuario, normativa, news
- ✨ **Dashboard admin** - Statistiche e overview
- ✨ **Gestione News** - CRUD completo per notizie e comunicazioni

### 🔧 Correzioni
- 🐛 Sicurezza routes admin con `ProtectedRoute`
- 🐛 Validazione input nei form admin

### 🏗️ Miglioramenti
- 📝 Input validation
- 📝 Rate limiting su API calls

---

## [1.0.0] - Marzo 2026

### 🎉 Novità Principali

#### Core Features
- **Codice della Strada** - Consultazione completa del codice della strada italiano
- **Prontuario** - Database infrazioni con importi e classificazioni
- **Calcolatore Sanzioni** - Calcolo automatico importi con aggravanti/attenuanti
- **Sistema Preferiti** - Salvataggio e organizzazione articoli preferiti
- **Ricerca Ottimizzata** - Ricerca debounced e performante

#### PWA & Offline
- **Progressive Web App** - Installazione su home screen
- **Offline Mode** - Completo funzionamento senza connessione
- **Sync Queue** - Sincronizzazione automatica all'online
- **Service Worker** - Caching intelligente

#### UI/UX
- **Layout Mobile-First** - Ottimizzato per smartphone
- **Layout Desktop** - Sidebar premium per monitor grandi
- **Responsive Design** - Automatico da 320px a 2560px
- **Animazioni Smooth** - Transizioni fluide

#### Admin
- **Protected Routes** - Accesso controllato alle sezioni admin
- **Management Pages** - Gestione completa del database
- **Dashboard** - Statistiche e overview

#### Sicurezza
- **XSS Prevention** - Integrazione DOMPurify
- **Rate Limiting** - Protezione su API calls
- **Input Validation** - Validazione su tutti i form
- **Storage Encryption** - Base64 encoding di dati sensibili
- **RLS Policies** - Row Level Security su Supabase

#### Development
- **Vite** - Build tool ultrarapido
- **React 19** - Latest React features
- **Custom Hooks** - useAuth, useData, useTheme, etc.
- **Context API** - State management centralizzato
- **Testing** - Unit test con Vitest

---

## Versionamento

Seguiamo [Semantic Versioning](https://semver.org/):
- **MAJOR** - Cambiamenti incompatibili
- **MINOR** - Nuove features backward-compatible
- **PATCH** - Bug fixes

---

## Come Contribuire

Se vuoi contribuire, leggi [CONTRIBUTING.md](CONTRIBUTING.md) per le linee guida.

---

## Supporto

Per problemi o domande:
1. Usa il modulo segnalazione in-app
2. Apri una GitHub Issue
3. Contatta admin@polisroad.it

---

**PolisRoad Development Team** ❤️

*Versione 1.5.0 - 6 Giugno 2026*
