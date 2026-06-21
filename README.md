# PolisRoad

Progressive Web App React/Vite per la consultazione rapida del Codice della Strada, prontuario infrazioni, calcolo sanzioni, preferiti, news, profilo operatore e funzioni amministrative.

Versione corrente: **1.6.8**

---

## Stack

- **React 19** + **Vite 8**
- **Supabase** — autenticazione e database (RLS)
- **Vite PWA** — service worker e installazione offline
- **lucide-react** — icone SVG coerenti
- **PostHog EU Cloud** — analytics (attivo di default, disattivabile dal Profilo)
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
```

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
- RSS feed letti tramite Edge Function `supabase/functions/fetch-rss` con verifica ruolo admin lato server — nessuna chiamata diretta dal browser a servizi terzi.
- I `console.*` di produzione sono gestiti dal logger centralizzato `src/utils/logger.js` (silenziati in build).
- Stack trace degli errori visibili solo in sviluppo (`import.meta.env.DEV`), nascosti in produzione.

---

## Deploy

Su Vercel (configurazione inclusa in `vercel.json` con header CSP, HSTS, CORS):

1. Collega il repository GitHub.
2. Configura le variabili d'ambiente nel pannello del progetto.
3. Build command: `npm run build` — output: `dist/`.

---

## Struttura principale

```
src/
├── components/       # componenti riutilizzabili (Icon, AppHeader, ProntuarioItem…)
│   ├── gamification/ # BadgeShowcase, LevelProgress, StreakCounter
│   ├── layout/       # AppHeader, BottomNav, PageWrapper, Sidebar, Splash
│   └── ui/           # Badge, Icon, SearchBar, TextInput, TextArea, ToastManager…
├── context/          # DataContext, GamificationContext
├── hooks/            # useAuth, useSearch, useNormativa, useProntuario, useTheme…
├── pages/            # schermate app
│   └── admin/        # AdminDashboard, AdminNews, AdminNormativa, AdminProntuario…
├── styles/           # theme.js, styles.js, layout.js, pages.js, ui.js
├── utils/            # logger, rateLimiter, storage, validation
└── config/           # constants.js, badges.js, navigation.js, supabase.js
supabase/
├── functions/        # Edge Functions (fetch-rss, delete-user)
└── migrations/       # migrazioni SQL con RLS e policy
scripts/              # script Node.js per import/generazione dati
```

---

## Funzionalità principali

### Consultazione
- **Codice della Strada** — navigazione gerarchica (Titoli › Capi › Articoli › Commi) con ricerca full-text e per numero articolo
- **Prontuario** — database infrazioni raggruppato per articolo, con importi, note personali, preferiti e registrazione contestazioni
- **Calcolatore Sanzioni** — calcolo automatico con aggravanti e attenuanti
- **Ricerca Globale** — ricerca simultanea su Prontuario e Normativa con risultati raggruppati per articolo e priorità: corrispondenza esatta prima, poi occorrenze in altri articoli

### Operativa
- **Modalità Operatore** — interfaccia semplificata per uso sul campo: preferiti in evidenza, ricerca rapida, dettaglio sanzione espandibile inline, registrazione contestazione con un tap
- **Preferiti** — salvataggio e gestione articoli preferiti sincronizzati su Supabase

### Profilo & Gamification
- **Profilo Operatore** — grado, forza di appartenenza, stats, badge featured, cronologia XP, esportazione dati GDPR, eliminazione account
- **Sistema XP e Livelli** — punti esperienza per ricerche, articoli, preferiti, contestazioni, streak giornaliero
- **Badge** — traguardi sbloccabili automaticamente (Bronze → Diamond, Streak Master, Scholar…)
- **Streak giornaliero** — bonus XP per accessi consecutivi

### News & Comunicazioni
- **News** — feed editoriale con filtro categorie, aggiornamento RSS tramite Edge Function
- **Notifiche Home** — banner e popup gestibili dall'admin

### Amministrazione
- **Area Amministrativa** — dashboard con stats, gestione utenti, segnalazioni, news, prontuario e normativa
- **Gestione Prontuario** — voci raggruppate per articolo, modifica e aggiunta inline senza navigare tra schermate
- **Gestione Normativa** — articoli espandibili con modifica intestazione e commi individuali inline
- **Gestione Utenti** — modifica profili, promozione/revoca ruolo admin

### PWA & Offline
- **Offline Mode** — funzionamento completo senza connessione, con sync queue per le azioni in attesa
- **Dark Mode** — tema chiaro/scuro con persistenza e sincronizzazione `theme-color` PWA
- **Guide Pratiche** — sezione in espansione (WIP)

---

## Note versione 1.6.8 (21 Giugno 2026)

### Ricerca globale — risultati raggruppati e prioritizzati
- Cercando un numero di articolo (es. `186`) viene mostrato prima il contenitore **Art. 186** con tutte le casistiche (Prontuario) o tutti i commi (Normativa), espandibile inline.
- Sotto, in sezione "Anche in altri articoli", gli eventuali articoli che contengono il termine nel testo.
- Stessa UX dei contenitori espandibili già presenti in Modalità Operatore e Area Amministrativa.

### Code audit
- **Bug**: `useInitializeGamification` istanziava `useGamification` direttamente, creando una seconda connessione Supabase parallela a quella del context. Risolto: usa ora `useGamificationContext`.
- **Performance**: rimosso fetch Supabase inutile in `addXP` — ogni azione XP generava 2 chiamate invece di 1.
- **Dead code**: rimosso alias `salvaNota` duplicato in `useNote`, rimossi 4 stili orfani da `styles.js`.

### Documenti legali aggiornati
- Privacy Policy e Termini di Servizio allineati al comportamento reale di PostHog (attivo di default, opt-out dal Profilo), rimossa clausola foro competente non applicabile ai consumatori, aggiunta sezione Analytics nei Termini.

---

*PolisRoad — sviluppato da [Ramigolab](https://ramigolab.it)*
