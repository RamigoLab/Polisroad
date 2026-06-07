#!/usr/bin/env node
/**
 * Script che genera un file SQL con gli INSERT del prontuario
 * da eseguire direttamente nella SQL Editor di Supabase Dashboard.
 * 
 * Utilizzo:
 *   node scripts/generate_prontuario_sql.js
 * 
 * Output:
 *   scripts/prontuario_insert.sql  ← da incollare nella SQL Editor di Supabase
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Leggi il CSV
const csvPath = resolve(rootDir, 'prontuario_cds_20260602_2227.csv');
console.log(`📄 Lettura CSV da: ${csvPath}`);

let csvContent;
try {
  csvContent = readFileSync(csvPath, { encoding: 'latin1' });
} catch (err) {
  console.error('❌ Impossibile leggere il file CSV:', err.message);
  process.exit(1);
}

const records = parse(csvContent, {
  delimiter: ',',
  quote: '"',
  escape: '"',
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  trim: true,
});

console.log(`✅ Trovate ${records.length} righe nel CSV`);

// Helper per escape SQL
const sqlStr = (val) => {
  if (!val || val.toString().trim() === '' || val.toString().trim() === '-') return 'NULL';
  // Escape single quotes e caratteri di controllo
  const cleaned = val.toString()
    .replace(/[\x00-\x06\x07\x08\x0B\x0C\x0E-\x1F]/g, ' ')
    .replace(/'/g, "''")
    .trim();
  if (!cleaned) return 'NULL';
  return `'${cleaned}'`;
};

const sqlNum = (val) => {
  if (!val || val.toString().trim() === '' || val.toString().trim() === '-') return 'NULL';
  const n = parseFloat(val.toString().replace(',', '.'));
  return isNaN(n) ? 'NULL' : n.toString();
};

const sqlInt = (val) => {
  if (!val || val.toString().trim() === '' || val.toString().trim() === '-' || val.toString().trim() === '0000') return '0';
  const n = parseInt(val.toString(), 10);
  return isNaN(n) ? '0' : n.toString();
};

// Genera SQL
const BATCH_SIZE = 50; // Supabase SQL editor funziona meglio con batch piccoli
let sql = `-- =====================================================
-- Prontuario CdS 2026.1 (giugno 2026)
-- Generato da: generate_prontuario_sql.js
-- Righe totali: ${records.length}
-- 
-- ISTRUZIONI:
-- 1. Prima esegui la migration: 20260607_create_prontuario_table.sql
-- 2. Poi esegui questo file nella SQL Editor di Supabase
-- =====================================================

-- Svuota la tabella (opzionale - commentare per mantenere dati esistenti)
DELETE FROM public.prontuario;

`;

// Dividi in batch
for (let i = 0; i < records.length; i += BATCH_SIZE) {
  const batch = records.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const totalBatches = Math.ceil(records.length / BATCH_SIZE);
  
  sql += `-- Batch ${batchNum}/${totalBatches} (righe ${i + 1}-${Math.min(i + BATCH_SIZE, records.length)})\n`;
  sql += `INSERT INTO public.prontuario (\n`;
  sql += `  articolo_numero, articolo_nome, titolo_sezione, capo, sezione,\n`;
  sql += `  aggiornamento, note_comuni, codice_caso, codice_violazione,\n`;
  sql += `  rif_normativo, titolo, descrizione, sanzione_penale,\n`;
  sql += `  pmr, scontato_30, sanzione_notturna_importo, sanzione_notturna_scontata,\n`;
  sql += `  punti_patente, sanzione_accessoria, note_verbale, note_operative, url\n`;
  sql += `) VALUES\n`;
  
  const values = batch.map(r => {
    return `  (${sqlInt(r['Articolo_numero'])}, ${sqlStr(r['Articolo_nome'])}, ${sqlStr(r['Titolo'])}, ${sqlStr(r['Capo'])}, ${sqlStr(r['Sezione'])},\n` +
           `   ${sqlStr(r['Aggiornamento'])}, ${sqlStr(r['Note_comuni'])}, ${sqlStr(r['Codice_caso'])}, ${sqlStr(r['Codice_violazione'])},\n` +
           `   ${sqlStr(r['Riferimento_normativo'])}, ${sqlStr(r['Titolo_violazione'])}, ${sqlStr(r['Descrizione_violazione'])}, ${sqlStr(r['Sanzione_penale'])},\n` +
           `   ${sqlNum(r['Sanzione_diurna'])}, ${sqlNum(r['Sanzione_diurna_scontata'])}, ${sqlNum(r['Sanzione_notturna'])}, ${sqlNum(r['Sanzione_notturna_scontata'])},\n` +
           `   ${sqlInt(r['Decurtazione_punti'])}, ${sqlStr(r['Sanzione_accessoria'])}, ${sqlStr(r['Note_verbale'])}, ${sqlStr(r['Note_operative'])}, ${sqlStr(r['URL'])})`;
  });
  
  sql += values.join(',\n') + ';\n\n';
}

sql += `-- Fine importazione\n`;
sql += `SELECT COUNT(*) as totale_voci_importate FROM public.prontuario;\n`;

// Scrivi il file
const outputPath = resolve(__dirname, 'prontuario_insert.sql');
writeFileSync(outputPath, sql, 'utf8');

const sizeKB = Math.round(Buffer.byteLength(sql, 'utf8') / 1024);
console.log(`\n✅ File SQL generato: ${outputPath}`);
console.log(`   📊 Righe: ${records.length} | Batch: ${Math.ceil(records.length / BATCH_SIZE)} | Dimensione: ${sizeKB} KB`);
console.log(`\n📋 Prossimi passi:`);
console.log(`   1. Vai su Supabase Dashboard → SQL Editor`);
console.log(`   2. Prima esegui: supabase/migrations/20260607_create_prontuario_table.sql`);
console.log(`   3. Poi esegui: scripts/prontuario_insert.sql`);
