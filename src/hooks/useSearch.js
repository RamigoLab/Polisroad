import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Custom hook che centralizza la logica di ricerca per Prontuario e Normativa.
 * Restituisce risultati RAGGRUPPATI per articolo e PRIORITIZZATI:
 *   1. Corrispondenza esatta sull'articolo (es. "186" → Art. 186 con tutte le casistiche/commi)
 *   2. Occorrenze testuali dentro altri articoli
 *
 * @param {Array} prontuarioList   Lista voci prontuario.
 * @param {Array} normativaList    Lista commi normativa.
 * @param {number} minChars        Minimo caratteri per attivare la ricerca (default 3).
 */
export const useSearch = (prontuarioList = [], normativaList = [], minChars = 3) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const isSearching = debouncedSearch.length > 0 && debouncedSearch.length < minChars;

  // ─── PRONTUARIO ──────────────────────────────────────────────────────────
  // Raggruppa voci per articolo_numero e separa in exact (art. corrispondente)
  // e other (voci che contengono il termine nel testo ma non sono l'articolo cercato)
  const risultatiProntuario = useMemo(() => {
    if (debouncedSearch.length < minChars) return { exact: [], other: [] };

    const s = debouncedSearch.trim().toLowerCase();
    const isNumeric = /^\d+$/.test(s);
    const terms = s.split(/\s+/).filter(Boolean);

    // Raggruppa tutte le voci per articolo_numero
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

    const exact = [];   // gruppi il cui articolo_numero corrisponde esattamente
    const other = [];   // gruppi che matchano nel testo

    groupMap.forEach(group => {
      const artNum = group.articolo_numero.toLowerCase();

      if (isNumeric && artNum === s) {
        // Corrispondenza esatta: include tutte le voci del gruppo
        exact.push(group);
        return;
      }

      // Cerca il termine nel testo delle voci del gruppo
      const matchingVoci = group.voci.filter(item => {
        const text = `${item.titolo || ''} ${item.descrizione || ''} ${item.rif_normativo || ''}`.toLowerCase();
        return terms.every(term => text.includes(term));
      });

      if (matchingVoci.length > 0) {
        other.push({ ...group, voci: matchingVoci });
      }
    });

    // Ordina per numero articolo
    const sortGroups = arr => arr.sort((a, b) => {
      const nA = parseInt((a.articolo_numero || '').replace(/\D/g, ''), 10) || 0;
      const nB = parseInt((b.articolo_numero || '').replace(/\D/g, ''), 10) || 0;
      return nA - nB;
    });

    return { exact: sortGroups(exact), other: sortGroups(other) };
  }, [debouncedSearch, prontuarioList, minChars]);

  // ─── NORMATIVA ───────────────────────────────────────────────────────────
  // Raggruppa commi per articolo_num e separa in exact e other
  const risultatiNormativa = useMemo(() => {
    if (debouncedSearch.length < minChars) return { exact: [], other: [] };

    const s = debouncedSearch.trim().toLowerCase();
    const isNumeric = /^\d+$/.test(s);
    const terms = s.split(/\s+/).filter(Boolean);

    // Raggruppa commi per articolo
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

    // Ordina i commi dentro ogni gruppo
    groupMap.forEach(group => {
      group.commi.sort((a, b) => (a.comma_num || 0) - (b.comma_num || 0));
    });

    const exact = [];
    const other = [];

    groupMap.forEach(group => {
      const artNum = group.articolo_num?.toString() || '';

      if (isNumeric && artNum === s) {
        // Corrispondenza esatta: mostra tutti i commi
        exact.push(group);
        return;
      }

      // Cerca il termine nel testo dei commi o nel titolo
      const matchingCommi = group.commi.filter(item => {
        const text = `${item.titolo_articolo || ''} ${item.titolo || ''} ${item.testo || ''} ${item.articolo || ''}`.toLowerCase();
        return terms.every(term => text.includes(term));
      });

      if (matchingCommi.length > 0) {
        other.push({ ...group, commi: matchingCommi });
      }
    });

    const sortGroups = arr => arr.sort((a, b) => (a.articolo_num || 0) - (b.articolo_num || 0));
    return { exact: sortGroups(exact), other: sortGroups(other) };
  }, [debouncedSearch, normativaList, minChars]);

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
