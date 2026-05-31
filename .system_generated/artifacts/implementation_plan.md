# Piano di Implementazione: Polisroad v1.4.5

Questo piano descrive le modifiche architetturali e funzionali richieste per aggiornare l'app alla versione 1.4.5, introducendo nuove funzionalità, sistemando bug e ottimizzando l'architettura offline.

## User Review Required

> [!WARNING]
> **Gestione Back Button Android**: Attualmente il routing dell'app (in `App.jsx`) è gestito con uno stato React (`currentPage`). Per far funzionare il tasto "Indietro" di Android (PWA), modificherò il sistema in modo che utilizzi la History API del browser (`pushState` e `popstate`). Questo potrebbe alterare leggermente il modo in cui i parametri di navigazione passano tra le pagine.

> [!IMPORTANT]
> **Normativa e Prontuario Statici**: Trasformerò i dati del Prontuario e della Normativa in file JSON statici inclusi nel bundle o caricati via Service Worker per garantire "zero chiamate" e funzionamento offline perfetto. Ti confermo che questo significa che eventuali aggiornamenti a queste sezioni richiederanno un aggiornamento dell'app (nuova versione) piuttosto che un aggiornamento solo su Supabase.

## Open Questions

> [!NOTE]
> 1. **Normativa**: Hai indicato "deve mostrare codice della strada legge ecc. E poi sotto eventuali altre normative". Nel database attuale, ci sono un campo o una categoria per differenziare il "Codice della strada" dalle "Altre normative"? Se non ci sono, aggiungerò una divisione basata sul titolo o creeremo una struttura per accoglierle in futuro.
> 2. **Gamification Badge**: Attualmente il badge "featured" selezionato non viene visualizzato in modo prominente. Propongo di inserirlo nell'`AppHeader` (accanto al titolo o al logo) in modo che sia sempre visibile, e accanto all'avatar nella pagina Profilo. Va bene?
> 3. **Notifiche**: Per la gestione delle notifiche/popup (modificabili dall'amministratore), propongo di utilizzare la tabella `news` esistente su Supabase, aggiungendo una categoria "popup" o "notifica". L'app mostrerà le news di categoria "popup" come modale all'avvio (una sola volta per utente) e le "notifica" in una sezione dedicata nella Home. Sei d'accordo?

## Proposed Changes

---

### App Foundation & Routing

#### [MODIFY] src/App.jsx
- Implementazione dell'History API (`window.history.pushState` e listener su `popstate`) per intercettare il tasto "Indietro" su Android.
- Integrazione della nuova pagina "Guide Pratiche".
- Integrazione logica per mostrare il Popup di notifica all'avvio.

#### [MODIFY] src/components/layout/BottomNav.jsx & src/components/layout/Sidebar.jsx
- Aggiunta della nuova voce "Guide Pratiche".

#### [MODIFY] src/styles/layout.js o src/index.css
- Correzione del tema scuro per la barra di navigazione inferiore (frecce bianche invisibili).

---

### Nuove Pagine e Contenuti

#### [NEW] src/pages/GuidePratiche.jsx
- Nuova pagina raggiungibile dalla Home e dai menù.
- Inizialmente conterrà la dicitura "Work in progress" e una struttura di base per ospitare i link a "legge e contestazioni sui monopattini", ecc.

#### [MODIFY] src/pages/Links.jsx
- Aggiornamento della pagina esistente (o creazione nuova se preferito) con i collegamenti richiesti: "controlla assicurazioni", "controlla revisione", "veicoli rubati", "classe ambientale", "limita guida neopatentati", "massa supplementare".

#### [MODIFY] src/pages/Home.jsx
- Aggiunta della sezione notifiche.
- Aggiunta del footer con il testo legale specifico fornito ("Applicazione SVILUPPATA DA Ramigolab © 2026 POLIsroad...").
- Aggiunta del pulsante per la pagina "Guide Pratiche".

---

### Gamification & Contestazioni

#### [MODIFY] src/pages/Prontuario.jsx
- Aggiunta del tasto "Registra contestazione" all'interno del dettaglio del prontuario (sia in modalità utente che operatore).
- Integrazione con `GamificationContext` per salvare la contestazione.

#### [MODIFY] src/context/GamificationContext.jsx
- Espansione del contesto per tracciare il numero totale di contestazioni.
- Aggiunta dei nuovi badge basati sulle soglie (50, 100, 200 contestazioni) e su categorie specifiche (es. velocità, cinture, se deducibili dal prontuario).

#### [MODIFY] src/pages/Profilo.jsx
- Visualizzazione del contatore delle contestazioni effettuate.
- Visualizzazione migliorata del badge "featured" selezionato.

#### [MODIFY] src/components/layout/AppHeader.jsx
- Visualizzazione del badge "featured" accanto al logo o al titolo dell'app.

---

### Offline & Dati Statici

#### [MODIFY] src/hooks/useProntuario.js & src/hooks/useNormativa.js
- Modifica dei sorgenti dati: invece di interrogare Supabase, questi hook caricheranno i file JSON statici locali (`src/data/prontuario.json` e `src/data/normativa.json` o file javascript generati) per garantire funzionamento offline immediato e "zero chiamate" di rete.

#### [MODIFY] vite.config.js / Service Worker
- Assicurarsi che i file statici JSON siano correttamente messi in cache dal Service Worker per il funzionamento offline PWA.

---

### Versione & Documentazione

#### [MODIFY] package.json, README.md, CHANGELOG.md
- Aggiornamento di tutte le occorrenze della versione alla `1.4.5`.
- Aggiunta delle note di rilascio relative alle modifiche effettuate.

## Verification Plan

### Automated Tests
- Esecuzione del comando di linting (`npm run lint`).
- Test di build (`npm run build`) per assicurare che il Service Worker e i file statici vengano generati correttamente.

### Manual Verification
- Test PWA su browser mobile per simulare il comportamento del tasto "Indietro" di Android.
- Verifica del tema scuro nella barra inferiore su dispositivi mobili.
- Simulare l'assegnazione di 50+ contestazioni per verificare lo sblocco del nuovo badge.
- Testare il funzionamento offline staccando la rete e verificando che Prontuario e Normativa siano consultabili.
