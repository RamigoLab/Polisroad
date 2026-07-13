# Changelog PolisRoad

## [2.0.0] — 6 Luglio 2026

Milestone che chiude il ciclo di audit completo avviato con la 1.9.7 (usabilità, ricerca, bug generali, config deploy, accessibilità, performance). Vedi le sezioni 1.9.7–1.9.9 sotto per il dettaglio di ogni singolo intervento.

### Corretto (audit tecnico finale)
- Service Worker: il fallback `fetch().catch()` per asset non precachati (caso raro: un asset non ancora in cache, richiesto offline) rispondeva con `undefined`, che la Fetch API tratta come errore silenzioso. Ora risponde con un 504 esplicito, gestibile normalmente dal codice chiamante.

### Verificato e confermato corretto (nessuna modifica necessaria)
Un audit esterno generico ha sollevato diversi punti già rivisti uno per uno sul codice reale:
- La gestione ENV/Supabase è intenzionale (supporta una modalità demo/offline), non un bug
- Race condition di login e redirect prematuro: già gestiti con fix specifici per iOS PWA (`useAuth.jsx`, `ProtectedRoute.jsx`), documentati nel codice
- `skipWaiting()`/`clients.claim()`: già presenti
- Lazy loading: già presente su tutte le pagine, code-splitting già ottimizzato nella 1.9.9
- PKCE auth flow: configurazione raccomandata da Supabase per le SPA, introdotta deliberatamente in passato — non va disabilitata senza un sintomo reale riscontrato

### Rimosso (8 luglio 2026)
- **"Registra Contestazione"** (Prontuario e Modalità Operatore): era una funzione legata alla gamification rimossa in 1.9.4 — dava XP e sbloccava traguardi. Da allora non salvava più nulla da nessuna parte (né online né offline: solo un toast e un evento PostHog), pur suggerendo all'operatore che stesse registrando qualcosa di reale. Rimossa insieme al riepilogo "contestazioni di sessione" in Modalità Operatore (introdotto in 1.9.9, basato sulla stessa funzione ormai priva di senso) e a `src/config/badges.js`, file di configurazione badge orfano rimasto dalla gamification e mai più referenziato

### Corretto (7 luglio 2026)
- **Cronologia ricerche non cancellabile**: la Ricerca Globale mostrava due liste sovrapposte delle ricerche recenti — una cancellabile (sezione "Ricerche recenti", con bottone di rimozione per voce) e una interna alla barra di ricerca senza alcun modo di eliminarla, mostrata proprio quando il campo era vuoto per una condizione invertita (`!value` invece di `!!value`). Il dropdown ora compare solo mentre si digita (autocompletamento vero), il campo vuoto mostra solo la sezione cancellabile
- Aggiunta navigazione da tastiera anche al dropdown di autocompletamento della Ricerca Globale (stesso pattern già applicato altrove)

### Ottimizzato (performance ricerca e ordinamento Prontuario)
- `sortItems`: trasformata di Schwartz — le chiavi di ordinamento si calcolano una volta per voce invece che ad ogni confronto durante il sort
- `searchEngine.js`: gli haystack normalizzati per la ricerca testuale si precalcolano una sola volta alla creazione dell'indice (quando cambiano i dati), non ad ogni carattere digitato

