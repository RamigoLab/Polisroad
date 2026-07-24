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

// Parole "vuote" italiane che non aiutano il match e anzi lo confondono
// (es. "telefono guida" deve trovare "telefono ALLA guida" ignorando "alla").
const STOPWORDS = new Set([
  'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
  'e', 'o', 'che', 'si', 'ha', 'ho', 'non',
  'al', 'allo', 'alla', 'ai', 'agli', 'alle',
  'del', 'dello', 'della', 'dei', 'degli', 'delle',
]);

const significantWords = (s) =>
  normalize(s).split(/\s+/).filter(w => w.length >= 2 && !STOPWORDS.has(w));

// Trova i target (codice_caso / id) che matchano la query tra i sinonimi attivi.
// Match a livello di PAROLA, non di frase intera: "telefono guida" deve trovare
// il sinonimo salvato "telefono alla guida" anche se l'ordine/le parole di mezzo
// non coincidono lettera per lettera. Resta bidirezionale (query più corta del
// sinonimo, o viceversa) per continuare a funzionare mentre l'agente digita
// solo un pezzo della frase o una frase più lunga di quella salvata.
function matchSynonymTargets(rawQuery, synonyms, targetType) {
  const q = normalize(rawQuery);
  if (!q || !synonyms?.length) return [];
  const qWords = significantWords(rawQuery);

  const matches = [];
  for (const syn of synonyms) {
    if (syn.target_type !== targetType) continue;
    const termine = normalize(syn.termine);
    if (!termine) continue;
    const tWords = significantWords(syn.termine);

    let isMatch;
    let overlap;
    if (qWords.length && tWords.length) {
      // Tutte le parole della query stanno nel sinonimo, o viceversa —
      // in qualsiasi ordine, ignorando le parole vuote in mezzo.
      const allQinT = qWords.every(w => termine.includes(w));
      const allTinQ = tWords.every(w => q.includes(w));
      isMatch = allQinT || allTinQ;
      overlap = allQinT ? qWords.length / tWords.length : tWords.length / qWords.length;
    } else {
      // Fallback per query/sinonimi troppo corti da tokenizzare (es. un
      // singolo frammento di parola): torna al substring semplice di prima.
      isMatch = termine.includes(q) || q.includes(termine);
      overlap = isMatch ? 1 : 0;
    }

    if (isMatch) matches.push({ target_ref: syn.target_ref, peso: syn.peso || 0, overlap });
  }

  const byTarget = new Map();
  matches.forEach(m => {
    const existing = byTarget.get(m.target_ref);
    // A parità di peso, preferisci il match con più parole in comune
    // (frase quasi identica batte una che condivide solo una parola).
    if (!existing || m.peso > existing.peso || (m.peso === existing.peso && m.overlap > existing.overlap)) {
      byTarget.set(m.target_ref, m);
    }
  });
  return Array.from(byTarget.values()).sort((a, b) => b.peso - a.peso || b.overlap - a.overlap);
}

const DROPDOWN_SUGGESTIONS_LIMIT = 5;

// Rimuove parentesi residue dai titoli normativa (stessa pulizia cosmetica
// che prima viveva solo dentro Normativa.jsx).
const cleanTitle = (title) => (title || '').replace(/^\s*\(\s*/, '').replace(/\s*\)\s*\.?\s*$/, '').trim();

// Appiattisce i gruppi di risultati (exact/suggested/other) in una lista
// pronta per il menu a tendina della SearchBar. Un solo posto che lo fa,
// così Ricerca Globale, Prontuario e Normative condividono la stessa logica
// invece di ricostruirla ciascuna a modo proprio nella pagina.
function buildDropdownSuggestions(groupsList, { getItems, dedupeKey, label, badge, icon }) {
  const seen = new Set();
  const out = [];
  for (const group of groupsList) {
    for (const item of getItems(group)) {
      const key = dedupeKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ label: label(item), badge: badge(item), icon, item });
      if (out.length >= DROPDOWN_SUGGESTIONS_LIMIT) return out;
    }
  }
  return out;
}

