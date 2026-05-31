# Task miglioramenti PolisRoad

Analisi rifatta il 31/05/2026 considerando il contesto reale:

- deploy frontend su Vercel;
- database e autenticazione su Supabase;
- modifiche locali e push tramite GitHub Desktop.

## Sintesi priorita'

La priorita' non e' aggiungere logica server nel repository Vite: su Vercel questa app viene distribuita come frontend statico. La sicurezza reale deve stare soprattutto in Supabase tramite RLS, policy, funzioni RPC e configurazione Auth. Le variabili `VITE_*` sono pubbliche nel bundle e vanno trattate come configurazione client, non come segreti.

## Stato correzioni locali

- Fatto: rimossa la cancellazione automatica delle news dal client.
- Fatto: aggiunta migrazione Supabase per `segnalazioni` con RLS non permissiva.
- Fatto: aggiornato lo snippet SQL mostrato nell'area admin.
- Fatto: aggiunta validazione/sanitizzazione per profilo e segnalazioni utente.
- Fatto: migliorata gestione errori in note e preferiti.
- Fatto: aggiunta GitHub Action per lint, test e build.
- Fatto: ripristinata installazione locale con `npm ci`; test, lint e build passano.
- Da fare in Supabase: applicare/verificare le policy RLS reali sul progetto di produzione.
- Da fare in Vercel: verificare le variabili ambiente di produzione.
- Da valutare dopo: spostare sync RSS in una Vercel Function o Supabase Edge Function.

## P0 - Prima del prossimo deploy importante

### Audit RLS Supabase su tutte le tabelle
- **Perche':** `ProtectedRoute` protegge solo l'interfaccia. Un utente puo' comunque chiamare direttamente Supabase con la anon key pubblica se le policy sono permissive.
- **Dove:** Supabase Dashboard > Authentication/Database > Policies.
- **Tabelle da verificare:** `profiles`, `news`, `codice_strada`, `prontuario`, `segnalazioni`, `note`, `preferiti`, `gamification`, `xp_history`.
- **Regola pratica:**
  - dati pubblici in sola lettura solo dove serve davvero;
  - insert/update/delete admin solo con controllo ruolo lato DB;
  - dati personali leggibili e modificabili solo dal proprietario.
- **Done quando:** un account non admin non puo' modificare news, normativa, prontuario o segnalazioni anche usando Supabase API fuori dall'app.

### Correggere policy `segnalazioni`
- **Perche':** lo snippet in `src/pages/admin/AdminSegnalazioni.jsx` propone `FOR ALL USING (true)`, pericoloso in produzione.
- **Cosa fare nel codice:**
  - sostituire lo snippet mostrato in app con policy piu' restrittive;
  - aggiungere una migrazione SQL in `supabase/migrations`.
- **Policy consigliata:**
  - `INSERT` consentito agli utenti autenticati, o anonimo solo se vuoi segnalazioni senza login;
  - `SELECT`, `UPDATE`, `DELETE` solo admin;
  - niente `FOR ALL USING (true)`.
- **Done quando:** la gestione completa delle segnalazioni non e' pubblica.

### Rimuovere cancellazione automatica news dal client
- **Perche':** `src/context/DataContext.jsx` cancella news pubblicate piu' vecchie di 30 giorni quando l'app si apre. Su Vercel ogni client e' non fidato: le operazioni distruttive automatiche vanno evitate.
- **Cosa fare nel codice:**
  - filtrare lato lettura le news scadute;
  - togliere `supabase.from('news').delete().in(...)` dal caricamento app.
- **Cosa fare in Supabase:**
  - se vuoi eliminazione reale, usare funzione SQL/RPC admin o job pianificato.
- **Done quando:** aprire l'app non puo' cancellare righe dal database.

### Verificare variabili ambiente su Vercel
- **Perche':** Vercel inietta le variabili al build. Se cambi `.env` locale ma non Vercel, produzione resta diversa.
- **Da impostare in Vercel Project Settings > Environment Variables:**
  - `VITE_SUPABASE_URL`;
  - `VITE_SUPABASE_ANON_KEY`;
  - `VITE_USE_SUPABASE=true`;
  - `VITE_DEMO_MODE=false`;
  - `VITE_POSTHOG_KEY` solo se vuoi analytics;
  - `VITE_POSTHOG_HOST`, meglio `https://eu.i.posthog.com` se usi host EU.
- **Da non mettere mai:** Supabase service role key o chiavi segrete senza prefisso `VITE_` pensando che siano protette nel frontend.
- **Done quando:** produzione Vercel usa Supabase reale, demo mode e' disattivata, nessun segreto server-side e' nel bundle.

## P1 - Da sistemare nel repository prima di pushare spesso

### Correggere encoding/refusi UI
- **Perche':** ci sono testi che in alcuni terminali/editor possono apparire con encoding errato. In produzione Vercel li mostrera' cosi' agli utenti se i file non sono salvati correttamente.
- **File principali:** `src/context/DataContext.jsx`, `src/components/ProtectedRoute.jsx`, `src/pages/Auth.jsx`, `src/pages/admin/AdminNews.jsx`, `src/pages/admin/AdminLayout.jsx`, `src/pages/admin/AdminSegnalazioni.jsx`, `src/pages/Profilo.jsx`, `src/context/GamificationContext.jsx`, `src/main.jsx`, `src/hooks/useSyncQueue.js`, `src/utils/validation.js`, `.env.example`.
- **Cosa fare:** salvare i file in UTF-8 e sostituire i testi corrotti con accenti corretti oppure testo ASCII.
- **Done quando:** una ricerca dei pattern mojibake ricorrenti non trova piu' testi indesiderati nei sorgenti.

