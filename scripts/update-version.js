#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const constantsPath = path.join(projectRoot, 'src/config/constants.js');

try {
  // Leggi package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;

  if (!version) {
    console.error('❌ Errore: versione non trovata in package.json');
    process.exit(1);
  }

  // Leggi constants.js
  let constantsContent = fs.readFileSync(constantsPath, 'utf8');

  // Sostituisci la versione
  const oldContent = constantsContent;
  constantsContent = constantsContent.replace(
    /export const APP_VERSION = '[^']*';/,
    `export const APP_VERSION = '${version}';`
  );

  // Se il contenuto è cambiato, scrivi il file
  if (oldContent !== constantsContent) {
    fs.writeFileSync(constantsPath, constantsContent, 'utf8');
    console.log(`✅ Versione sincronizzata: ${version}`);
  } else {
    console.log(`✅ Versione già sincronizzata: ${version}`);
  }
} catch (error) {
  console.error('❌ Errore durante l\'aggiornamento della versione:', error.message);
  process.exit(1);
}
