# PolisRoad

Progressive Web App React/Vite per consultazione rapida del Codice della Strada, prontuario, preferiti, calcolo sanzioni, news, profilo operatore e funzioni admin.

Versione corrente: **1.5.0**

## Stack

- React 19
- Vite
- Supabase Auth e database
- Vite PWA
- PostHog opzionale
- DOMPurify per sanitizzazione input HTML/testo

## Requisiti

- Node.js 20 o superiore consigliato
- Un progetto Supabase configurato con le tabelle usate dall'app

## Configurazione

1. Copia `.env.example` in `.env`.
2. Imposta le variabili Supabase:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_USE_SUPABASE=true
VITE_DEMO_MODE=false
```

La modalita' demo e' pensata solo per sviluppo locale. In produzione lascia `VITE_DEMO_MODE=false`.

## Script

```bash
npm install
npm run dev
npm run lint
npm run test:run
npm run build
npm run preview
```

## Sicurezza

- Il login reale passa da Supabase Auth.
- I ruoli admin devono essere verificati anche lato database tramite RLS/policies Supabase.
- Non committare mai file `.env` con chiavi reali.
- La chiave Supabase anon e' adatta al client solo se le policy RLS sono configurate correttamente.
- La gamification lato client aggiorna Supabase, ma per anti-abuso forte e concorrenza perfetta e' consigliata una RPC Supabase dedicata per assegnare XP.

## PWA

Il service worker PWA e' disattivato in sviluppo per evitare cache inattese. Per testarlo in dev:

```env
VITE_PWA_DEV=true
```

## Deploy

Su Vercel o servizi simili:

1. Collega il repository GitHub.
2. Configura le variabili d'ambiente del progetto.
3. Esegui build con `npm run build`.

Output di produzione: `dist/`.

## Note versione 1.5.0

- **GDPR**: Aggiunte Privacy Policy e Termini di Servizio come pagine dedicate, accessibili da Home, Login e Profilo. Aggiunto checkbox di consenso obbligatorio nel form di registrazione.
- **Eliminazione account**: Aggiunto flusso di eliminazione account a doppia conferma in Profilo, con cancellazione dei dati da Supabase. Richiede le tre policy RLS di DELETE su `profiles`, `gamification` e `xp_history` (vedi CHANGELOG per le query SQL).
- **Dark Mode**: Corretti tutti i colori `#fff` hardcodati in Home, Normativa, Links, Auth e AdminNormativa. Corretto il gradient delle frecce BottomNav che mostrava un alone bianco in dark mode.
- **Grafica**: Aggiunto accento warm `--color-xp` per la gamification, animazione pulse sul pulsante Operatore e font display Sora per i titoli.
- **UX**: Aumentata la dimensione delle label BottomNav da `0.65rem` a `0.7rem`.


Progressive Web App React/Vite per consultazione rapida del Codice della Strada, prontuario, preferiti, calcolo sanzioni, news, profilo operatore e funzioni admin.

Versione corrente: **1.4.7**

## Stack

- React 19
- Vite
- Supabase Auth e database
- Vite PWA
- PostHog opzionale
- DOMPurify per sanitizzazione input HTML/testo

## Requisiti

- Node.js 20 o superiore consigliato
- Un progetto Supabase configurato con le tabelle usate dall'app

## Configurazione

1. Copia `.env.example` in `.env`.
2. Imposta le variabili Supabase:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_USE_SUPABASE=true
VITE_DEMO_MODE=false
```

La modalita' demo e' pensata solo per sviluppo locale. In produzione lascia `VITE_DEMO_MODE=false`.

## Script

```bash
npm install
npm run dev
npm run lint
npm run test:run
npm run build
npm run preview
```

## Sicurezza

- Il login reale passa da Supabase Auth.
- I ruoli admin devono essere verificati anche lato database tramite RLS/policies Supabase.
- Non committare mai file `.env` con chiavi reali.
- La chiave Supabase anon e' adatta al client solo se le policy RLS sono configurate correttamente.
- La gamification lato client aggiorna Supabase, ma per anti-abuso forte e concorrenza perfetta e' consigliata una RPC Supabase dedicata per assegnare XP.

## PWA

Il service worker PWA e' disattivato in sviluppo per evitare cache inattese. Per testarlo in dev:

```env
VITE_PWA_DEV=true
```

## Deploy

Su Vercel o servizi simili:

1. Collega il repository GitHub.
2. Configura le variabili d'ambiente del progetto.
3. Esegui build con `npm run build`.

Output di produzione: `dist/`.

## Note versione 1.4.7

- Rafforzata la gestione Supabase/Vercel: migrazione RLS per `segnalazioni` e snippet SQL admin non permissivo.
- Rimossa la cancellazione automatica delle news dal client: le news scadute vengono filtrate in lettura.
- Aggiunta validazione/sanitizzazione per profilo operatore e segnalazioni.
- Migliorata la gestione errori per note e preferiti.
- Aggiunta GitHub Action CI con lint, test e build.
- Aggiunto documento operativo `docs/TASKS_MIGLIORAMENTI.md`.