### Ripristinare test runner locale
- **Perche':** `npm run test:run` fallisce per binario `vitest` mancante in `node_modules/.bin`, anche se `package-lock.json` contiene Vitest.
- **Cosa fare localmente prima di pushare:**
  - chiudere dev server;
  - eseguire `npm ci`;
  - rieseguire `npm run test:run`;
  - se serve, eliminare e reinstallare `node_modules` tramite strumenti standard.
- **Nota Vercel:** Vercel fara' una install pulita, quindi potrebbe buildare comunque. Ma se i test non partono localmente, perdi controllo prima del push.
- **Done quando:** `npm run lint`, `npm run test:run`, `npm run build` passano in locale.

### Aggiungere GitHub Actions leggera
- **Perche':** usi GitHub Desktop per pushare: una CI su GitHub ti avvisa subito se hai rotto build/lint/test prima che Vercel deployi male.
- **Cosa fare:** creare `.github/workflows/ci.yml` con:
  - checkout;
  - setup Node 20;
  - `npm ci`;
  - `npm run lint`;
  - `npm run test:run`;
  - `npm run build`.
- **Done quando:** ogni push mostra esito automatico su GitHub.

### Validare meglio profilo e segnalazioni
- **Perche':** `Profilo` salva campi utente e segnalazioni con meno controlli rispetto ad `Auth` e `AdminNews`.
- **File:** `src/pages/Profilo.jsx`, `src/utils/validation.js`.
- **Cosa fare:** riusare `validators` e `sanitizers` per nome, grado, forza, telefono, dettagli segnalazione e email.
- **Done quando:** campi troppo lunghi, email non valide e input sporchi vengono bloccati o puliti prima di Supabase.

### Gestire errori Supabase negli hook utente
- **Perche':** `useNote` e `usePreferiti` ignorano errori in alcune query/mutazioni, quindi l'interfaccia puo' sembrare aggiornata anche se Supabase ha rifiutato.
- **File:** `src/hooks/useNote.js`, `src/hooks/usePreferiti.js`, `src/hooks/useSyncQueue.js`.
- **Cosa fare:** controllare sempre `{ error }`, mostrare toast e aggiornare lo stato locale solo su successo reale.
- **Done quando:** errori RLS/rete non producono dati incoerenti.

## P2 - Performance e manutenzione

### Caricare normativa/prontuario on demand
- **Perche':** `DataContext` carica tutta la normativa a blocchi da 1000 record all'avvio. Su Vercel il bundle e' statico, ma i dati arrivano dal browser a Supabase: piu' record scarichi, piu' l'avvio rallenta.
- **File:** `src/context/DataContext.jsx`, `src/hooks/useSearch.js`, `src/pages/Normativa.jsx`, `src/pages/Ricerca.jsx`.
- **Cosa fare:** paginazione, ricerca lato Supabase, indici/full-text search, cache PWA controllata.
- **Done quando:** l'app parte senza scaricare tutto il database.

### Spostare sync RSS fuori dal browser
- **Perche':** `AdminNews` usa `api.rss2json.com` dal client. In produzione dipendi da un proxy pubblico, rate limit e CORS.
- **Opzioni adatte al tuo stack:**
  - Supabase Edge Function chiamata dall'admin;
  - job schedulato Supabase;
  - Vercel Serverless Function, se vuoi introdurre una piccola API.
- **Done quando:** il browser admin non chiama piu' direttamente proxy RSS terzi.

### Uniformare hook CRUD admin
- **Perche':** `useNews`, `useNormativa`, `useProntuario` fanno cose simili ma con gestione stato/errori diversa.
- **Cosa fare:** update funzionali ovunque, ritorni `{ data, error }` coerenti, mapping colonne DB centralizzato.
- **Done quando:** le pagine admin hanno comportamento prevedibile e testabile.

### Ridurre log informativi in produzione
- **Perche':** console log di gamification/sync possono sporcare la console degli utenti.
- **File:** `src/context/GamificationContext.jsx`, `src/hooks/useInitializeGamification.js`, `src/pages/admin/AdminNews.jsx`.
- **Cosa fare:** logger condizionato su `import.meta.env.DEV`.
- **Done quando:** produzione Vercel non emette log informativi inutili.

## Checklist prima del push con GitHub Desktop

1. `npm run lint`
2. `npm run test:run`
3. `npm run build`
4. controllare che `git status` non includa `.env`, `.env.local`, `dist` o `node_modules`
5. push con GitHub Desktop
6. controllare deploy Vercel e log build
7. provare login, area admin, una lettura normativa e una scrittura non distruttiva su Supabase

## Verifiche eseguite in questa analisi

- `npm run lint`: passato.
- `npm run build`: passato.
- `npm run test:run`: fallito per binario `vitest` non disponibile in `node_modules/.bin`.
