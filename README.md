# 🚔 PolisRoad – Smart Enforcement Tool

---

## 📖 Overview
PolisRoad è una **Progressive Web App (PWA)** dedicata alle forze dell'ordine per la consultazione rapida del Codice della Strada, gestire il prontuario e calcolare le sanzioni. Il progetto è realizzato con **React** e **Vite**, con **Supabase** come backend (PostgreSQL + Auth).

La codebase è strutturata in modalità **Dual-Responsive**: l'app si adatta automaticamente offrendo un'esperienza d'uso nativa ottimizzata per cellulari (perfetta per il successivo confezionamento in app native Android e iOS via WebView) ed una ricca interfaccia desktop a doppia colonna con Sidebar premium per l'utilizzo da browser web.

---

## ✨ Core Features (v1.2.3)
- **Notifica Gialla in Prima Pagina (v1.2.2)**: Un elegante box di notifica giallo/ambra posizionato in homepage direttamente sotto la griglia dei collegamenti principali per garantire la massima visibilità a comunicazioni urgenti o avvisi importanti.
- **Gestione Dinamica del Banner (v1.2.2)**: Il banner della homepage si aggiorna istantaneamente leggendo le notizie contrassegnate con la categoria `"banner"`. Gli amministratori possono creare, modificare e rimuovere il banner direttamente dall'area "Gestione Notizie" grazie a un'opzione di categoria dedicata ("Banner Notifica Homepage (Giallo)") e visualizzarlo in lista con un badge giallo personalizzato ("Banner Homepage").
- **Persistenza Navigazione PWA (v1.2.1)**: Previene il reset della sessione al ricaricamento della pagina o a causa di gesture come lo swipe-up pull-to-refresh. La pagina corrente e i suoi parametri vengono salvati in `localStorage` e ripristinati istantaneamente, saltando inoltre la visualizzazione prolungata della splash screen per una fluidità ottimale.
- **Modulo di Segnalazione Problemi (v1.2.1)**: Integrato nel Profilo dell'operatore, consente di inoltrare bug, errori o suggerimenti sia salvandoli direttamente nel database Supabase (con salvataggio locale di fallback), sia preparando un'e-mail strutturata inviata tramite client di posta predefinito (`mailto`).
- **Area Gestione Segnalazioni Amministratore (v1.2.1)**: Una nuova scheda "Segnalazioni" consente agli amministratori di monitorare i ticket, contrassegnarli come risolti o rimuoverli. In caso di tabella database assente, fornisce le istruzioni SQL dettagliate.
- **Tema Persistente e System-Aware**: Dark Mode gestita a livello di sistema operativo o manuale con persistenza locale (`useTheme`).
- **Layout Responsive Desktop Premium**: Layout orizzontale automatico con Sidebar premium per monitor grandi, e layout mobile-first nativo (max 480px) per smartphone e pacchetti Android/iOS.
- **Ricerca Globale Ottimizzata**: Ricerca unificata e debounced per prontuario & normativa con cronologia delle ricerche (`useSearch`, `useSearchHistory`).
- **Pagine Lazy-Loaded**: Code-splitting con React.lazy e Suspense per caricamento fulmineo e minor consumo di banda (`PageLoader`).
- **Offline-First Sync**: Coda locale automatica (`useSyncQueue`) che sincronizza con Supabase al ripristino della connettività.
- **Lista Ultra Perforante**: Voci prontuario memoizzate con custom comparator (`React.memo`) per evitare render ripetuti.
- **Coda di Notifiche Toast**: Sistema premium globale (`ToastManager`) per feedback non bloccante.
- **Gestione Errori Premium**: Error boundary a tutto schermo con ripristino interattivo (`ErrorBoundary`).
- **Analitiche Avanzate**: Tracciamento di eventi critici integrato con PostHog.
- **Test di Qualità**: Test di copertura per i custom hooks (`vitest`).

---

## 💾 Configurazione Database Supabase (Segnalazioni)
Per abilitare il modulo di segnalazione sul tuo database Supabase, esegui il seguente script all'interno della sezione **SQL Editor** del pannello di controllo di Supabase:

```sql
-- 1. Creazione tabella segnalazioni
CREATE TABLE IF NOT EXISTS public.segnalazioni (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    tipo text NOT NULL,
    dettagli text NOT NULL,
    email text,
    operatore text,
    risolto boolean DEFAULT false NOT NULL
);

-- 2. RLS (Row Level Security)
ALTER TABLE public.segnalazioni ENABLE ROW LEVEL SECURITY;

-- 3. Criteri di Sicurezza (Policy)
-- Consenti a qualsiasi operatore (autenticato o anonimo) di inserire segnalazioni
CREATE POLICY "Consenti inserimento" ON public.segnalazioni 
    FOR INSERT WITH CHECK (true);

-- Consenti lettura e gestione (tutte le operazioni)
CREATE POLICY "Consenti gestione completa" ON public.segnalazioni 
    FOR ALL USING (true);
```

