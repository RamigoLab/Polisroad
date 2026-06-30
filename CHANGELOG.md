# Changelog PolisRoad

## [1.9.5] — 30 Giugno 2026

### Aggiunto
- **Redesign grafico completo**: nuovo sistema di colori più saturo e vivace, header con sfumatura lineare `primary → accent`, card con ombra leggera e bordo sottile, radius consistenti via CSS custom properties
- **Profilo ridisegnato** (struttura iOS-style a gruppi con label superiore):
  - **Account**: Modifica profilo, Esporta dati GDPR
  - **Preferenze**: Dark mode, Analytics (toggle visivo)
  - **Notifiche e app**: Push, Installa app
  - **Informazioni**: Novità, Info di sistema, Privacy, Termini
  - **Pannello admin** (solo admin)
  - **Supporto**: Segnala problema, Supporta PolisRoad
  - **Help Desk**: link email admin + link News
  - **Zona pericolosa**: separata con margine deliberato di 32px
- **Statistiche utilizzo** nel Profilo: preferiti salvati, note, segnalazioni inviate (dati reali da Supabase)
- **Profilo header**: iniziali utente, pills con stato approvazione ed email, design gradient
- **Icone**: set completo e coerente — tutti i file usano `lucide-react` via `Icon.jsx`, stesso `strokeWidth: 1.75`, colori da `C.icon*` del tema
- **Onboarding**: rimossa slide gamification → sostituita con slide "Funziona offline"; usa `Icon` al posto di emoji
- **EmptyState**: icona con sfondo colorato al posto delle emoji
- **Toast**: design pill con colori semantici (verde/rosso/giallo/blu), icone lucide-react
- **OfflineBanner**: stile pill coerente, usa `wifi`/`wifi-off` da lucide-react
- **SearchBar**: bordo accent con glow ring al focus, pulsante clear con icona `x`
- **PendingApprovalScreen**: ridisegnata con gradient + glassmorphism leggero

### Corretto (da audit)
- `useSyncQueue`: rimosso blocco `SAVE_CONTESTAZIONE` che tentava di scrivere su `xp_history` (rimossa con v1.9.4)
- Home popup: `onClick={handleDismissPopup}` sul backdrop + `stopPropagation` sul contenuto
- NavCard label: usa `C.text` invece di `'#333'` hardcoded (dark mode)
- App.jsx: rimosso `dataLoading` non utilizzato
- Profilo: rimosso state `reportOpen` dichiarato ma mai usato
- Auth PKCE flow: `flowType: 'pkce'` invece di `'implicit'` (token non più esposti nell'URL)
- CSP Vercel: aggiunti `*.sentry.io`, `*.ingest.sentry.io`, `worker-src 'self'`
- CORS `send-push`: ristretto alle origini autorizzate (come `delete-user`)
- `storage.js`: sostituisce `escape()`/`unescape()` con `TextEncoder`/`TextDecoder`
- AdminDashboard ping: `.catch()` separato per errori di rete
- Migration `drop_gamification_tables.sql`: rimuove `gamification` e `xp_history`

## [1.9.4] — 29 Giugno 2026
- Rimossa gamification, fix delete-user, race condition, notifiche admin, SW cache bypass

## [1.9.3] — 28 Giugno 2026
- Fix crash Home, fix recupero password

## [1.9.2] — 28 Giugno 2026
- Fix login utenti, flash iOS, build Vite

## [1.9.1] — 27 Giugno 2026
- Fix RLS deadlock, push subscriptions RLS

## [1.9.0] — 26 Giugno 2026
- Onboarding, AdminNotifiche, AdminUtenti, PWA install, Ricerca globale
