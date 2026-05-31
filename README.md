# PolisRoad

Progressive Web App React/Vite per consultazione rapida del Codice della Strada, prontuario, preferiti, calcolo sanzioni, news, profilo operatore e funzioni admin.

Versione corrente: **1.4.6**

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

## Note versione 1.4.5

- Header blu unificato su Home, Prontuario, Normativa, Ricerca, Calcolatore, News, Links, Preferiti e Profilo.
- Nuovo componente condiviso `src/components/layout/AppHeader.jsx`, integrato in `PageWrapper`.
- Logo PolisRoad sempre disponibile nell'header per tornare alla home.
- Home mantenuta con saluto operatore e pulsante "Ricerca Rapida" a tutta larghezza.
- Dettagli Prontuario e Normativa aggiornati con header coerente e pulsante indietro.
- Modalita' Operatore e Area Admin restano volutamente con layout dedicato.
- Documentazione tecnica in `docs/IMPLEMENTAZIONE_1.4.1_HEADER_UNIFICATO.md`.
