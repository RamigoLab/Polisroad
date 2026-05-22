# 📝 CHANGELOG - PolisRoad

Tutte le modifiche significative a questo progetto saranno documentate in questo file.

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
- **MAJOR** - Cambiam incompatibili
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
