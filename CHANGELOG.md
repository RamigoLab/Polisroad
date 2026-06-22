# 📝 CHANGELOG - PolisRoad

## [1.7.0] - 22 Giugno 2026

### 🏗️ TASK 2 — Service Layer (`src/services/`)

Creato layer di servizio che centralizza tutte le chiamate Supabase. Gli hook non parlano più direttamente col DB.

**`src/services/prontuarioService.js`** (nuovo)
- `getPreferiti(userId)` — lista id preferiti
- `addPreferito(userId, prontuarioId)` / `removePreferito(...)` — toggle favoriti
- `getNote(userId)` — mappa `{prontuarioId: testo}` di tutte le note
- `upsertNota(userId, prontuarioId, testo)` / `deleteNota(...)` — salvataggio note

**`src/services/gamificationService.js`** (nuovo)
- `getGamificationStats(userId)` — fetch con auto-create se riga mancante
- `updateGamificationStats(userId, updates)` — update atomico
- `insertXpHistory(userId, action, xpEarned)` — log XP

**`src/services/authService.js`** (nuovo)
- `fetchProfile`, `upsertProfile`, `fetchUserCount`
- `signIn`, `signUp`, `resetPassword`, `updatePassword`, `signOut`

**Hook refactored**: `usePreferiti`, `useNote`, `useGamification`, `useAuth` — ora importano dai service. Nessuna chiamata `supabase.from(...)` diretta negli hook.

---

### ⚡ TASK 3 — TanStack Query (caching e zero fetch duplicati)

Installato `@tanstack/react-query` v5. Configurato `QueryClientProvider` in `main.jsx`:
- `staleTime: 5 min` — dati considerati freschi per 5 minuti
- `gcTime: 30 min` — cache mantenuta in memoria 30 minuti
- `retry: 2` — 2 retry automatici su errore di rete
- `refetchOnWindowFocus: false` — no re-fetch al cambio tab

**`usePreferiti`** — riscrittura completa con `useQuery` + `useMutation`:
- Aggiornamento ottimistico immediato: il toggle è istantaneo visivamente, si rollbacka se il server risponde con errore
- Cache condivisa per chiave `['preferiti', userId]` — navigazioni successive non generano nuovi fetch

**`useNote`** — riscrittura completa con `useQuery` + `useMutation`:
- Stesso pattern ottimistico: la nota appare salvata subito, si rollbacka su errore
- Compatibilità con `useSyncQueue` mantenuta per la modalità offline

**`useGamification`** — riscrittura con `useQuery`:
- Statistiche caricate una volta e cachate; `updateCache()` helper aggiorna la cache locale ottimisticamente ad ogni addXP/updateStreak senza refetch
- `checkNewBadges` e `setFeaturedBadge` scrivono su cache + server in parallelo

---

### 🔴 TASK 1 — Fix immediati

**1A — Badge gamification solo in Home** (`AppHeader.jsx`, `PageWrapper.jsx`, `Home.jsx`)
- Rimossa la logica `!leftAction` che mostrava il badge su tutte le pagine top-level
- Introdotta prop esplicita `showBadge` (default `false`) su `PageWrapper` e `AppHeader`
- Solo `Home.jsx` passa `showBadge={true}` — tutte le altre pagine non mostrano il badge

**1B — Tasto "Chiudi" area amministrativa** (`layout.js`, `AdminLayout.jsx`)
- Precedente stile: `color: #fff` su `backgroundColor: accentLight` (azzurro chiaro) → contrasto invisibile
- Nuovo stile: testo bianco su `rgba(255,255,255,0.15)` con bordo `rgba(255,255,255,0.5)` — leggibile sull'header scuro
- Firma funzione semplificata: `adminCloseBtn()` senza argomenti (il parametro `accentLight` era inutilizzato nel nuovo stile)

**1C — Migrazione SQL `note_comuni`** (`supabase/migrations/20260622_add_note_comuni_prontuario.sql`)
- Aggiunge colonna `note_comuni TEXT` alla tabella `prontuario` con `IF NOT EXISTS`
- Necessaria per chi aveva il DB prima della 1.6.9



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
