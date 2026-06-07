#!/usr/bin/env node
/**
 * Converte il CSV originale in uno con colonne rinominate
 * compatibili con la tabella "prontuario" di Supabase.
 * Output: prontuario_supabase_import.csv
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INPUT  = join(ROOT, 'prontuario_cds_20260602_2227.csv');
const OUTPUT = join(ROOT, 'prontuario_supabase_import.csv');

if (!existsSync(INPUT)) {
  console.error(`❌ File non trovato: ${INPUT}`);
  process.exit(1);
}

// Leggi il CSV originale (encoding Latin-1)
let raw = readFileSync(INPUT, { encoding: 'latin1' });
// Rimuovi il BOM UTF-8 se presente all'inizio del file
if (raw.startsWith('\uFEFF') || raw.startsWith('ï»¿')) {
  raw = raw.substring(raw.startsWith('\uFEFF') ? 1 : 3);
}
const records = parse(raw, {
  delimiter: ',', quote: '"', escape: '"',
  columns: true, skip_empty_lines: true,
  relax_quotes: true, trim: true,
});

console.log(`✅ Lette ${records.length} righe dal CSV originale`);

// Helper: pulizia valori
const toText = v => {
  if (!v || !v.trim() || v.trim() === '-') return '';
  return v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ').trim();
};
const toNum = v => {
  if (!v || !v.trim() || v.trim() === '-') return '';
  const n = parseFloat(v.replace(',', '.'));
  return isNaN(n) ? '' : String(n);
};
const toInt = v => {
  if (!v || !v.trim() || v.trim() === '-' || v.trim() === '0000') return '0';
  const n = parseInt(v, 10);
  return isNaN(n) ? '0' : String(n);
};

// Rimappa ogni riga con i nomi colonne corretti per il DB
const headers = [
  'articolo_numero',
  'articolo_nome',
  'titolo_sezione',
  'capo',
  'sezione',
  'aggiornamento',
  'note_comuni',
  'codice_caso',
  'codice_violazione',
  'rif_normativo',
  'titolo',
  'descrizione',
  'sanzione_penale',
  'pmr',
  'scontato_30',
  'sanzione_notturna_importo',
  'sanzione_notturna_scontata',
  'punti_patente',
  'sanzione_accessoria',
  'note_verbale',
  'note_operative',
  'url'
];

const escapeCSVValue = val => {
  if (val === null || val === undefined) return '""';
  // Raddoppia i doppi apici per fare l'escaping CSV standard
  const escaped = String(val).replace(/"/g, '""');
  return `"${escaped}"`;
};

const rows = [headers.join(',')];

for (const r of records) {
  const rowData = [
    toInt(r['Articolo_numero']),
    toText(r['Articolo_nome']),
    toText(r['Titolo']),
    toText(r['Capo']),
    toText(r['Sezione']),
    toText(r['Aggiornamento']),
    toText(r['Note_comuni']),
    toText(r['Codice_caso']),
    toText(r['Codice_violazione']),
    toText(r['Riferimento_normativo']),
    toText(r['Titolo_violazione']),
    toText(r['Descrizione_violazione']),
    toText(r['Sanzione_penale']),
    toNum(r['Sanzione_diurna']),
    toNum(r['Sanzione_diurna_scontata']),
    toNum(r['Sanzione_notturna']),
    toNum(r['Sanzione_notturna_scontata']),
    toInt(r['Decurtazione_punti']),
    toText(r['Sanzione_accessoria']),
    toText(r['Note_verbale']),
    toText(r['Note_operative']),
    toText(r['URL'])
  ];
  
  rows.push(rowData.map(escapeCSVValue).join(','));
}

writeFileSync(OUTPUT, rows.join('\n'), { encoding: 'utf8' });

console.log(`\n✅ File pronto per Supabase: ${OUTPUT}`);
console.log(`   📊 Righe: ${records.length}`);
console.log(`   🔤 Encoding: UTF-8`);
console.log(`\n👉 Ora vai su Supabase → Table Editor → prontuario → Import data from CSV`);
console.log(`   e carica il file: prontuario_supabase_import.csv`);

