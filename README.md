# PolisRoad

Progressive Web App React/Vite per la consultazione rapida del Codice della Strada, prontuario infrazioni, calcolo sanzioni, preferiti, news, profilo operatore e funzioni amministrative.

Versione corrente: **1.6.2**

---

## Stack

- **React 19** + **Vite 8**
- **Supabase** — autenticazione e database (RLS)
- **Vite PWA** — service worker e installazione offline
- **lucide-react** — icone SVG coerenti
- **PostHog** — analytics opzionale
- **DOMPurify** — sanitizzazione input HTML

---

## Requisiti

- Node.js 20 o superiore
- Un progetto Supabase configurato con le tabelle richieste dall'app

---

## Configurazione

1. Copia `.env.example` in `.env`.
2. Imposta le variabili d'ambiente:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_USE_SUPABASE=true
VITE_DEMO_MODE=false
```

La modalità demo è pensata solo per sviluppo locale. In produzione lascia `VITE_DEMO_MODE=false`.

Variabili opzionali:

```env
VITE_POSTHOG_KEY=phc_...
VITE_POSTHOG_HOST=https://eu.i.posthog.com
VITE_PWA_DEV=false
```

---

## Script

```bash
npm install        # installa dipendenze
npm run dev        # avvia server di sviluppo
npm run lint       # linting ESLint
npm run test:run   # esegue unit test con Vitest
npm run build      # build di produzione (dist/)
npm run preview    # anteprima del bundle produzione
```

Script di utilità dati:

```bash
npm run import:prontuario    # importa prontuario in Supabase
npm run generate:prontuario  # genera SQL prontuario
npm run convert:prontuario   # converte CSV per Supabase
```

---

## PWA

Il service worker è disattivato in sviluppo per evitare cache inattese. Per testarlo in locale:

```env
VITE_PWA_DEV=true
```

In produzione viene mostrato un popup quando è disponibile un aggiornamento con il tasto **Riavvia & Aggiorna**.

---

## Sicurezza

- Il login reale passa da Supabase Auth.
- I ruoli admin sono verificati lato database tramite RLS/policy Supabase — non solo lato client.
- Non committare mai file `.env` con chiavi reali.
- La chiave Supabase `anon` è sicura lato client solo se le policy RLS sono configurate correttamente.
- La gamification aggiorna Supabase dal client; per anti-abuso robusto è consigliata una RPC Supabase dedicata per l'assegnazione XP.
- RSS feed letti tramite Edge Function `supabase/functions/fetch-rss` con verifica ruolo admin lato server — nessuna chiamata diretta dal browser a servizi terzi.
- I `console.*` di produzione sono gestiti dal logger centralizzato `src/utils/logger.js` (silenziati in build).

---

## Deploy

Su Vercel o servizi simili:

1. Collega il repository GitHub.
2. Configura le variabili d'ambiente nel pannello del progetto.
3. Build command: `npm run build` — output: `dist/`.

---

## Struttura principale

```
src/
├── components/       # componenti riutilizzabili (Button, Icon, AppHeader…)
├── context/          # DataContext, GamificationContext
├── hooks/            # useAuth, useSearch, useTheme…
├── pages/            # schermate app (Home, Normativa, Prontuario, Profilo…)
├── utils/            # logger, rateLimiter, helpers
└── config/           # constants.js (versione, colori)
supabase/
└── functions/        # Edge Functions (fetch-rss, delete-user)
scripts/              # script Node.js per import/generazione dati
```

---

## Funzionalità principali

- **Codice della Strada** — navigazione gerarchica (Titoli › Capi › Articoli › Commi) con ricerca full-text e per numero articolo
- **Prontuario** — database infrazioni con importi, contestazione e +XP
- **Calcolatore Sanzioni** — calcolo automatico con aggravanti e attenuanti
- **Preferiti** — salvataggio e gestione articoli preferiti (Supabase)
- **News & Notifiche** — gestione editoriale admin con popup, banner e comunicazioni home
- **Gamification** — sistema XP, livelli, badge, streak giornaliero, esportazione dati GDPR
- **Profilo Operatore** — stats, badge featured, cronologia XP, eliminazione account
- **Admin Panel** — gestione prontuario, normativa, news, segnalazioni, dashboard
- **Dark Mode** — tema chiaro/scuro con persistenza e sincronizzazione `theme-color` PWA
- **Guide Pratiche** — sezione in espansione (WIP)

---

## Note versione 1.6.0 (18 Giugno 2026)

### Redesign grafico (Material 3-inspired)
- Nuovi token CSS superfici tonali (`--bg-surface-container`, `--bg-surface-container-high`)
- Font Roboto (400/500/700) al posto di Sora — coerente con il linguaggio visivo Google
- Scala raggi unificata (`--radius-sm/md/lg/pill`)
- Nuovo componente `Button.jsx` con varianti: filled, tonal, outline, text, danger
- Bottom navigation ridotta a 5 voci fisse (Home, Normativa, Prontuario, Cerca, Profilo) con indicatore "pillola" sulla voce attiva; Sidebar mantiene tutte le 10 voci
- Componente centralizzato `Icon.jsx` con icone lucide-react; emoji funzionali sostituite con SVG coerenti

### Correzioni
- **Tasto Indietro**: listener `popstate` in `App.jsx` — il tasto Indietro di browser/Android torna alla pagina precedente
- **Console log**: ~39 `console.*` in 14 file sostituiti con `src/utils/logger.js`
- **Theme-color**: `index.html` impostato a `#1a3a5c`; `useTheme.js` aggiorna il meta tag dinamicamente
- **RSS**: aggiunta Edge Function `supabase/functions/fetch-rss` con parser RSS e verifica ruolo admin lato server
- **File orfani rimossi**: `public/favicon.svg`, `public/icons.svg`, `public/manifest.json`
- **Dipendenza inutilizzata**: rimosso `react-router-dom`
- **ErrorBoundary**: colori hardcoded sostituiti con variabili CSS globali

---

*PolisRoad — sviluppato da [Ramigolab](https://ramigolab.it)*
