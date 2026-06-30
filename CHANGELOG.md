# Changelog PolisRoad

## [1.9.6] — 30 Giugno 2026

### Corretto
- AdminUtenti: errore 400 su caricamento lista utenti — colonna `created_at` non presente in `profiles`, rimossa dalla SELECT
- Header app: rimossi bordi arrotondati in basso, aspetto piatto e uniforme su tutte le pagine
- BottomNav: rimossa barra stato Online/Offline ridondante sopra le icone
- `styles.js`: carattere spurio nella definizione `btnOutline` che causava errore di build
- `changelog.js`: apostrofi italiani nelle stringhe ora usano template literals per evitare errori di build

### Database
- Aggiunta colonna `created_at` a `profiles` per mostrare la data di registrazione in AdminUtenti
- Audit RLS completato su tutte le tabelle pubbliche
- Rimossa tabella `profiles_admin` senza RLS (esponeva tutti i profili senza autenticazione)
- Corrette policy `delete_any_profile_admin` e `update_any_profile_admin` su `profiles` (usavano subquery ricorsive che causavano deadlock potenziale)
- Creata funzione `is_admin()` con `SECURITY DEFINER` usata da tutte le policy admin
- Rimossa policy `Users can read all profiles` con ruolo `public` su `profiles`
- Eliminate circa 15 policy duplicate su `news`, `note`, `codice_strada`, `push_subscriptions`, `segnalazioni`
- Policy `note` e `preferiti` corrette da ruolo `public` ad `authenticated`
- Rimosso `INSERT` anonimo su `segnalazioni` (chiunque poteva inserire segnalazioni senza autenticazione)

## [1.9.5] — 30 Giugno 2026

### Aggiunto
- Redesign grafico completo: nuovo sistema di colori, header con sfumatura, card con ombra leggera
- Profilo ridisegnato con struttura a gruppi (Account, Preferenze, Notifiche, Informazioni, Supporto)
- Statistiche di utilizzo nel Profilo (preferiti, note, segnalazioni)
- Blocco Help Desk con link email admin e link alle News
- Icone unificate con lucide-react su tutta l'app
- Onboarding aggiornato (rimossa slide gamification, aggiunta slide offline)
- Toast con design pill e icone semantiche
- SearchBar con focus ring e pulsante clear

### Corretto
- `useSyncQueue` non scrive piu su tabelle gamification rimosse
- Popup Home si chiude cliccando fuori dal riquadro
- NavCard label rispetta la dark mode
- Auth migrata a PKCE flow (piu sicuro)
- CSP aggiornata con domini Sentry e worker-src
- CORS `send-push` ristretto alle origini autorizzate
- `storage.js` usa TextEncoder al posto di funzioni deprecate

## [1.9.4] — 29 Giugno 2026
- Rimossa gamification (XP, badge, streak)
- Fix critico: `delete-user` Edge Function consentiva solo auto-eliminazione
- Fix race condition eliminazione account in Profilo
- Notifica push admin su nuova registrazione (trigger pg_net)
- Service Worker: bypass cache per chiamate Supabase
- Profilo a sezioni collassabili
- Home: footer unificato, NavCard con feedback touch
- Ricerca: filtri per tipo (Prontuario / Normativa / Tutti)
- Calcolatore: persistenza sessionStorage
- AdminUtenti: fix pendingCount
- Dashboard: stato Supabase in tempo reale

## [1.9.3] — 28 Giugno 2026
- Fix crash Home (null guard featuredBadge)
- Fix recupero password

## [1.9.2] — 28 Giugno 2026
- Fix login utenti non-admin
- Fix flash iOS schermata approvazione
- Fix build Vite

## [1.9.1] — 27 Giugno 2026
- Fix RLS deadlock profiles
- Fix push subscriptions RLS

## [1.9.0] — 26 Giugno 2026
- Wizard onboarding
- AdminNotifiche broadcast push
- AdminUtenti con eliminazione utente
- PWA install prompt
- Ricerca globale
