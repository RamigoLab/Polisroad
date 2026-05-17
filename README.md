# 🚔 **PolisRoad — Smart Enforcement Tool**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3EC988?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-Professional_Release-blue?style=for-the-badge)](https://github.com/)

**PolisRoad** è una Progressive Web App (PWA) d'avanguardia progettata per supportare le Forze dell'Ordine nella gestione del Codice della Strada, con un'interfaccia premium, veloce e mobile‑first.

---

## ✨ Funzionalità Chiave

### 🚨 Modalità Operatore (Dark Mode)
- **Dark Mode** integrata a livello di CSS con variabili (`:root` / `[data‑theme="dark"]`).
- Interruttore nell'**area Impostazioni Aspetto** della pagina Profilo; la preferenza è salvata in `localStorage` e applicata prima del rendering per evitare flash bianco.
- Design a contrasto elevato, ottimizzato per l'uso notturno.

### 📋 Prontuario & Normativa
- **Ricerca intelligente** (debounce a 300 ms) per evitare ricaricamenti ad ogni tasto.
- **Filtraggio memoizzato** con `useMemo` per performance fluide.
- **Grouping articolo/commi** nella pagina Normativa; visualizzazione di tutti i commi di un articolo in un unico blocco.
- **Note operative**: ora il hook `useNote` espone `save` (alias di `salvaNota`) per coerenza con l'uso in `Prontuario.jsx`. È mantenuta anche `salvaNota` per retro‑compatibilità.
- **Loading / error handling** migliorati in `DataContext.jsx`: messaggi user‑friendly per errori di rete, policy RLS, tabelle mancanti, ecc.

### ⚙️ Backend & Sync
- **Supabase pagination fix**: la nuova funzione `fetchAllRows` legge i dati a blocchi da 1000 righe usando `.range()`, garantendo il recupero di tutti i > 1000 record (es. 240 articoli del Codice della Strada).
- **RLS Policies** consigliate (SQL fornito nella documentazione) per garantire lettura sicura delle tabelle `note`, `prontuario`, `codice_strada`, ecc.

### 📱 PWA & UX
- Installabile su smartphone, splash screen personalizzato.
- Animazioni di transizione, micro‑interazioni su pulsanti, focus‑visible per accessibilità.
- Layout responsive da 320 px a 480 px con design system centralizzato (`src/styles/*`).

---

## 🛠️ Stack Tecnologico
- **Frontend**: React 18 + Hooks personalizzati (`useNote`, `useDebounce`, `useProntuario`, ecc.).
- **Build**: Vite (rapid hot‑module reload).
- **Styling**: Design System in Vanilla JS (`theme.js`, `pages.js`, `styles.js`).
- **Backend/DB**: Supabase (PostgreSQL + Auth).
- **Icons**: Material Design + custom branding.

---

## 🚀 Installazione Locale

```bash
# 1. Clona il repository
git clone https://github.com/tuo-username/polisroad.git
cd polisroad

# 2. Installa le dipendenze
npm install

# 3. Configura le credenziali Supabase
#    Crea un file .env nella root con:
#    VITE_SUPABASE_URL=your_url
#    VITE_SUPABASE_ANON_KEY=your_key

# 4. Avvia in modalità sviluppo
npm run dev
```

---

## 📸 Design & UX
- **Glassmorphism** con sfondi semi‑trasparenti e ombre morbide.
- **Palette premium** (primary, accent, success, danger, warning) gestita tramite CSS variables per supportare Light & Dark mode.
- **Responsive Grid** per Home, Prontuario, Normativa e Calcolatore.

---

## 🤝 Contatti & Supporto
Sviluppato per aumentare l’efficienza operativa delle Forze dell’Ordine. Per segnalazioni, bug o richieste di funzionalità apri una *issue* su GitHub.

---

*PolisRoad — La legge, a portata di click.*
