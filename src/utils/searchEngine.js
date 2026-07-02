/**
 * searchEngine.js
 * Motore di ricerca UNICO, condiviso da Ricerca Globale, Prontuario e Normativa.
 * v1.9.8 — unifica le 3 implementazioni separate che esistevano prima (stessa
 * soglia minima, stesso algoritmo, stesso fuzzy matching ovunque).
 *
 * Pipeline di ricerca, in ordine di priorità:
 *   1. Numero articolo esatto (es. "193")            → gruppo esatto
 *   2. Sinonimi (search_synonyms, tabella Supabase)   → "risultato suggerito"
 *   3. Testo esatto (includes, con accenti normalizzati)
 *   4. Fuzzy (Fuse.js, tollerante ai typo)
 *
 * I risultati "suggeriti" da sinonimo sono esclusi dal blocco "other" per
 * evitare doppioni: compaiono solo una volta, in cima, con isSuggested:true.
 */
import Fuse from 'fuse.js';
import { groupByArticolo } from './prontuarioUtils';

export const MIN_SEARCH_CHARS = 3;

// Rimuove diacritici (perché → perche) e normalizza maiuscole/spazi,
// così la ricerca non dipende da come l'agente digita gli accenti.
export const normalize = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const FUSE_PRONTUARIO_OPTIONS = {
  threshold: 0.35,
  minMatchCharLength: 3,
  includeScore: true,
  ignoreLocation: true,
  keys: [
    { name: 'titolo', weight: 0.4 },
    { name: 'descrizione', weight: 0.3 },
    { name: 'rif_normativo', weight: 0.2 },
    { name: 'articolo_numero', weight: 0.1 },
  ],
};

const FUSE_NORMATIVA_OPTIONS = {
  threshold: 0.35,
  minMatchCharLength: 3,
  includeScore: true,
  ignoreLocation: true,
  keys: [
    { name: 'testo', weight: 0.4 },
    { name: 'titolo_articolo', weight: 0.3 },
    { name: 'titolo', weight: 0.2 },
    { name: 'articolo', weight: 0.1 },
  ],
};

// Trova i target (codice_caso / id) che matchano la query tra i sinonimi attivi.
// Match bidirezionale (termine include query, o query include termine) così
// funziona sia digitando parole parziali sia frasi più lunghe del sinonimo salvato.
function matchSynonymTargets(rawQuery, synonyms, targetType) {
  const q = normalize(rawQuery);
  if (!q || !synonyms?.length) return [];
  const matches = [];
  for (const syn of synonyms) {
    if (syn.target_type !== targetType) continue;
    const termine = normalize(syn.termine);
    if (termine && (termine.includes(q) || q.includes(termine))) {
      matches.push({ target_ref: syn.target_ref, peso: syn.peso || 0 });
    }
  }
  const byTarget = new Map();
  matches.forEach(m => {
    const existing = byTarget.get(m.target_ref);
    if (!existing || m.peso > existing.peso) byTarget.set(m.target_ref, m);
  });
  return Array.from(byTarget.values()).sort((a, b) => b.peso - a.peso);
}

