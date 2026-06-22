-- Aggiunge la colonna note_comuni alla tabella prontuario.
-- Queste note sono comuni a tutte le casistiche dello stesso articolo
-- e vengono mostrate nella vista dettaglio sopra la descrizione della singola violazione.
ALTER TABLE prontuario ADD COLUMN IF NOT EXISTS note_comuni TEXT;
