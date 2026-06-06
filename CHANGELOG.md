# 📝 CHANGELOG - PolisRoad

Tutte le modifiche significative a questo progetto saranno documentate in questo file.

---

## [1.5.0] - 6 Giugno 2026

### Bug Dark Mode
- **Sfondo Frecce BottomNav**: Sostituiti i gradienti hardcodati con la variabile CSS `--bg-card` per la corretta trasparenza in dark mode (`src/styles/layout.js`).
- **Home Comunicazioni & Popups**: Cambiato lo sfondo delle notifiche e dei popup in `C.card` (`src/pages/Home.jsx`).
- **Normativa & Links**: Sostituiti sfondi bianchi inline con `C.card` nei commi e nella lista link (`src/pages/Normativa.jsx`, `src/pages/Links.jsx`).
- **Auth & Admin**: Aggiornato il box del form di login/registrazione e le card di amministrazione normativa per usare `C.card` (`src/pages/Auth.jsx`, `src/pages/admin/AdminNormativa.jsx`).

### UX & Navigazione
- **BottomNav**: Aumentata la dimensione del font delle label dei tab a `0.7rem`.
- **Pagina Operatore**: Aumentato lo spazio sopra l'intestazione dei preferiti (`src/styles/pages.js`).
- **Normativa**: Aggiunto un pulsante in linea "← Indietro" in cima al contenuto delle sezioni Capo ed Articolo per facilitare la navigazione.

### GDPR & Policy
- **Pagine Legali**: Create le nuove pagine dedicate `Privacy Policy` e `Termini di Servizio` (`src/pages/Privacy.jsx`, `src/pages/TerminiServizio.jsx`).
- **Card Informazioni Legali**: Aggiunta una card con i link a Privacy e Termini in fondo alla Homepage.
- **Checkbox di Consenso**: Aggiunto un checkbox obbligatorio per l'accettazione dei termini e della privacy durante la registrazione ed un disclaimer con link nella schermata di login (`src/pages/Auth.jsx`).
- **Eliminazione Account**: Aggiunta una sezione "Zona Pericolosa" nel profilo con conferma in due passaggi e cancellazione client-side dei record associati all'utente (`profiles`, `gamification`, `xp_history`).

### Grafica & Estetica
- **Animazione Pulsante Operatore**: Aggiunto un keyframe animato `operatorePulse` per un effetto pulsazione sul pulsante "ATTIVA MODALITÀ OPERATORE".
- **Font Sora**: Importato Google Fonts Sora ed impostato su `--font-display` per i titoli principali.
- **Accento Gamification**: Introdotta la variabile `--color-xp` per colorare gli elementi di gamification in modo coerente e caldo (barre progresso livello, streak e badge).

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