### Corretto (9 luglio 2026) — audit Lighthouse mobile (report reali, normale + incognito)
- **Icone del logo 5-13× più pesanti del necessario**: `icon-192.png` e `icon-512.png` erano lo stesso identico file 1024×1024 (283KB), nessuno dei due effettivamente ridimensionato come dice il nome — ogni logo in header/sidebar/splash screen scaricava un'immagine enorme per mostrarla a 30-40px. Questo era anche l'elemento LCP (Largest Contentful Paint) della Home, causa principale del calo di Performance (86-78/100 invece di 100). Ridimensionate correttamente: `icon-192.png` ora è davvero 192×192 (22KB, -92%), `icon-512.png` è 512×512 (135KB, -52%)
- Aggiunto `fetchpriority="high"` e un `<link rel="preload">` in `index.html` per il logo dello splash screen (l'elemento LCP), scopribile ora subito invece che solo dopo il render di React
- Estesa la cache delle icone statiche da 1 a 30 giorni (cambiano raramente)
- **Ulteriore riduzione del logo** (10 luglio, secondo giro Lighthouse): creata una versione WebP dedicata per l'uso nell'interfaccia (`logo.webp`, 3.3KB contro i 22KB del PNG) usata in Splash, Header e Sidebar — i PNG restano invariati per il manifest PWA e le notifiche push, che richiedono quel formato. Aggiunto `webp` ai pattern di precache del Service Worker (mancava, il nuovo file non sarebbe stato disponibile offline)
- **Disattivati session recording e surveys di PostHog** (terzo giro Lighthouse, non utilizzati): evitano di scaricare `posthog-recorder.js` (~36KB) e `surveys.js` (~22KB), le voci singolarmente più pesanti rimaste — non era un problema di caching ma di funzionalità caricate senza essere mai usate

### Accessibilità — pagine non ancora coperte (11 luglio 2026)
- `Calcolatore.jsx`: il toggle "Recidiva/Notturna/Sconto" era un `<div onClick>` senza semantica né tastiera — ora `role="switch"` con `aria-checked` e navigabile
- `Preferiti.jsx`, `News.jsx`: già bottoni veri, aggiunti `aria-label`/`aria-pressed` mancanti per chiarezza screen reader
- `Links.jsx`: i link che aprono in una nuova scheda ora lo dichiarano esplicitamente allo screen reader
- `GuidePratiche.jsx`: nessun problema (pagina statica, nessuna interattività)

### Set di icone completo (11 luglio 2026)
- **Icone "maskable" corrette**: riusavano la stessa immagine a bordo pieno delle icone normali — su Android, che ritaglia le icone maskable in cerchio/squircle, i bordi del logo venivano tagliati via. Create versioni dedicate con margine di sicurezza (contenuto al 66%, centrato)
- **`apple-touch-icon` corretto**: usava l'icona da 192×192, ora è la dimensione raccomandata da Apple (180×180)
- **Aggiunto `favicon.ico`** multi-risoluzione (16/32/48px) come fallback per contesti che non supportano ancora l'SVG
- Rimosso (di nuovo) `public/manifest.json`, file duplicato/orfano mai usato dalla PWA — il changelog storico raccontava fosse già stato tolto in passato, evidentemente era ricomparso
- **Contrasto colori semantici insufficiente**: oltre al testo secondario (già corretto in precedenza), anche `--color-success` (3.30:1), `--color-warning` (3.19:1) e `--color-danger` (4.83:1, al limite) erano sotto o al limite del minimo WCAG 4.5:1 quando usati come testo — trovato da axe su un toast reale ("App pronta per funzionare offline!", verde illeggibile). Scurite tutte e tre le tonalità (tema chiaro) a un contrasto di 5-6.5:1

### Da valutare (non modificato)
- PostHog carica moduli aggiuntivi (surveys, session recording, ~48KB) anche se probabilmente non utilizzati — da confermare con l'attivazione reale di queste funzionalità sulla dashboard PostHog prima di disattivarli

### Validazione con Lighthouse reale (7 luglio 2026)
Primo audit misurato (non dedotto dal codice) sulla build in produzione:
- **Performance: 100/100** — FCP 0.8s, LCP 0.9s, TBT 91ms, CLS 0, TTI 1.2s
- **Best Practices: 100/100**
- **Accessibilità: 94/100** — 2 problemi reali trovati e corretti:
  - I tab inattivi della barra di navigazione inferiore usavano `opacity: 0.6` su tutto il tab (icona + testo), abbassando il contrasto del testo sotto il minimo WCAG (2.87:1 misurato, richiesti 4.5:1). L'opacity ridotta ora si applica solo all'icona, il testo resta sempre a piena leggibilità
  - Mancava un landmark `<main>` nel documento (il contenitore del contenuto era un semplice `<div>`) — ora è un `<main>` semantico
- **SEO: 58/100** — atteso, l'app è privata e già marcata `noindex, nofollow` di proposito. Aggiunto anche un `robots.txt` esplicito (prima assente: la richiesta cadeva sul fallback SPA e restituiva `index.html`, generando 30 falsi errori nel report)

## [1.9.9] — 4 Luglio 2026

### Aggiunto
- **Feedback tattile distinto successo/errore in tutta l'app** (primo intervento del giro di rifiniture UX post-audit): i pattern di vibrazione già esistenti in `haptics.js` (successo, errore, medio) sono ora collegati centralmente a `showToast` invece di essere cablati manualmente in un paio di punti. Ogni toast di successo/errore/avviso in tutta l'app — Prontuario, Normativa, Profilo, Admin, Calcolatore, sync offline — vibra ora in modo coerente e distinguibile
- Conferma prima di disattivare le notifiche push su tutti i dispositivi (`Profilo.jsx`) — azione ora effettivamente funzionante dal fix precedente
- **Badge "nota presente"** su Prontuario e Modalità Operatore: un'icona indica a colpo d'occhio le voci (e i gruppi articolo) che hanno già una nota salvata, senza doverle aprire
- **Riepilogo contestazioni di sessione in Modalità Operatore**: card collassabile con l'elenco delle contestazioni registrate durante il turno corrente (orario + riferimento normativo), utile per un riepilogo rapido — dati solo di sessione, si azzerano chiudendo l'app (nessuna tabella DB aggiunta, coerente con la rimozione della gamification)
- **Dialog di conferma unificato** (`ConfirmDialog.jsx`): sostituisce tutti i `window.confirm()` sparsi nell'app (Admin Sinonimi, Segnalazioni, Prontuario, News, Normativa — 2 punti — e la conferma disattivazione notifiche) con un'unica esperienza coerente in stile app, invece del dialog spartano del browser
- **Accessibilità da tastiera estesa a tutta l'app**: le tessere di navigazione della Home (il punto d'ingresso principale dell'app), l'intera navigazione a scorrimento di Normativa (categoria → titolo → capo → articolo), le voci e i gruppi di Prontuario/Modalità Operatore, `ProfileItem`/`Expandable` in Profilo (usati in decine di righe), i pannelli Admin (Dashboard, Normativa, Prontuario) e la cronologia ricerche — prima erano `<div onClick>` non raggiungibili né attivabili da tastiera
- **Contrasto colori migliorato per uso outdoor**: il testo secondario in tema chiaro passava il contrasto minimo WCAG per un pelo (4.83:1); ora è 7.55:1 (supera anche l'AAA), pensato per l'uso in pieno sole tipico del lavoro su strada
- Aggiunti `aria-label` mancanti su pulsanti solo-icona (cancella ricerca, chiudi modale, rimuovi dalla cronologia)
- Aggiunto un indicatore di focus visibile sui campi di ricerca (prima l'outline era disabilitato senza alcun sostituto)
- **Code-splitting**: rimosso il raggruppamento forzato di tutte le dipendenze in un unico chunk "vendor" da 311KB precaricato su ogni pagina. Ora Fuse.js (motore di ricerca fuzzy) si separa correttamente nelle sole pagine che cercano davvero (Ricerca, Prontuario, Normativa, Operatore) — le pagine che non cercano (Home, Profilo, Calcolatore, ecc.) non lo scaricano più inutilmente

### Corretto
- **App non apribile offline se già chiusa (cold-start)**: il Service Worker precachava `index.html` ma le richieste di navigazione del browser (apertura app, reload) chiedono `/` — chiavi diverse, nessuna corrispondenza in cache. Risultato: se l'app era già aperta e si passava offline continuava a funzionare (nessuna nuova richiesta di navigazione), ma chiudendola/riaprendola offline non mostrava nulla ("nessuna connessione"). Aggiunta gestione esplicita delle richieste di navigazione che serve sempre `index.html` dalla cache quando la rete non risponde
- Rimossi 2 punti in `ProntuarioDetail.jsx` (salvataggio nota, contestazione) che con la nuova vibrazione centralizzata avrebbero causato una doppia vibrazione
- **Sentry senza tag di versione**: aggiunto `release: polisroad@<versione>` a `Sentry.init` — prima tutti gli errori di ogni deploy finivano nello stesso bucket, impossibile capire da quale versione partiva un problema
- **Sourcemap disabilitati**: abilitati come `hidden` in `vite.config.js` — prima ogni errore in Sentry arrivava con stack trace minificati illeggibili. Aggiunto script `postbuild` che rimuove i `.map` da `dist/` dopo la build (altrimenti Vercel li pubblicherebbe comunque come file statici raggiungibili da URL diretto, senza che nessuna pipeline li carichi ancora su Sentry)
- `.env.example`: rimossa la documentazione fuorviante di `VITE_APP_VERSION` (variabile mai letta dal codice — la versione reale viene scritta automaticamente in `constants.js` dallo script di build), aggiunta la documentazione mancante di `VITE_CACHE_BUSTER`
- CSP (`vercel.json`): rimossi permessi per Google Fonts mai utilizzati nel codice

## [1.9.8] — 2 Luglio 2026

### Audit generale (4 Luglio 2026) — bug fix, nessun cambio di versione
Vedi `AUDIT-GENERALE-1.9.8.md` per il dettaglio completo. In sintesi:
- Fix: stale closure nella navigazione da notifica push (`App.jsx`) — poteva generare voci di history del browser sbagliate
- Fix: "Disattiva notifiche su tutti i dispositivi" disattivava solo il dispositivo corrente (`Profilo.jsx`)
- Fix: bottone "Annulla" nel form di modifica profilo non chiudeva il form né ripristinava i valori (`Profilo.jsx`)
- Fix: versioning della cache del Service Worker mai attivo (`__BUILD_TIMESTAMP__` non definito in `vite.config.js`) — la pulizia automatica delle cache vecchie non scattava mai
- Fix: migration `search_synonyms` allineata a `public.is_admin()` invece di una sub-query diretta su `profiles` (⚠️ se avete già eseguito la versione precedente della migration su Supabase, andrebbe rieseguita la sola parte delle policy — vedi nota in README)
- Aggiunto: feedback "Password sicura" quando tutti i requisiti sono soddisfatti (`PasswordInput.jsx`)
- Aggiunto: gestione errore sulla copia negli appunti nel Calcolatore
- Corretti 2 refusi nel changelog in-app, ripulito codice morto in una decina di file

### Aggiunto
- **Motore di ricerca unificato** (`src/utils/searchEngine.js`): Ricerca Globale, Prontuario, Normativa e **Modalità Operatore** usano ora la stessa logica — stessa soglia minima (3 caratteri), stesso ordine (esatto → sinonimi → testo → fuzzy), fuzzy matching (Fuse.js) esteso a tutte (prima solo nella Ricerca Globale)
- **Ricerca con sinonimi ("risultato suggerito")**: nuova tabella Supabase `search_synonyms` che mappa frasi colloquiali usate sul campo (es. "senza assicurazione", "manca revisione") alla violazione corrispondente del Prontuario, mostrata in cima ai risultati con badge dedicato
- **Nuova sezione Admin > Sinonimi** (`AdminSinonimi.jsx`): CRUD completo per aggiungere, correggere, disattivare i sinonimi senza deploy
- `synonymsService.js` + `useSearchSynonyms.js`: integrazione nel `DataContext` con cache React Query (offline-friendly, come prontuario/normativa)
- Normalizzazione accenti/diacritici nella ricerca testuale (es. "perché" e "perche" ora equivalenti)
- Seed iniziale: 477 sinonimi generati per 172 violazioni (54 curate a mano sulle violazioni più frequenti nei controlli stradali + 118 generate da regole automatiche sulle forme negative del testo — es. "sprovvisto di X" → "senza X"). Copertura parziale e volutamente conservativa: meglio niente suggerimento che uno fuorviante. Ampliabile nel tempo dalla pagina Admin > Sinonimi

### Corretto
- Prontuario, Normativa e Modalità Operatore: prima cercavano ciascuna con soglie diverse (2, 0 e 0 caratteri) e senza fuzzy matching, senza debounce nel caso di Operatore; ora identiche alla Ricerca Globale
- `target_ref` dei sinonimi punta a `prontuario.codice_caso` (non `codice_violazione`, vuoto nel 52% delle righe della tabella prontuario)

### Note tecniche
- Migration: `supabase/migrations/20260702_create_search_synonyms.sql` (tabella + RLS + seed) — **da eseguire manualmente su Supabase dopo il deploy**
- RLS `search_synonyms`: lettura aperta (authenticated + anon), scrittura riservata al ruolo admin — stesso pattern di `prontuario`
- Schema pronto anche per sinonimi su `normativa` (`target_type = 'normativa'`), nessun dato ancora seedato

## [1.9.7] — 1 Luglio 2026

### Aggiunto
- Indicatore "ricerca in corso" nella SearchBar (spinner tra la digitazione e la comparsa dei risultati), applicato a Ricerca Globale, Prontuario e Normativa
- `useSearch`: nuovo flag `isPending` per distinguere lo stato "sotto soglia minima" da "in attesa del debounce"

### Corretto
- Ricerca Globale: i gruppi di risultati espandibili (Prontuario/Normativa) e le relative voci sono ora navigabili e attivabili da tastiera (`role="button"`, `tabIndex`, `onKeyDown` su Invio/Spazio), coerente con il comportamento già presente in Prontuario.jsx
- Ricerca Globale: rimossa una dichiarazione `border` duplicata nei pulsanti filtro (la prima veniva silenziosamente sovrascritta)

### Rimosso
- Codice della gamification non più utilizzato: componenti (`BadgeShowcase`, `LevelProgress`, `StreakCounter`), hook (`useGamification`, `useInitializeGamification`), `GamificationContext` e `gamificationService` — nessun riferimento residuo nell'app (le tabelle DB erano già state rimosse in 1.9.4/dropgamification)

### Note
- Primo intervento a valle dell'audit di usabilità completo (vedi documento allegato). La revisione della logica di ricerca (unificazione motore + sinonimi) è pianificata per una release successiva.

## [1.9.6] — 30 Giugno 2026

### Corretto
- AdminUtenti: errore 400 su caricamento lista utenti — colonna `created_at` non presente in `profiles`, rimossa dalla SELECT
- Header app: rimossi bordi arrotondati in basso, aspetto piatto e uniforme su tutte le pagine
- BottomNav: rimossa barra stato Online/Offline ridondante sopra le icone
- `styles.js`: carattere spurio nella definizione `btnOutline` che causava errore di build
- `changelog.js`: apostrofi italiani nelle stringhe ora usano template literals per evitare errori di build

### Database
- Aggiunta colonna `created_at` a `profiles` per mostrare la data di registrazione in AdminUtenti
- Audit RLS completato su tutte le tabelle pubbliche
- Rimossa tabella `profiles_admin` senza RLS (esponeva tutti i profili senza autenticazione)
- Corrette policy `delete_any_profile_admin` e `update_any_profile_admin` su `profiles` (usavano subquery ricorsive che causavano deadlock potenziale)
- Creata funzione `is_admin()` con `SECURITY DEFINER` usata da tutte le policy admin
- Rimossa policy `Users can read all profiles` con ruolo `public` su `profiles`
- Eliminate circa 15 policy duplicate su `news`, `note`, `codice_strada`, `push_subscriptions`, `segnalazioni`
- Policy `note` e `preferiti` corrette da ruolo `public` ad `authenticated`
- Rimosso `INSERT` anonimo su `segnalazioni` (chiunque poteva inserire segnalazioni senza autenticazione)

## [1.9.5] — 30 Giugno 2026

### Aggiunto
- Redesign grafico completo: nuovo sistema di colori, header con sfumatura, card con ombra leggera
- Profilo ridisegnato con struttura a gruppi (Account, Preferenze, Notifiche, Informazioni, Supporto)
- Statistiche di utilizzo nel Profilo (preferiti, note, segnalazioni)
- Blocco Help Desk con link email admin e link alle News
- Icone unificate con lucide-react su tutta l'app
- Onboarding aggiornato (rimossa slide gamification, aggiunta slide offline)
- Toast con design pill e icone semantiche
- SearchBar con focus ring e pulsante clear

### Corretto
- `useSyncQueue` non scrive piu su tabelle gamification rimosse
- Popup Home si chiude cliccando fuori dal riquadro
- NavCard label rispetta la dark mode
- Auth migrata a PKCE flow (piu sicuro)
- CSP aggiornata con domini Sentry e worker-src
- CORS `send-push` ristretto alle origini autorizzate
- `storage.js` usa TextEncoder al posto di funzioni deprecate

## [1.9.4] — 29 Giugno 2026
- Rimossa gamification (XP, badge, streak)
- Fix critico: `delete-user` Edge Function consentiva solo auto-eliminazione
- Fix race condition eliminazione account in Profilo
- Notifica push admin su nuova registrazione (trigger pg_net)
- Service Worker: bypass cache per chiamate Supabase
- Profilo a sezioni collassabili
- Home: footer unificato, NavCard con feedback touch
- Ricerca: filtri per tipo (Prontuario / Normativa / Tutti)
- Calcolatore: persistenza sessionStorage
- AdminUtenti: fix pendingCount
- Dashboard: stato Supabase in tempo reale

## [1.9.3] — 28 Giugno 2026
- Fix crash Home (null guard featuredBadge)
- Fix recupero password

## [1.9.2] — 28 Giugno 2026
- Fix login utenti non-admin
- Fix flash iOS schermata approvazione
- Fix build Vite

## [1.9.1] — 27 Giugno 2026
- Fix RLS deadlock profiles
- Fix push subscriptions RLS

## [1.9.0] — 26 Giugno 2026
- Wizard onboarding
- AdminNotifiche broadcast push
- AdminUtenti con eliminazione utente
- PWA install prompt
- Ricerca globale
