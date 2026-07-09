/**
 * changelog.js — Novità visibili all'utente finale nell'app.
 *
 * COME AGGIORNARE:
 * Ad ogni release aggiungere un oggetto in cima all'array APP_CHANGELOG.
 * Il flag `isNew` viene calcolato automaticamente confrontando con APP_VERSION:
 * la voce con version === APP_VERSION viene marcata come nuova automaticamente.
 * Non serve mai modificare `isNew` a mano.
 */
import { APP_VERSION } from './constants';

const CHANGELOG_DATA = [
  {
    version: '2.0.1',
    date: '9 Luglio 2026',
    isNew: true,
    items: [
      'Performance: il bundle della pagina corrente inizia a scaricarsi in parallelo all\'autenticazione Supabase, eliminando il "waterfall" seriale (Auth → Download JS → Render) — valido per tutte le pagine dell\'app',
      'Performance: le statistiche del Profilo (preferiti, note, segnalazioni) vengono caricate in background dopo il paint iniziale, riducendo il LCP della pagina Profilo',
    ],
  },
  {
    version: '2.0.0',
    date: '6 Luglio 2026',
    isNew: true,
    items: [
      'Motore di ricerca unificato con sinonimi su tutta l\'app (Ricerca Globale, Prontuario, Normativa, Modalità Operatore)',
      'Decine di bug corretti dopo un ciclo di audit completo (navigazione da notifica push, notifiche multi-dispositivo, form profilo, cache offline, versioning)',
      'Accessibilità da tastiera e contrasto colori migliorati in tutta l\'app',
      'Caricamento più veloce grazie a un code-splitting più efficiente',
      'Irrobustito il funzionamento offline del Service Worker',
      'Risolto: la cronologia delle ricerche recenti non si poteva cancellare',
      'Ricerca più veloce grazie a un ordinamento e un motore di ricerca ottimizzati',
      'Rimossa la funzione "Registra Contestazione" (Prontuario e Modalità Operatore): non salvava più nulla da quando è stata tolta la gamification',
    ],
  },
  {
    version: '1.9.9',
    date: '4 Luglio 2026',
    isNew: false,
    items: [
      'Feedback tattile: vibrazione distinta per azioni riuscite, avvisi ed errori, applicata in modo coerente in tutta l\'app (prima presente solo in un paio di punti)',
      'Sentry: gli errori sono ora taggati con la versione dell\'app e hanno stack trace leggibili (prima arrivavano tutti mescolati insieme e illeggibili)',
      'Risolto: l\'app non si apriva più se chiusa mentre offline e poi riaperta senza connessione',
      'Aggiunta conferma prima di disattivare le notifiche push su tutti i dispositivi',
      'Badge "nota presente" su Prontuario e Modalità Operatore per vedere subito quali voci hanno già una nota',
      'Modalità Operatore: riepilogo delle contestazioni registrate durante il turno',
      'Dialog di conferma coerente in tutta l\'app al posto del popup del browser',
      'Migliorata l\'accessibilità da tastiera in tutta l\'app e il contrasto colori per l\'uso all\'aperto',
      'Ottimizzato il caricamento: le pagine che non usano la ricerca non scaricano più inutilmente il motore di ricerca',
    ],
  },
  {
    version: '1.9.8',
    date: '2 Luglio 2026',
    isNew: false,
    items: [
      'Ricerca unificata: Ricerca Globale, Prontuario, Normativa e Modalità Operatore usano ora lo stesso motore (stessa soglia di 3 caratteri, stesso algoritmo, ricerca fuzzy ovunque)',
      'Nuovo: "risultato suggerito" — la ricerca riconosce frasi colloquiali (es. "senza assicurazione") e propone subito la violazione giusta (es. Art. 193 CDS), grazie a una tabella di sinonimi',
      'Nuova sezione Admin > Sinonimi per aggiungere, correggere o disattivare i sinonimi senza deploy',
      'Ricerca: normalizzazione degli accenti, i risultati non dipendono più da come si digitano',
      'Popolati 477 sinonimi per le violazioni più comuni del Prontuario',
    ],
  },
  {
    version: '1.9.7',
    date: '1 Luglio 2026',
    isNew: false,
    items: [
      'Ricerca: aggiunto indicatore "ricerca in corso" (Ricerca Globale, Prontuario, Normativa)',
      'Accessibilità: risultati espandibili in Ricerca Globale ora navigabili da tastiera',
      'Pulizia: rimosso codice della gamification non più in uso (componenti, hook, servizio)',
      'Fix: rimossa una regola di stile duplicata nei filtri della Ricerca Globale',
    ],
  },
  {
    version: '1.9.6',
    date: '30 Giugno 2026',
    isNew: false,
    items: [
      'Fix: AdminUtenti carica correttamente la lista utenti (errore 400 su colonna mancante)',
      'Fix: rimossa colonna created_at dalla query profiles (non presente nel DB)',
      'Fix: header app senza bordi arrotondati in basso, uguale su tutte le pagine',
      'Fix: BottomNav semplificata, rimossa barra stato Online/Offline ridondante',
      'Fix: stili styles.js corretti (carattere spurio nella definizione btnOutline)',
      'Fix: apostrofi nelle stringhe del changelog non causano più errori di build',
      'DB: aggiunta colonna created_at a profiles per mostrare la data di registrazione',
      'DB: audit RLS completato su tutte le tabelle',
      'DB: rimossa profiles_admin senza RLS (buco di sicurezza)',
      'DB: corrette policy ricorsive su profiles (delete e update)',
      'DB: eliminate circa 15 policy duplicate su news, note, codice_strada, push_subscriptions',
      'DB: note e preferiti corrette da public ad authenticated',
      'DB: rimosso INSERT anonimo su segnalazioni',
    ],
  },
  {
    version: '1.9.5',
    date: '30 Giugno 2026',
    isNew: false,
    items: [
      'Redesign grafico completo — nuovo sistema di colori più vivace, header con sfumatura, card con ombra sottile',
      'Profilo completamente ridisegnato — struttura a gruppi iOS-style (Account, Preferenze, Notifiche, Info, Supporto)',
      'Profilo: nuova sezione Statistiche (preferiti salvati, annotazioni, segnalazioni inviate)',
      `Profilo: blocco Help Desk con link diretto all'email admin e alle News`,
      'Profilo: zona pericolosa separata visivamente con ampio margine superiore',
      'Home: NavCard con colori di accento coerenti e feedback touch migliorato',
      'Icone: set unificato lucide-react con stroke-width consistente su tutte le pagine',
      'Onboarding: rimossa slide sulla gamification, aggiunta slide sul funzionamento offline',
      'BottomNav: indicatori di stato ridisegnati, label sempre visibili sotto le icone',
      'Toast: design pill con colori semantici e icone contestuali',
      `OfflineBanner: stile pill coerente con il resto dell'app`,
      'EmptyState: icone con sfondo colorato invece di emoji',
      'Fix: sincronizzazione offline non scrive più su tabelle gamification rimosse',
      'Fix: popup nella Home si chiude toccando fuori dal riquadro',
      'Fix: auth PKCE flow (più sicuro), CSP aggiornata con Sentry e worker-src',
    ],
  },
  {
    version: '1.9.4',
    date: '29 Giugno 2026',
    items: [
      'Rimossa gamification (XP, badge, streak) — non portava valore senza un layer sociale',
      'Fix critico: eliminazione utente da admin ora funziona correttamente (errore 403 risolto)',
      'Fix: eliminazione account dal Profilo non lascia più dati orfani in caso di errore',
      'Notifica push automatica agli admin quando un nuovo utente si registra',
      'Service Worker: le chiamate API Supabase bypassano la cache (dati sempre aggiornati)',
      'Profilo: sezioni collassabili per ridurre lo scroll su mobile',
      'Home: footer unificato, rimosso il blocco Credits duplicato',
      'Home: NavCard con feedback visivo al tocco (rimbalzo)',
      'Ricerca: filtri rapidi per tipo (Prontuario / Normativa / Tutti)',
      'Calcolatore: lo stato del calcolo persiste nella sessione (navigazione sicura)',
      'Popup nella Home ora accessibile da tastiera e screen reader (role dialog)',
      'AdminUtenti: mostra la data di registrazione di ogni utente',
      'AdminUtenti: filtro In attesa esclude correttamente gli admin',
      'Dashboard admin: stato server Supabase verificato in tempo reale (non più hardcoded)',
    ],
  },
  {
    version: '1.9.3',
    date: '28 Giugno 2026',
    items: [
      'Fix critico: risolto crash della Home per tutti gli utenti senza badge impostato',
      'Fix: AppHeader non va più in errore quando featuredBadge è null',
      'Stabilità: aggiunti guard null su tutti gli accessi a proprietà badge',
      "Fix: risolto bug nel recupero password causato dall'inizializzazione dell'URL",
    ],
  },
  {
    version: '1.9.2',
    date: '28 Giugno 2026',
    items: [
      'Fix autenticazione: risolto il blocco al login per gli utenti non-admin',
      'Fix iOS: eliminato il flash della schermata di attesa durante il caricamento del profilo',
      'Fix recupero password: il link via email ora porta correttamente al form di reset',
      'Fix build: downgrade Vite a versione stabile, eliminati errori di compilazione',
      'Fix Profilo: rimosso import duplicato che poteva causare errori su iOS',
      'Stabilità generale: rimosso ErrorBoundary doppio, ridotti casi di crash imprevisti',
    ],
  },
  {
    version: '1.9.1',
    date: '27 Giugno 2026',
    items: [
      "Admin Utenti: aggiunta funzione di eliminazione profilo con pannello di conferma",
      "Eliminazione utente rimuove anche note, preferiti, XP e subscription push",
      "Aggiunta policy RLS per permettere agli admin di eliminare i profili",
    ],
  },
  {
    version: '1.9.0',
    date: '27 Giugno 2026',
    items: [
      'Fix iOS: eliminata la race condition che mostrava errore subito dopo la registrazione',
      'Fix iOS PWA: risolto il rimbalzo alla schermata di login al ritorno dal background',
      'Fix iOS: eliminata la doppia chiamata al profilo al primo avvio (INITIAL_SESSION + getSession)',
      "Timeout 8 secondi su caricamento profilo: l'app non si blocca più su reti irraggiungibili",
      'Notifiche push: contatore dispositivi attivi nel Profilo con opzione disattiva su tutti',
      "Notifiche push: messaggio dedicato su Safari per guidare all'installazione come PWA",
      "Notifiche push: click sulla notifica ora naviga alla sezione corretta senza ricaricare l'app",
      'Admin Notifiche: contatore mostra ora subscription e utenti unici separatamente',
      'Form registrazione: campi azzerati dopo la registrazione riuscita',
      'Schermata attesa approvazione: polling ottimizzato con backoff (10s → 30s → 60s → 120s)',
      'Corretto testo: "credenziali" → "profilo" nella schermata di attesa approvazione',
      'Corretto toggle Dark Mode: ora mostra "Attivo" quando è attiva',
      'Fix memory leak: listener visibilitychange rimosso correttamente al remount',
      'Home: aggiunto link "Vedi tutte" quando le comunicazioni superano 3',
      'Animazione icona ErrorBoundary ripristinata (keyframe bounce)',
      'Rimosso file manifest.json duplicato (la PWA usa il manifest generato da Vite)',
    ],
  },

  {
    version: '1.8.9',
    date: '27 Giugno 2026',
    items: [
      `Risolto blocco iOS: gli utenti approvati ora accedono correttamente senza ricaricare l'app`,
      'Eliminato il flash "Errore caricamento profilo" mostrato erroneamente al primo avvio',
      'Risolto il loop infinito di sincronizzazione offline al boot o al cambio rete',
      'Abilitato il caricamento del database locale anche quando configurato senza Supabase (Rules of Hooks fix)',
      'Aggiornamento automatico su desktop migliorato: il browser controlla il nuovo SW anche quando la scheda rimane aperta',
      'Notifiche push: sezione profilo sempre visibile con dettagli configurazione / supporto browser',
      'Corretti crash nella Home con notizie prive di categoria',
    ],
  },
  {
    version: '1.8.8',
    date: '26 Giugno 2026',
    items: [
      'Notifiche push ora funzionanti: il dispositivo le riceve e mostra anche a schermo spento',
      `Toccando una notifica si apre l'app direttamente nella sezione corretta`,
      'Installazione PWA ripristinata: il pulsante "Installa" riappare nel Profilo quando disponibile',
      'Pannello admin: nuova sezione "Notifiche" per inviare messaggi push a tutti o a singoli utenti',
      `Account in attesa: l'app si sblocca automaticamente non appena l'amministratore approva l'account`,
      'Nuovo pulsante "Verifica ora" nella schermata di attesa per un controllo manuale immediato',
    ],
  },
  {
    version: '1.8.7',
    date: '26 Giugno 2026',
    items: [
      `Risolto errore al primo caricamento: l'app non mostrava più la schermata di login agli utenti già autenticati`,
      'Notifica aggiornamento PWA ripristinata: il banner "Nuovo aggiornamento disponibile!" ora appare correttamente',
    ],
  },
  {
    version: '1.8.6',
    date: '26 Giugno 2026',
    items: [
      'Pannello admin: approva o sospendi utenti con un tap, badge stato e filtro "In attesa"',
      'Risolto crash su Normativa, Prontuario, News, Preferiti e Ricerca (incompatibilità React Query v5)',
      'Accesso immediato per amministratori: risolto blocco improprio alla schermata di attesa approvazione',
      'Schermata di accesso: campi email e password ora visivamente uniformi',
      'Privacy Policy e Termini di Servizio leggibili direttamente dalla schermata di login',
      'Wizard di benvenuto: risolto il pulsante "Inizia a usare PolisRoad" che non rispondeva',
      'Notifiche push: ricevi aggiornamenti normativi direttamente sul dispositivo (attivabili dal Profilo)',
      'Approvazione account: i nuovi iscritti attendono verifica admin prima di accedere',
      'Error monitoring attivo in produzione per rilevare problemi in tempo reale',
    ],
  },
  {
    version: '1.8.5',
    date: '23 Giugno 2026',
    items: [
      'Swipe verso destra per tornare alla schermata precedente (gesto nativo mobile)',
      'Tira verso il basso per aggiornare i dati in Prontuario, Normativa e News',
      'Tutorial di benvenuto al primo accesso: 4 schermate sulle funzionalità principali',
      'Se una sezione ha un errore, le altre rimangono funzionanti',
      'Indicatore operazioni in coda quando sei offline',
      'Messaggi di errore registrazione e login ora in italiano',
      'Campo password con pulsante mostra/nascondi e checklist requisiti',
    ],
  },
  {
    version: '1.8.4',
    date: '23 Giugno 2026',
    items: [
      'Ricerca intelligente: tollera errori di battitura (es. "alcool" trova "alcol")',
      `Dalle schede Prontuario puoi aprire direttamente l'articolo del Codice della Strada`,
      `Banner offline: l'app ti avvisa quando stai usando i dati in cache`,
      'Nuovi indicatori di caricamento più fluidi nelle sezioni principali',
      'Suggerimenti automatici nella barra di ricerca basati sulla tua cronologia',
      'Messaggi di errore nella registrazione e nel login ora in italiano',
      'Campo password con pulsante mostra/nascondi e checklist requisiti in tempo reale',
      'Calcolatore sanzioni avanzato: recidiva, riduzione 5 giorni, maggiorazione notturna, copia riepilogo',
    ],
  },
  {
    version: '1.7.0',
    date: '22 Giugno 2026',
    items: [
      'Ricerca avanzata in Prontuario, Normativa e Operatore',
      'Modalità offline migliorata: contestazioni e preferiti salvati e sincronizzati',
      'Nuovi badge e traguardi sbloccabili',
      `Accessibilità migliorata su tutta l'app`,
      'Performance significativamente più rapide al caricamento',
    ],
  },
  {
    version: '1.6.4',
    date: '14 Giugno 2026',
    items: [
      'Ricerca simultanea in tutto PolisRoad',
      'Fix modalità Operatore: espansione articoli ora funziona correttamente',
      'Sistema toast/notifiche in-app migliorato',
    ],
  },
];

// isNew calcolato automaticamente: true solo se version === APP_VERSION corrente
export const APP_CHANGELOG = CHANGELOG_DATA.map(entry => ({
  ...entry,
  isNew: entry.version === APP_VERSION,
}));