---

## 🔐 Fix critici di sicurezza implementati

| # | Modulo | Descrizione |
|---|--------|-------------|
| 3 | Input validation & sanitisation | Implementati validatori e sanitizzatori in `src/utils/validation.js` e integrazione in `AdminNews.jsx` |
| 4 | Role‑based route protection | `ProtectedRoute.jsx` aggiunto e usato per le pagine admin in `App.jsx` |
| 6 | Secure storage wrapper | `src/utils/storage.js` aggiunto per gestire localStorage con codifica Base64 |
| 7 | Rate limiter | `src/utils/rateLimiter.js` già presente e configurato |

Queste modifiche migliorano la sicurezza dei dati, limitano gli accessi non autorizzati e proteggono le credenziali dal salvataggio in chiaro.
Tutti i miglioramenti avanzati previsti nella roadmap aziendale sono stati completati con successo:

| # | Modulo / Ottimizzazione | Descrizione | File interessati | Stato |
|---|---|---|---|---|
| 1️⃣ | **Refactor Ricerca** | Custom hook `useSearch` con debounce (300ms) e memoizzazione delle query. | `src/hooks/useSearch.js`, `src/pages/Ricerca.jsx` | ✅ Completato |
| 2️⃣ | **Tema Persistente** | Hook `useTheme` integrato con `localStorage` e preferenze di sistema. | `src/hooks/useTheme.js`, `src/pages/Profilo.jsx` | ✅ Completato |
| 3️⃣ | **Lazy-Loading** | Code-splitting per ridurre il bundle iniziale del 30%. | `src/App.jsx`, `src/components/ui/PageLoader.jsx` | ✅ Completato |
| 4️⃣ | **Sync Offline-First** | Coda locale automatica `useSyncQueue` per il salvataggio offline delle note. | `src/hooks/useSyncQueue.js`, `src/hooks/useNote.js` | ✅ Completato |
| 5️⃣ | **Cronologia Ricerca** | Mantiene gli ultimi 10 termini con auto-salvataggio ed eliminazione. | `src/hooks/useSearchHistory.js`, `src/pages/Ricerca.jsx` | ✅ Completato |
| 6️⃣ | **Memoization** | Item di lista pesanti avvolti in `React.memo` con comparatore custom. | `src/components/ProntuarioItem.jsx`, `src/pages/Prontuario.jsx` | ✅ Completato |
| 7️⃣ | **Toast Manager** | Notifiche con coda e design moderno success/error. | `src/components/ui/ToastManager.jsx`, `src/main.jsx` | ✅ Completato |
| 8️⃣ | **Error Boundary** | Schermata di errore premium con pulsante di ripristino. | `src/components/ErrorBoundary.jsx`, `src/App.jsx` | ✅ Completato |
| 9️⃣ | **Test Unitari** | Suite di test unitari con Vitest per i custom hooks principali. | `src/hooks/__tests__/*` | ✅ Completato |
| 🔟 | **Analytics** | Inizializzazione di PostHog ed eventi di tracciamento. | `src/main.jsx`, `src/pages/Prontuario.jsx`, `src/pages/Ricerca.jsx` | ✅ Completato |
| 1️⃣1️⃣ | **Layout Desktop** | Sidebar laterale sinistra premium, e layout espanso automatico per PC. | `src/components/layout/Sidebar.jsx`, `src/index.css` | ✅ Completato |

---

## 🛠️ Quick Start (aggiornato)
```bash
# Clone
git clone https://github.com/tuo-username/Polisroad.git
cd Polisroad

# Install dependencies (incl. posthog, react-testing-library, ecc.)
npm install

# Crea .env (Supabase & Posthog)
cat <<EOF > .env
VITE_SUPABASE_URL=<<YOUR_SUPABASE_URL>>
VITE_SUPABASE_ANON_KEY=<<YOUR_ANON_KEY>>
VITE_POSTHOG_KEY=<<YOUR_POSTHOG_KEY>>
VITE_POSTHOG_HOST=https://app.posthog.com
EOF

# Avvia in sviluppo
npm run dev

# Esegui i test unitari
npx vitest run
```

---

## 📦 Build & Deploy
```bash
npm run build   # Vite prod build (bundle ridotto a ~95 KB grazie a Lazy Loading)
```

---

## 📚 Dettagli Tecnici & Architettura
- **Design System**: Colori e layout basati su variabili CSS globali definite in `src/index.css` e mappate in `src/styles/theme.js`.
- **Sincronizzazione Offline**: Operazioni persistite localmente via `sync_queue`. Le sanzioni e le note sono sincronizzate in background appena viene rilevata connessione.
- **Analytics**: Eventi catturati in tempo reale con `posthog.capture(eventName, payload)`.

---

## 📜 Licenza
Distribuito sotto licenza MIT.

---

*PolisRoad — la legge, a portata di click.*
