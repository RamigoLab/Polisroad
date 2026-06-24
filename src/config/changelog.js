/**
 * changelog.js — Novità visibili all'utente finale nell'app.
 * Non espone dettagli tecnici: linguaggio semplice, focalizzato su cosa cambia per l'operatore.
 */
export const APP_CHANGELOG = [
  {
    version: '1.8.4',
    date: '23 Giugno 2026',
    isNew: true,
    items: [
      'Ricerca intelligente: ora tollera errori di battitura (es. "alcool" trova "alcol")',
      'Dalle schede Prontuario puoi aprire direttamente l\'articolo del Codice della Strada',
      'Banner offline: l\'app ti avvisa quando stai usando i dati in cache',
      'Nuovi indicatori di caricamento più fluidi nelle sezioni principali',
      'Suggerimenti automatici nella barra di ricerca basati sulla tua cronologia',
    ],
  },
  {
    version: '1.7.0',
    date: '22 Giugno 2026',
    isNew: false,
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
    isNew: false,
    items: [
      'Ricerca simultanea in tutto PolisRoad',
      'Fix modalità Operatore: espansione articoli ora funziona correttamente',
      'Sistema toast/notifiche in-app migliorato',
    ],
  },
];