// ─── PRONTUARIO ────────────────────────────────────────────────────────────
export function createProntuarioSearchIndex(list = [], synonyms = []) {
  const fuse = new Fuse(list, FUSE_PRONTUARIO_OPTIONS);

  // Precalcola gli haystack normalizzati una sola volta qui, non ad ogni
  // ricerca: questa funzione viene già richiamata solo quando cambiano i
  // dati (vedi gli useMemo in useSearch.js/Prontuario.jsx/ecc.), quindi il
  // costo di normalize() per voce si paga una volta sola, non ad ogni
  // carattere digitato.
  const haystacks = new Map(
    list.map(item => [
      item.id,
      normalize(`${item.titolo || ''} ${item.descrizione || ''} ${item.rif_normativo || ''} ${item.codice_violazione || ''} ${item.codice_caso || ''}`),
    ])
  );

  const suggestionsFor = (groupsList) => buildDropdownSuggestions(groupsList, {
    getItems: g => g.voci,
    dedupeKey: item => item.id,
    label: item => item.titolo || item.articolo_nome || `Art. ${item.articolo_numero}`,
    badge: item => `Art. ${item.articolo_numero}`,
    icon: 'file-text',
  });

  return {
    search(rawQuery, minChars = MIN_SEARCH_CHARS) {
      const q = normalize(rawQuery);
      if (q.length < minChars) return { exact: [], suggested: [], other: [], suggestions: [] };

      const isNumeric = /^\d+$/.test(q);

      // 1. Numero articolo esatto
      if (isNumeric) {
        const exactItems = list.filter(item => (item.articolo_numero || '').toString().trim() === q);
        if (exactItems.length > 0) {
          const exact = groupByArticolo(exactItems);
          return { exact, suggested: [], other: [], suggestions: suggestionsFor(exact) };
        }
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

      // 3. Testo esatto (accenti normalizzati, haystack già precalcolato)
      const textMatchIds = new Set();
      list.forEach(item => {
        if (haystacks.get(item.id)?.includes(q)) textMatchIds.add(item.id);
      });

      // 4. Fuzzy sui rimanenti
      const fuseResults = fuse.search(q);

      const allItems = [
        ...list.filter(item => textMatchIds.has(item.id)),
        ...fuseResults.map(r => r.item).filter(item => !textMatchIds.has(item.id)),
      ].filter(item => !suggestedIds.has(item.id));

      const other = groupByArticolo(allItems);
      return { exact: [], suggested, other, suggestions: suggestionsFor([...suggested, ...other]) };
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

  // Stesso principio del prontuario: haystack precalcolati una sola volta.
  const haystacks = new Map(
    list.map(item => [
      item.id,
      normalize(`${item.titolo_articolo || item.titolo || ''} ${item.testo || ''} ${item.articolo || ''} ${item.comma || ''}`),
    ])
  );

  // Dedup per articolo_num, non per singolo comma: click su un suggerimento
  // porta sempre all'intero articolo (Normativa.jsx non ha un dettaglio per
  // singolo comma), quindi due commi dello stesso articolo devono contare
  // come un suggerimento solo, non due identici.
  const suggestionsFor = (groupsList) => buildDropdownSuggestions(groupsList, {
    getItems: g => g.commi,
    dedupeKey: item => item.articolo_num,
    label: item => cleanTitle(item.titolo_articolo || item.titolo) || `Art. ${item.articolo_num}`,
    badge: item => item.articolo || `Art. ${item.articolo_num}`,
    icon: 'book-open',
  });

  return {
    search(rawQuery, minChars = MIN_SEARCH_CHARS) {
      const q = normalize(rawQuery);
      if (q.length < minChars) return { exact: [], suggested: [], other: [], suggestions: [] };

      const isNumeric = /^\d+$/.test(q);

      if (isNumeric) {
        const exactItems = list.filter(item => String(item.articolo_num ?? '') === q);
        if (exactItems.length > 0) {
          const exact = buildNormativaGroups(exactItems);
          return { exact, suggested: [], other: [], suggestions: suggestionsFor(exact) };
        }
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
        if (haystacks.get(item.id)?.includes(q)) textMatchIds.add(item.id);
      });

      const fuseResults = fuse.search(q);
      const allItems = [
        ...list.filter(item => textMatchIds.has(item.id)),
        ...fuseResults.map(r => r.item).filter(item => !textMatchIds.has(item.id)),
      ].filter(item => !suggestedIds.has(item.id));

      const other = buildNormativaGroups(allItems);
      return { exact: [], suggested, other, suggestions: suggestionsFor([...suggested, ...other]) };
    },
  };
}
