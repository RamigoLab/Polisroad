export const mockNews = [
  {
    id: "nw1",
    titolo: "Nuovi limiti di velocità in ambito urbano",
    contenuto: "A partire dal prossimo mese, diversi comuni introdurranno il limite di 30 km/h in specifiche zone per aumentare la sicurezza.",
    fonte: "Ministero Infrastrutture e Trasporti",
    url_fonte: "https://www.mit.gov.it",
    categoria: "Normativa",
    pubblicato: true,
    created_at: new Date().toISOString(),
    autore_id: "admin-1"
  },
  {
    id: "nw2",
    titolo: "Aggiornamento Prontuario 2024",
    contenuto: "Sono stati aggiornati gli importi delle sanzioni pecuniarie per le violazioni al Codice della Strada in vigore dal 1 gennaio 2024.",
    fonte: "Gazzetta Ufficiale",
    url_fonte: "https://www.gazzettaufficiale.it",
    categoria: "Aggiornamenti",
    pubblicato: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    autore_id: "admin-1"
  }
];
