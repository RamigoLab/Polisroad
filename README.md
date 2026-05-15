# 🚔 PolisRoad — Smart Enforcement Tool

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3EC988?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-Professional_Release-blue?style=for-the-badge)](https://github.com/)

**PolisRoad** è una Progressive Web App (PWA) d'avanguardia progettata per supportare le Forze dell'Ordine nell'attività quotidiana di controllo stradale. Offre accesso istantaneo al Codice della Strada, un prontuario operativo digitale e strumenti di calcolo avanzati, il tutto con un'interfaccia premium ottimizzata per l'uso mobile "on-the-field".

---

## ✨ Funzionalità Chiave

### 🚨 Modalità Operatore
Un'interfaccia ad alto contrasto (Dark Mode) progettata per l'uso notturno o in condizioni di scarsa visibilità.
*   **Accesso rapido ai preferiti**: Le violazioni più frequenti a portata di un tap.
*   **Calcoli Dinamici**: Calcolo automatico delle sanzioni (PMR, scontata 30%, sanzioni notturne maggiorate del 33.3%).
*   **Note Operative**: Suggerimenti tecnici e note al verbale integrate per ogni articolo.

### 📋 Prontuario & Normativa
*   **Ricerca Intelligente**: Filtra per numero articolo, parola chiave o codice violazione.
*   **Database Sincronizzato**: Dati sempre aggiornati tramite integrazione cloud con Supabase.
*   **Testo Integrale**: Accesso completo agli articoli del CdS (Tabella `codice_strada`).

### ⚙️ Pannello Amministrativo
Un backend completo per la gestione dei contenuti senza toccare il codice:
*   Gestione News e aggiornamenti normativi.
*   Editing del Prontuario e delle sanzioni.
*   Statistiche di sistema (operatori iscritti, versioni database).

### 📱 Esperienza PWA
*   Installabile su smartphone come un'app nativa.
*   Splash screen professionale e gestione sessione avanzata.
*   Navigazione orizzontale fluida e feedback visivi premium.

---

## 🛠️ Stack Tecnologico

*   **Frontend**: React.js con hooks personalizzati.
*   **Build Tool**: Vite per prestazioni fulminee.
*   **Styling**: Design System centralizzato in Vanilla JS (Zero dipendenze esterne pesanti).
*   **Backend & DB**: Supabase (PostgreSQL + Auth).
*   **Icons**: Material Design & Custom Branding.

---

## 🚀 Installazione Locale

1. **Clona il repository**:
   ```bash
   git clone https://github.com/tuo-username/polisroad.git
   ```

2. **Installa le dipendenze**:
   ```bash
   npm install
   ```

3. **Configura l'ambiente**:
   Crea un file `.env` nella root con le tue credenziali Supabase:
   ```env
   VITE_SUPABASE_URL=tua_url
   VITE_SUPABASE_ANON_KEY=tua_chiave
   ```

4. **Avvia in modalità sviluppo**:
   ```bash
   npm run dev
   ```

---

## 📸 Preview Design
L'applicazione utilizza un design moderno basato su:
*   **Glassmorphism**: Trasparenze e sfocature eleganti.
*   **Premium Palette**: Colori istituzionali calibrati per la leggibilità.
*   **Responsive Layout**: Adattamento perfetto da mobile a desktop.

---

## 🤝 Contatti & Supporto
Sviluppato per supportare l'efficienza e la precisione del lavoro delle Forze di Polizia.

---
*PolisRoad — La legge, a portata di click.*
