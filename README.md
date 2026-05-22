# 🚔 PolisRoad – Smart Enforcement Tool v1.2.5

**Una Progressive Web App moderna e performante per le forze dell'ordine.**

[![Version](https://img.shields.io/badge/version-1.2.5-blue.svg)](https://github.com/tuo-username/PolisRoad)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-19.2.5-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/vite-8.0.10-646cff.svg)](https://vitejs.dev)

---

## 📖 Panoramica

**PolisRoad** è una **Progressive Web App (PWA)** all-in-one per le forze dell'ordine, che consente:

✨ **Consultazione rapida** del Codice della Strada  
✨ **Gestione integrata** del Prontuario  
✨ **Calcolo automatico** delle sanzioni  
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

---

## 🌟 Novità in v1.2.5

### 🔧 Correzioni & Miglioramenti
- ✅ **Fix Layout Desktop (Profilo)** - Risolto bug responsività del pulsante "Modifica Profilo" che veniva tagliato su schermi molto ampi a causa dello shrink flexbox.
- ✅ **Fix Pannello Admin** - Corretto sistema di navigazione e accesso autorizzato per gli amministratori

### 📋 v1.2.4
- Fix grafica mobile PWA (eliminata linea bianca)
- Sincronizzazione versione automatica con script di build
- Meta tag ottimizzati
- Viewport fit cover

### 📋 v1.2.3
- Notifica gialla in homepage
- Gestione dinamica del banner
- Persistenza navigazione PWA

### v1.2.1-1.2.2
- Modulo segnalazione problemi
- Cronologia ricerche
- Area gestione segnalazioni admin

---

## 🚀 Features Principali

### 📚 Codice della Strada
- Ricerca globale debounced
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

### 🧮 Calcolatore Sanzioni
- Calcolo automatico importi
- Gestione circostanze aggravanti/attenuanti
- Stampa risultati
- Cronologia calcoli

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
- **CSS Variables** - Design system

### Backend (Opzionale)
- **Supabase** - PostgreSQL + Auth + Real-time
- **PostHog** - Analytics
- **DOMPurify** - XSS prevention

### Development
- **Vitest** - Unit testing
- **ESLint** - Code quality
- **VitePWA** - PWA support

---

## 📊 Performance

| Metrica | Valore |
|---------|--------|
| Bundle Size | ~95 KB (gzipped) |
| Load Time | <1s (mobile 4G) |
| Lighthouse Score | 95+ |
| Time to Interactive | <2s |
| Offline Support | 100% |

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
git commit -m "feat: release v1.2.4"
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
├── public/               # Favicon, manifest, icons
├── src/
│   ├── components/       # Componenti React riutilizzabili
│   │   ├── layout/       # Layout (Sidebar, BottomNav, etc.)
│   │   └── ui/           # UI components (Button, Card, etc.)
│   ├── pages/            # Pagine dell'app
│   │   └── admin/        # Admin panel pages
│   ├── hooks/            # Custom React hooks
│   │   └── __tests__/    # Unit tests
│   ├── context/          # Context API (DataProvider, etc.)
│   ├── styles/           # Style objects (theme, pages, etc.)
│   ├── utils/            # Utility functions
│   ├── data/             # Mock data (offline fallback)
│   ├── config/           # Configuration (Supabase, constants)
│   ├── main.jsx          # Entry point
│   ├── App.jsx           # Root component
│   └── index.css         # Global styles
├── scripts/              # Build scripts
│   └── update-version.js # Versioning auto-sync
├── vite.config.js        # Vite configuration
├── package.json          # Dependencies & scripts
└── index.html            # HTML template
```

---

## 🔐 Sicurezza

### Implementazioni
- ✅ **Row Level Security (RLS)** su Supabase
- ✅ **XSS Prevention** con DOMPurify
- ✅ **Rate Limiting** su API calls
- ✅ **Validazione Input** su tutti i form
- ✅ **Storage Sicuro** con encryption Base64
- ✅ **Protected Routes** per admin panel

### Best Practices
- Non salvare password in localStorage
- Usare sempre HTTPS in produzione
- Validare input lato server su Supabase
- Mantenere dipendenze aggiornate

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

---

## 🎯 Roadmap

### v1.2.5 (Q3 2026)
- [ ] Geolocalizzazione
- [ ] Fotocamera per sanzioni
- [ ] Firma digitale
- [ ] Export PDF

### v1.3.0 (Q4 2026)
- [ ] Integrazione GPS reale
- [ ] Notifiche push reali
- [ ] Sistema di appelli
- [ ] Dashboard analytics

### v2.0.0 (2027)
- [ ] App nativa iOS
- [ ] App nativa Android
- [ ] Backend node.js dedicato

---

**PolisRoad — La legge, a portata di click.** 🚔

*Made with ❤️ for Italian law enforcement*
