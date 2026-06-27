import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useDebounce } from './useDebounce';
import { parseArticoloNum } from '../utils/prontuarioUtils';

/**
 * useSearch — ricerca su Prontuario e Normativa.
 *
 * Logica unificata con Prontuario.jsx e Normativa.jsx:
 *  1. Numero articolo esatto (es. "186") → tutte le voci/commi di quell'articolo
 *  2. Ricerca testuale esatta con includes() su tutti i campi rilevanti
 *  3. Ricerca fuzzy Fuse.js come fallback per errori di battitura
 *
 * Questo garantisce risultati coerenti tra Ricerca Globale, Prontuario e Normativa.
 */

const FUSE_PRONTUARIO_OPTIONS = {
  threshold: 0.35,
  minMatchCharLength: 3,
  includeScore: true,
  ignoreLocation: true,
  keys: [
    { name: 'titolo',          weight: 0.4 },
    { name: 'descrizione',     weight: 0.3 },
    { name: 'rif_normativo',   weight: 0.2 },
    { name: 'articolo_numero', weight: 0.1 },
  ],
};

const FUSE_NORMATIVA_OPTIONS = {
  threshold: 0.35,
  minMatchCharLength: 3,
  includeScore: true,
  ignoreLocation: true,
  keys: [
    { name: 'testo',            weight: 0.4 },
    { name: 'titolo_articolo',  weight: 0.3 },
    { name: 'titolo',           weight: 0.2 },
    { name: 'articolo',         weight: 0.1 },
  ],
};

export const useSearch = (prontuarioList = [], normativaList = [], minChars = 3) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const isSearching = debouncedSearch.length > 0 && debouncedSearch.length < minChars;

  const fuseProntuario = useMemo(
    () => new Fuse(prontuarioList, FUSE_PRONTUARIO_OPTIONS),
    [prontuarioList]
  );

  const fuseNormativa = useMemo(
    () => new Fuse(normativaList, FUSE_NORMATIVA_OPTIONS),
    [normativaList]
  );

  // ─── PRONTUARIO ──────────────────────────────────────────────────────────
  const risultatiProntuario = useMemo(() => {
    if (debouncedSearch.length < minChars) return { exact: [], other: [] };

    const s = debouncedSearch.trim().toLowerCase();
    const isNumeric = /^\d+$/.test(s);

    // 1. Corrispondenza esatta numero articolo
    if (isNumeric) {
      const groupMap = new Map();
      prontuarioList.forEach(item => {
        const key = (item.articolo_numero || 'N.D.').trim();
        if (!groupMap.has(key)) {
          groupMap.set(key, {
            articolo_numero: key,
            label: `Art. ${key}`,
            titolo: item.articolo_nome || item.titolo || '',
            voci: [],
          });
        }
        groupMap.get(key).voci.push(item);
      });
      const exactGroup = groupMap.get(s);
      if (exactGroup) return { exact: [exactGroup], other: [] };
    }

    // 2. Ricerca testuale esatta (includes) — stessa logica di Prontuario.jsx
    const textMatchIds = new Set();
    prontuarioList.forEach(item => {
      const titolo = (item.titolo || '').toLowerCase();
      const rifNorm = (item.rif_normativo || '').toLowerCase();
      const codice = (item.codice_violazione || '').toLowerCase();
      const descrizione = (item.descrizione || '').toLowerCase();
      if (
        titolo.includes(s) ||
        rifNorm.includes(s) ||
        codice.includes(s) ||
        descrizione.includes(s)
      ) {
        textMatchIds.add(item.id);
      }
    });

    // 3. Fuzzy su quelli non trovati per testo esatto
    const fuseResults = fuseProntuario.search(s);
    const fuseIds = new Set(fuseResults.map(r => r.item.id));

    // Unione: testo esatto + fuzzy, senza duplicati
    const allItems = [
      ...prontuarioList.filter(item => textMatchIds.has(item.id)),
      ...fuseResults.map(r => r.item).filter(item => !textMatchIds.has(item.id)),
    ];

    // Raggruppa per articolo
    const groupMap = new Map();
    allItems.forEach(item => {
      const key = (item.articolo_numero || 'N.D.').trim();
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          articolo_numero: key,
          label: `Art. ${key}`,
          titolo: item.articolo_nome || item.titolo || '',
          voci: [],
        });
      }
      groupMap.get(key).voci.push(item);
    });

    const other = Array.from(groupMap.values()).sort((a, b) =>
      parseArticoloNum(a.articolo_numero) - parseArticoloNum(b.articolo_numero)
    );

    return { exact: [], other };
  }, [debouncedSearch, prontuarioList, fuseProntuario, minChars]);

  // ─── NORMATIVA ───────────────────────────────────────────────────────────
  const risultatiNormativa = useMemo(() => {
    if (debouncedSearch.length < minChars) return { exact: [], other: [] };

    const s = debouncedSearch.trim().toLowerCase();
    const isNumeric = /^\d+$/.test(s);

    // 1. Corrispondenza esatta numero articolo
    if (isNumeric) {
      const groupMap = new Map();
      normativaList.forEach(item => {
        const key = item.articolo_num;
        if (key == null) return;
        if (!groupMap.has(key)) {
          groupMap.set(key, {
            articolo_num: key,
            articolo: item.articolo,
            titolo_articolo: item.titolo_articolo || item.titolo || '',
            commi: [],
          });
        }
        groupMap.get(key).commi.push(item);
      });
      const exactGroup = groupMap.get(Number(s)) || groupMap.get(s);
      if (exactGroup) {
        exactGroup.commi.sort((a, b) => (a.comma_num || 0) - (b.comma_num || 0));
        return { exact: [exactGroup], other: [] };
      }
    }

    // 2. Ricerca testuale esatta — stessa logica di Normativa.jsx
    const textMatchIds = new Set();
    normativaList.forEach(item => {
      const titolo = (item.titolo_articolo || item.titolo || '').toLowerCase();
      const testo = (item.testo || '').toLowerCase();
      const articolo = (item.articolo || '').toLowerCase();
      const comma = (item.comma || '').toLowerCase();
      if (
        titolo.includes(s) ||
        testo.includes(s) ||
        articolo.includes(s) ||
        comma.includes(s)
      ) {
        textMatchIds.add(item.id);
      }
    });

    // 3. Fuzzy su quelli non trovati per testo esatto
    const fuseResults = fuseNormativa.search(s);

    const allItems = [
      ...normativaList.filter(item => textMatchIds.has(item.id)),
      ...fuseResults.map(r => r.item).filter(item => !textMatchIds.has(item.id)),
    ];

    const groupMap = new Map();
    allItems.forEach(item => {
      const key = item.articolo_num;
      if (key == null) return;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          articolo_num: key,
          articolo: item.articolo,
          titolo_articolo: item.titolo_articolo || item.titolo || '',
          commi: [],
        });
      }
      groupMap.get(key).commi.push(item);
    });

    groupMap.forEach(group => {
      group.commi.sort((a, b) => (a.comma_num || 0) - (b.comma_num || 0));
    });

    const other = Array.from(groupMap.values()).sort(
      (a, b) => (a.articolo_num || 0) - (b.articolo_num || 0)
    );

    return { exact: [], other };
  }, [debouncedSearch, normativaList, fuseNormativa, minChars]);

  const total =
    risultatiProntuario.exact.length + risultatiProntuario.other.length +
    risultatiNormativa.exact.length + risultatiNormativa.other.length;

  return {
    search,
    setSearch,
    risultatiProntuario,
    risultatiNormativa,
    total,
    isSearching,
  };
};
