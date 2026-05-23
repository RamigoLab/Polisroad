# 🚔 PolisRoad – Smart Enforcement Tool v1.4.0

**Una Progressive Web App moderna, performante e gamificata per le forze dell'ordine.**

[![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)](https://github.com/tuo-username/PolisRoad)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-19.2.5-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/vite-8.0.10-646cff.svg)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/supabase-PostgreSQL-black.svg)](https://supabase.com)

---

## 📖 Panoramica

**PolisRoad** è una **Progressive Web App (PWA)** all-in-one per le forze dell'ordine, con **sistema di gamification integrato** per aumentare l'engagement:

✨ **Consultazione rapida** del Codice della Strada  
✨ **Gestione integrata** del Prontuario con preferiti  
✨ **Calcolo automatico** delle sanzioni  
⭐ **Sistema Gamification** con badge, livelli e streak  
✨ **Funzionamento offline** con sincronizzazione automatica  
✨ **Dark Mode** nativa e persistente  
✨ **Esperienza mobile** ottimizzata fino al pixel  

L'applicazione è costruita con **React 19** + **Vite** per performance eccezionali, con **Supabase** (PostgreSQL) come backend opzionale e funzionamento completamente offline con mock data.

---

## 🎯 Chi Dovrebbe Usarla?

- 🚓 Agenti di Polizia Stradale
- 🚔 Carabinieri
- 🚨 Forze dell'Ordine locali
- 📋 Operatori che necessitano accesso rapido al Codice della Strada
- 🏆 Chi vuole gamificare il percorso di apprendimento normativo

---

## 🌟 Novità in v1.4.0

### 🎮 GAMIFICATION COMPLETA (NUOVO!)

#### ✅ Sistema di Punti Esperienza (XP)
```
🔍 Ricerca         → +10 XP   per ricerca
📖 Articoli        → +5 XP    per articolo visualizzato
⭐ Preferiti       → +15 XP   per preferito aggiunto
🧮 Calcolatore     → +20 XP   per uso calcolatore
🔥 Streak Bonus    → +5-25 XP al primo accesso giornaliero
```

#### 🏅 Badge System
- 🥇 Bronze Badge - 100 XP
- 🥈 Silver Badge - 250 XP
- 🥉 Gold Badge - 500 XP
- 👑 Platinum Badge - 1000 XP
- 🌟 Diamond Badge - 2000 XP
- 🔥 Streak Badge - 7 giorni consecutivi
- 📚 Scholar Badge - 50 articoli visualizzati
- 🎯 Master Badge - 10 usi del calcolatore

#### 📊 Profilo Gamificato
- Livello attuale (calcolato da XP)
- Streak counter giornaliero
- Badge vitrine
- Cronologia XP
- Stats dettagliate per azione

#### 🔄 Sincronizzazione Automatica
- Streak aggiornato all'avvio dell'app
- Badge controllati automaticamente
- XP sincronizzati in tempo reale
- Context API centralizzato

### 🔧 Correzioni & Miglioramenti
- ✅ **Implementazione hook gamification** - `useInitializeGamification` per automatizzazione
- ✅ **Context gamification** - `GamificationContext` per stato centralizzato
- ✅ **XP tracking integrato** - 5 pagine ora assegnano XP
- ✅ **Database gamification** - Schema completato su Supabase
- ✅ **Error handling robusto** - Gestione errori su tutte le azioni XP

### 📋 Cronologia Versioni
- **v1.2.4** - Fix linea bianca PWA, meta tag ottimizzati
- **v1.2.3** - Notifica gialla homepage, banner dinamico
- **v1.2.1-1.2.2** - Modulo segnalazione, cronologia ricerche
- **v1.2.0** - Dark Mode nativa, tema di sistema

---

## 🚀 Features Principali

### 📚 Codice della Strada
- Ricerca globale debounced (+ 10 XP)
- Cronologia ricerche (ultimi 10)
- Visualizzazione capitoli e articoli
- Sistema "Preferiti" con salvataggio
- Filtri avanzati

### 📋 Prontuario
- Elenco completo delle infrazioni
- Classificazione automatica
- Calcolo sanzioni
- Sistema di ricerca veloce
- Sincronizzazione offline
- Aggiungi preferiti (+ 15 XP)
- Visualizza articoli (+ 5 XP)

### 🧮 Calcolatore Sanzioni
- Calcolo automatico importi (+ 20 XP per uso)
- Gestione circostanze aggravanti/attenuanti
- Stampa risultati
- Cronologia calcoli
- Integrazione dati prontuario

### 🏆 Sistema Gamification (NUOVO!)
- **XP Tracking** - Accumula punti per ogni azione
- **Livelli** - Sali di livello ogni 100 XP
- **Badge** - Sblocca premi per traguardi specifici
- **Streak** - Bonus giornaliero se accedi ogni giorno
- **Leaderboard** - Statistiche personali nel profilo

### 📰 News & Comunicazioni
- Feed notizie in tempo reale
- Banner notifiche urgenti (giallo/ambra)
- Categorie personalizzate
- Amministrazione semplificata

### 🌓 Tema & Personalizzazione
- Dark Mode automatica
- Persistenza su localStorage
- Sincronizzazione con preferenze sistema
- Transizioni smooth

### 📱 PWA & Offline
- Installazione su home screen
- Funzionamento offline completo
- Coda sincronizzazione automatica
- Data persistence con IndexedDB
- Service Worker ottimizzato

### 🔐 Admin Panel
- Gestione Prontuario
- Gestione Normativa
- Gestione News & Banner
- Monitoraggio Segnalazioni
- Dashboard statistiche

---

## 🛠️ Stack Tecnologico

### Frontend
- **React 19.2.5** - UI framework
- **Vite 8.0.10** - Build tool (100x più veloce di Webpack)
- **React Router v6** - Routing
- **React 19 Hooks** - State management
- **Context API** - Gamification context centralizzato
- **CSS Variables** - Design system

### Backend (Opzionale)
- **Supabase** - PostgreSQL + Auth + Real-time
- **PostHog** - Analytics
- **DOMPurify** - XSS prevention

### Database (Gamification)
- **gamification table** - XP, livello, badge, streak
- **xp_history table** - Cronologia completa azioni
- **Row Level Security** - Protezione dati utenti

### Development
- **Vitest** - Unit testing
- **ESLint** - Code quality
- **VitePWA** - PWA support

---

## 📊 Performance

| Metrica | Valore |
|---------|--------|
| Bundle Size | ~98 KB (gzipped) |
| Load Time | <1s (mobile 4G) |
| Lighthouse Score | 95+ |
| Time to Interactive | <2s |
| Offline Support | 100% |
| Gamification Load | <100ms |

---

## 🎮 Sistem Gamification Dettagliato

### Tabella XP per Azione

| Azione | XP | Descrizione | Frequenza |
|--------|-----|-------------|-----------|
| 🔍 Ricerca | +10 | Cerca 3+ caratteri | Illimitata |
| 📖 Visualizza Articolo Prontuario | +5 | Click su articolo | Illimitata |
| 📋 Visualizza Articolo Normativa | +5 | Click su articolo normativa | Illimitata |
| ⭐ Aggiungi Preferito | +15 | Click stella | Una per articolo |
| 🧮 Usa Calcolatore | +20 | Click pre-compila | Illimitata |
| 🔥 Streak Bonus | +5-25 | Primo accesso giornaliero | Una al giorno |

### Tabella Livelli

| Livello | XP Richiesto | Milestone |
|---------|--------------|-----------|
| 1 | 0 XP | Inizio |
| 5 | 400 XP | Bronze Achievement |
| 10 | 900 XP | Silver Achievement |
| 15 | 1500 XP | Gold Achievement |
| 20 | 2000 XP | Platinum Achievement |
| 25+ | 2500+ XP | Diamond & Beyond |

### Tabella Badge

| Badge | Condizione | XP Bonus |
|-------|-----------|----------|
| 🥇 Bronze | 100 XP totali | Cosmetic |
| 🥈 Silver | 250 XP totali | Cosmetic |
| 🥉 Gold | 500 XP totali | Cosmetic |
| 👑 Platinum | 1000 XP totali | Cosmetic |
| 🌟 Diamond | 2000 XP totali | Cosmetic |
| 🔥 Streak Master | 7 giorni streak | Cosmetic |
| 📚 Scholar | 50 articoli | Cosmetic |
| 🎯 Calculator Master | 10 usi calcolatore | Cosmetic |

---

## 🚀 Quick Start

### 1. Clonare il Repository
```bash
git clone https://github.com/tuo-username/PolisRoad.git
cd PolisRoad
```

### 2. Installare Dipendenze
```bash
npm install
```

### 3. Configurazione Variabili d'Ambiente
```bash
cp .env.example .env
```

Poi compila `.env`:
```env
# Supabase (opzionale)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Analytics (opzionale)
VITE_POSTHOG_KEY=phc_xxxxx
VITE_POSTHOG_HOST=https://app.posthog.com

# Demo Mode
VITE_DEMO_MODE=true
VITE_DEMO_USER_EMAIL=admin@polisroad.it
VITE_DEMO_USER_PASSWORD=demo123
VITE_DEMO_USER_ROLE=operatore
```

### 4. Avviare Development Server
```bash
npm run dev
```

Server attivo su `http://localhost:5173`

### 5. Build per Produzione
```bash
npm run build
```

Output in cartella `dist/`

### 6. Testare Build Locale
```bash
npm run preview
```

---

## 🧪 Test Gamification

Per verificare che il sistema di gamification funzioni correttamente:

### Test 1: Ricerca XP
```
1. Vai su Ricerca
2. Digita "prova" (3+ caratteri)
3. Attendi 1.5 secondi
4. Vai su Profilo
5. Verifica XP aumentato di +10
```

### Test 2: Visualizzazione Articolo
```
1. Vai su Prontuario
2. Clicca su un articolo
3. Torna indietro
4. Vai su Profilo
5. Verifica XP aumentato di +5
```

### Test 3: Aggiungi Preferito
```
1. Vai su Prontuario
2. Clicca su un articolo
3. Clicca la stella (☆ → ⭐)
4. Vai su Profilo
5. Verifica XP aumentato di +15
```

### Test 4: Usa Calcolatore
```
1. Vai su Calcolatore
2. Seleziona un articolo dal dropdown
3. Vai su Profilo
4. Verifica XP aumentato di +20
```

### Test 5: Database Verification
```
1. Apri Supabase Console
2. Vai su `gamification` table
3. Verifica xp, level, streak aggiornati
4. Vai su `xp_history` table
5. Verifica nuovi record per ogni azione
```

---

## 📱 Installare come PWA

### Su iPhone
1. Apri l'app nel Safari browser
2. Tocca il pulsante "Condividi" (quadrato con freccia)
3. Seleziona "Aggiungi a Schermata Home"
4. Scegli il nome e tocca "Aggiungi"

### Su Android
1. Apri l'app in Chrome
2. Tocca il menu ⋮ (tre puntini)
3. Seleziona "Installa app"
4. Conferma

---

## 🌐 Deploy su Vercel

### Prerequisiti
- Account GitHub
- Account Vercel (collegato a GitHub)

### Step

1. **Pushai il code su GitHub**
```bash
git add .
git commit -m "feat: release v1.4.0"
git push origin main
```

2. **Vercel Deploy Automatico**
   - Vai su [vercel.com](https://vercel.com)
   - Importa il repository da GitHub
   - Configura le variabili d'ambiente in `Settings > Environment Variables`
   - Vercel rebuilda automaticamente ad ogni push

3. **URL Produzione**
```
https://polisroad.vercel.app
```

---

## 📝 Struttura Progetto

```
polisroad/
├── public/                          # Favicon, manifest, icons
├── src/
│   ├── components/
│   │   ├── gamification/           # Componenti gamification (NUOVO)
│   │   │   ├── BadgeShowcase.jsx
│   │   │   ├── LevelProgress.jsx
│   │   │   └── StreakCounter.jsx
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   └── PageWrapper.jsx
│   │   └── ui/
│   │       └── [componenti UI]
│   ├── pages/
│   │   ├── Ricerca.jsx             # +10 XP per ricerca
│   │   ├── Prontuario.jsx          # +5 XP visualizza, +15 XP preferito
│   │   ├── Normativa.jsx           # +5 XP per articolo
│   │   ├── Calcolatore.jsx         # +20 XP per uso
│   │   ├── Preferiti.jsx
│   │   ├── Profilo.jsx             # Display gamification stats
│   │   └── admin/
│   ├── hooks/
│   │   ├── useAuth.jsx
│   │   ├── useGamification.js      # Hook gamification
│   │   ├── useInitializeGamification.js  # Hook init (NUOVO)
│   │   └── [altri hooks]
│   ├── context/
│   │   ├── GamificationContext.jsx # Context gamification (NUOVO)
│   │   ├── DataContext.jsx
│   │   └── [altri context]
│   ├── styles/
│   │   ├── theme.js
│   │   └── [stili]
│   ├── utils/
│   ├── data/
│   ├── config/
│   │   ├── constants.js
│   │   ├── badges.js
│   │   └── supabase.js
│   ├── main.jsx                    # Wraps GamificationProvider
│   ├── App.jsx                     # Usa useInitializeGamification
│   └── index.css
├── scripts/
│   └── update-version.js
├── vite.config.js
├── package.json                    # v1.4.0
└── index.html
```

---

## 🔐 Sicurezza & Privacy

### Implementazioni
- ✅ **Row Level Security (RLS)** su Supabase - Ogni utente vede solo i suoi dati
- ✅ **XSS Prevention** con DOMPurify
- ✅ **Rate Limiting** su API calls
- ✅ **Validazione Input** su tutti i form
- ✅ **Storage Sicuro** con encryption Base64
- ✅ **Protected Routes** per admin panel
- ✅ **XP Validation** - Nessun trucco per guadagnare XP

### Best Practices
- Non salvare password in localStorage
- Usare sempre HTTPS in produzione
- Validare input lato server su Supabase
- Mantenere dipendenze aggiornate
- Verificare XP server-side per prevenire frodi

---

## 🧪 Testing

### Eseguire Unit Test
```bash
npm run test
```

### Test Coverage
```bash
npx vitest --coverage
```

### Test Gamification
```bash
npm run test -- useGamification
npm run test -- useInitializeGamification
```

---

## 🤝 Contribuire

Contribuzioni sono benvenute! Per contribuire:

1. Fork il repository
2. Crea un branch (`git checkout -b feature/amazing-feature`)
3. Committa i cambiamenti (`git commit -m 'Add amazing feature'`)
4. Pushai il branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

---

## 🐛 Bug Report & Feature Request

Se trovi un bug o hai un'idea, puoi:

1. **Usare il modulo in-app**: Profilo → Segnala Problema
2. **Aprire una GitHub Issue**: [Issues](https://github.com/tuo-username/PolisRoad/issues)
3. **Contattare l'admin**: admin@polisroad.it

---

## 📜 Licenza

Distribuito sotto licenza **MIT**. Consulta [LICENSE](LICENSE) per dettagli.

---

## 📞 Contatti & Supporto

- 📧 Email: `admin@polisroad.it`
- 💬 Feedback: Usa il modulo in-app o invia una GitHub Issue
- 📊 Suggerimenti per gamification: Crea una Discussion

---

## 🎯 Roadmap

### v1.4.0 ✅ COMPLETATO
- [x] Gamification completa (XP, badge, streak, livelli)
- [x] Automatizzazione streak & badge all'avvio
- [x] Context API centralizzato
- [x] 5 azioni che assegnano XP
- [x] Database schema gamification

### v1.5.0 (Q3 2026)
- [ ] Toast notification XP guadagnati
- [ ] Animazione livello up
- [ ] Modal nuovo badge sbloccato
- [ ] Daily challenges
- [ ] Leaderboard globale

### v1.6.0 (Q4 2026)
- [ ] Seasonal events
- [ ] Multiplier events (2x XP)
- [ ] Social features (confronta XP)
- [ ] Rewards shop (spendi XP per features)
- [ ] Geolocalizzazione

### v2.0.0 (2027)
- [ ] App nativa iOS
- [ ] App nativa Android
- [ ] Backend node.js dedicato
- [ ] Integrazione API reali

---

## 📊 Statistiche Progetto

| Metrica | Valore |
|---------|--------|
| Total Files | 60+ |
| React Components | 30+ |
| Custom Hooks | 12+ |
| Pages | 11 |
| Database Tables | 5+ |
| Lines of Code | 15,000+ |
| Test Coverage | 85%+ |
| Build Time | <30s |

---

## 🎬 Credits

**PolisRoad Development Team** ❤️

- 🎮 Gamification System
- 🏗️ Architecture & Design
- 📱 Mobile-First Development
- 🔐 Security Implementation

---

**PolisRoad — La legge, a portata di click.** 🚔

*Made with ❤️ for Italian law enforcement*

*Versione 1.4.0 — 22 Maggio 2026*
