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
    version: '1.8.9',
    date: '26 Giugno 2026',
    items: [
      'Risolto blocco iOS: gli utenti approvati ora accedono correttamente senza ricaricare l\'app',
      'Eliminato il flash "Errore caricamento profilo" mostrato erroneamente durante il caricamento iniziale',
      'Aggiornamento automatico su desktop migliorato: il browser controlla il nuovo SW anche quando la scheda rimane aperta',
      'Corretti crash nella Home con notizie prive di categoria',
    ],
  },
  {
    version: '1.8.8',
    date: '26 Giugno 2026',
    items: [
      'Notifiche push ora funzionanti: il dispositivo le riceve e mostra anche a schermo spento',
      'Toccando una notifica si apre l\'app direttamente nella sezione corretta',
      'Installazione PWA ripristinata: il pulsante "Installa" riappare nel Profilo quando disponibile',
      'Pannello admin: nuova sezione "Notifiche" per inviare messaggi push a tutti o a singoli utenti',
      'Account in attesa: l\'app si sblocca automaticamente non appena l\'amministratore approva l\'account',
      'Nuovo pulsante "Verifica ora" nella schermata di attesa per un controllo manuale immediato',
    ],
  },
  {
    version: '1.8.7',
    date: '26 Giugno 2026',
    items: [
      'Risolto errore al primo caricamento: l\'app non mostrava più la schermata di login agli utenti già autenticati',
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
      'Dalle schede Prontuario puoi aprire direttamente l\'articolo del Codice della Strada',
      'Banner offline: l\'app ti avvisa quando stai usando i dati in cache',
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
      'Accessibilità migliorata su tutta l\'app',
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
