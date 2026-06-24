import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useDebounce } from './useDebounce';
import { parseArticoloNum } from '../utils/prontuarioUtils';

/**
 * useSearch — ricerca fuzzy su Prontuario e Normativa tramite Fuse.js.
 *
 * Logica di priorità:
 *  1. Corrispondenza esatta sull'articolo (es. "186" → tutte le voci/commi di Art. 186)
 *  2. Risultati fuzzy raggruppati per articolo, ordinati per rilevanza
 *
 * Fuse.js garantisce tolleranza a errori di battitura (threshold 0.35)
 * su tutti i campi testuali principali.
 */

// ─── Opzioni Fuse per il PRONTUARIO ──────────────────────────────────────────
const FUSE_PRONTUARIO_OPTIONS = {
  threshold: 0.35,         // tolleranza errori (0 = esatto, 1 = tutto)
  minMatchCharLength: 3,
  includeScore: true,
  ignoreLocation: true,    // cerca in tutto il testo, non solo all'inizio
  keys: [
    { name: 'titolo',          weight: 0.4 },
    { name: 'descrizione',     weight: 0.3 },
    { name: 'rif_normativo',   weight: 0.2 },
    { name: 'articolo_numero', weight: 0.1 },
  ],
};

// ─── Opzioni Fuse per la NORMATIVA ────────────────────────────────────────────
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

  // Istanze Fuse memorizzate — si ricalcolano solo se cambia la lista
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

    const s = debouncedSearch.trim();
    const isNumeric = /^\d+$/.test(s);

    // Corrispondenza esatta per numero articolo
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
      if (exactGroup) {
        return { exact: [exactGroup], other: [] };
      }
    }

    // Ricerca fuzzy
    const fuseResults = fuseProntuario.search(s);

    // Raggruppa per articolo_numero preservando ordine di rilevanza
    const groupMap = new Map();
    fuseResults.forEach(({ item }) => {
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

    const s = debouncedSearch.trim();
    const isNumeric = /^\d+$/.test(s);

    // Corrispondenza esatta per numero articolo
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

    // Ricerca fuzzy
    const fuseResults = fuseNormativa.search(s);

    const groupMap = new Map();
    fuseResults.forEach(({ item }) => {
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
