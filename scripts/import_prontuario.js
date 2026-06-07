#!/usr/bin/env node
/**
 * PolisRoad – Import Prontuario CdS 2026.1 (giugno 2026)
 * ======================================================
 * Si autentica come admin Supabase e inserisce tutte le voci del CSV.
 *
 * Utilizzo:
 *   npm run import:prontuario
 *
 * Prerequisiti:
 *   1. Aver eseguito la migration SQL su Supabase (crea la tabella prontuario)
 *   2. File .env con VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 *   3. Il tuo account Supabase deve avere ruolo "admin" nella tabella profiles
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// ─── Percorsi ────────────────────────────────────────────────────────────────
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '..');

// ─── Lettura .env manuale (senza dotenv) ─────────────────────────────────────
function loadEnv(...files) {
  const env = {};
  for (const file of files) {
    const p = join(ROOT, file);
    if (!existsSync(p)) continue;
    const lines = readFileSync(p, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv('.env', '.env.local');
const SUPABASE_URL      = env.VITE_SUPABASE_URL        || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY   || process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ Mancano VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY nel file .env');
  process.exit(1);
}

// ─── Helper: input da terminale ──────────────────────────────────────────────
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(question, ans => { rl.close(); res(ans.trim()); }));
}

// ─── Lettura CSV ─────────────────────────────────────────────────────────────
const CSV_PATH = join(ROOT, 'prontuario_cds_20260602_2227.csv');
console.log(`\n📄 CSV: ${CSV_PATH}`);

if (!existsSync(CSV_PATH)) {
  console.error(`❌ File non trovato: ${CSV_PATH}`);
  process.exit(1);
}

const csvRaw = readFileSync(CSV_PATH, { encoding: 'latin1' });
const records = parse(csvRaw, {
  delimiter: ',', quote: '"', escape: '"',
  columns: true, skip_empty_lines: true,
  relax_quotes: true, trim: true,
});
console.log(`✅ CSV letto: ${records.length} righe\n`);

// ─── Mapping CSV → DB ─────────────────────────────────────────────────────────
const toNum  = v => { if (!v || !v.trim() || v.trim() === '-') return null; const n = parseFloat(v.replace(',','.')); return isNaN(n) ? null : n; };
const toInt  = v => { if (!v || !v.trim() || v.trim() === '-' || v.trim() === '0000') return 0; const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };
const toText = v => { if (!v || !v.trim() || v.trim() === '-') return null; const s = v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ').trim(); return s || null; };

const rows = records.map(r => ({
  articolo_numero:            toInt(r['Articolo_numero']),
  articolo_nome:              toText(r['Articolo_nome']),
  titolo_sezione:             toText(r['Titolo']),
  capo:                       toText(r['Capo']),
  sezione:                    toText(r['Sezione']),
  aggiornamento:              toText(r['Aggiornamento']),
  note_comuni:                toText(r['Note_comuni']),
  codice_caso:                toText(r['Codice_caso']),
  codice_violazione:          toText(r['Codice_violazione']),
  rif_normativo:              toText(r['Riferimento_normativo']),
  titolo:                     toText(r['Titolo_violazione']),
  descrizione:                toText(r['Descrizione_violazione']),
  sanzione_penale:            toText(r['Sanzione_penale']),
  pmr:                        toNum(r['Sanzione_diurna']),
  scontato_30:                toNum(r['Sanzione_diurna_scontata']),
  sanzione_notturna_importo:  toNum(r['Sanzione_notturna']),
  sanzione_notturna_scontata: toNum(r['Sanzione_notturna_scontata']),
  punti_patente:              toInt(r['Decurtazione_punti']),
  sanzione_accessoria:        toText(r['Sanzione_accessoria']),
  note_verbale:               toText(r['Note_verbale']),
  note_operative:             toText(r['Note_operative']),
  url:                        toText(r['URL']),
}));

// ─── Client Supabase ──────────────────────────────────────────────────────────
let supabase;

if (SERVICE_ROLE_KEY) {
  console.log('🔑 Modalità: Service Role Key (bypass RLS)');
  supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
} else {
  console.log('🔐 Modalità: login admin con email/password');
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const email    = env.ADMIN_EMAIL    || process.env.ADMIN_EMAIL    || await ask('   Email admin Supabase: ');
  const password = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || await ask('   Password: ');

  console.log(`\n   → Login come ${email}...`);
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({ email, password });

  if (authErr) {
    console.error(`❌ Login fallito: ${authErr.message}`);
    process.exit(1);
  }

  const { data: profile } = await supabase
    .from('profiles').select('ruolo').eq('id', auth.user.id).single();

  if (!profile || profile.ruolo !== 'admin') {
    console.error(`❌ Ruolo non admin (trovato: "${profile?.ruolo ?? 'nessuno'}"). Operazione negata dalle RLS.`);
    process.exit(1);
  }
  console.log(`   ✅ Autenticato come admin\n`);
}

// ─── Svuota tabella ───────────────────────────────────────────────────────────
console.log('🗑️  Svuoto la tabella prontuario...');
const { error: delErr } = await supabase
  .from('prontuario')
  .delete()
  .neq('id', '00000000-0000-0000-0000-000000000000');

if (delErr) {
  console.warn(`⚠️  Eliminazione fallita (${delErr.message}) — continuo comunque\n`);
} else {
  console.log('   ✅ Tabella svuotata\n');
}

// ─── Insert a batch ───────────────────────────────────────────────────────────
const BATCH = 50;
let inserted = 0, errors = 0;
const total = Math.ceil(rows.length / BATCH);

console.log(`🚀 Inserimento ${rows.length} voci in ${total} batch da ${BATCH}...\n`);

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const n = Math.floor(i / BATCH) + 1;
  const { error } = await supabase.from('prontuario').insert(batch);

  if (error) {
    console.error(`\n❌ Batch ${n}/${total}: ${error.message} [${error.code}]`);
    errors++;
  } else {
    inserted += batch.length;
    const pct = Math.round(inserted / rows.length * 100);
    const bar = '█'.repeat(Math.floor(pct / 5)).padEnd(20, '░');
    process.stdout.write(`\r   [${bar}] ${pct}%  ${inserted}/${rows.length}`);
  }
}

console.log('\n');
if (errors === 0) {
  console.log('🎉 Importazione completata!');
  console.log(`   ✅ ${inserted} voci inserite`);
  console.log('   📅 Prontuario CdS 2026.1 (giugno 2026) attivo\n');
} else {
  console.log(`⚠️  Terminato con ${errors} batch in errore.`);
  console.log(`   ✅ Inserite: ${inserted} | ❌ Errori batch: ${errors}\n`);
  process.exit(1);
}
