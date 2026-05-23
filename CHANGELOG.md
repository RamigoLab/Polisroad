# 📝 CHANGELOG - PolisRoad

Tutte le modifiche significative a questo progetto saranno documentate in questo file.

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

*Versione 1.4.0 — 22 Maggio 2026*