// ─── PRONTUARIO ────────────────────────────────────────────────────────────
export function createProntuarioSearchIndex(list = [], synonyms = []) {
  const fuse = new Fuse(list, FUSE_PRONTUARIO_OPTIONS);

  return {
    search(rawQuery, minChars = MIN_SEARCH_CHARS) {
      const q = normalize(rawQuery);
      if (q.length < minChars) return { exact: [], suggested: [], other: [] };

      const isNumeric = /^\d+$/.test(q);

      // 1. Numero articolo esatto
      if (isNumeric) {
        const exactItems = list.filter(item => (item.articolo_numero || '').toString().trim() === q);
        if (exactItems.length > 0) return { exact: groupByArticolo(exactItems), suggested: [], other: [] };
      }

      // 2. Sinonimi — solo per query testuali (i numeri sono già gestiti sopra)
      let suggested = [];
      if (!isNumeric) {
        const synMatches = matchSynonymTargets(rawQuery, synonyms, 'prontuario');
        if (synMatches.length > 0) {
          const refs = new Set(synMatches.map(m => m.target_ref));
          const suggestedItems = list.filter(item => refs.has(item.codice_caso));
          suggested = groupByArticolo(suggestedItems).map(g => ({ ...g, isSuggested: true }));
        }
      }
      const suggestedIds = new Set(suggested.flatMap(g => g.voci.map(v => v.id)));

      // 3. Testo esatto (accenti normalizzati)
      const textMatchIds = new Set();
      list.forEach(item => {
        const haystack = normalize(
          `${item.titolo || ''} ${item.descrizione || ''} ${item.rif_normativo || ''} ${item.codice_violazione || ''} ${item.codice_caso || ''}`
        );
        if (haystack.includes(q)) textMatchIds.add(item.id);
      });

      // 4. Fuzzy sui rimanenti
      const fuseResults = fuse.search(q);

      const allItems = [
        ...list.filter(item => textMatchIds.has(item.id)),
        ...fuseResults.map(r => r.item).filter(item => !textMatchIds.has(item.id)),
      ].filter(item => !suggestedIds.has(item.id));

      return { exact: [], suggested, other: groupByArticolo(allItems) };
    },
  };
}

// ─── NORMATIVA ─────────────────────────────────────────────────────────────
function buildNormativaGroups(items) {
  const map = new Map();
  items.forEach(item => {
    const key = item.articolo_num;
    if (key == null) return;
    if (!map.has(key)) {
      map.set(key, {
        articolo_num: key,
        articolo: item.articolo,
        titolo_articolo: item.titolo_articolo || item.titolo || '',
        commi: [],
      });
    }
    map.get(key).commi.push(item);
  });
  map.forEach(g => g.commi.sort((a, b) => (a.comma_num || 0) - (b.comma_num || 0)));
  return Array.from(map.values()).sort((a, b) => (a.articolo_num || 0) - (b.articolo_num || 0));
}

export function createNormativaSearchIndex(list = [], synonyms = []) {
  const fuse = new Fuse(list, FUSE_NORMATIVA_OPTIONS);

  return {
    search(rawQuery, minChars = MIN_SEARCH_CHARS) {
      const q = normalize(rawQuery);
      if (q.length < minChars) return { exact: [], suggested: [], other: [] };

      const isNumeric = /^\d+$/.test(q);

      if (isNumeric) {
        const exactItems = list.filter(item => String(item.articolo_num ?? '') === q);
        if (exactItems.length > 0) return { exact: buildNormativaGroups(exactItems), suggested: [], other: [] };
      }

      // Sinonimi per normativa: schema pronto (target_type='normativa'), nessun
      // dato ancora seedato — il motore li userà automaticamente appena presenti.
      let suggested = [];
      if (!isNumeric) {
        const synMatches = matchSynonymTargets(rawQuery, synonyms, 'normativa');
        if (synMatches.length > 0) {
          const refs = new Set(synMatches.map(m => m.target_ref));
          const suggestedItems = list.filter(item => refs.has(String(item.id)) || refs.has(String(item.articolo_num)));
          suggested = buildNormativaGroups(suggestedItems).map(g => ({ ...g, isSuggested: true }));
        }
      }
      const suggestedIds = new Set(suggested.flatMap(g => g.commi.map(v => v.id)));

      const textMatchIds = new Set();
      list.forEach(item => {
        const haystack = normalize(
          `${item.titolo_articolo || item.titolo || ''} ${item.testo || ''} ${item.articolo || ''} ${item.comma || ''}`
        );
        if (haystack.includes(q)) textMatchIds.add(item.id);
      });

      const fuseResults = fuse.search(q);
      const allItems = [
        ...list.filter(item => textMatchIds.has(item.id)),
        ...fuseResults.map(r => r.item).filter(item => !textMatchIds.has(item.id)),
      ].filter(item => !suggestedIds.has(item.id));

      return { exact: [], suggested, other: buildNormativaGroups(allItems) };
    },
  };
}
