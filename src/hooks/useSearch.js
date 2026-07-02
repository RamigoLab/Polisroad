import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { useData } from '../context/DataContext';
import {
  createProntuarioSearchIndex,
  createNormativaSearchIndex,
  MIN_SEARCH_CHARS,
} from '../utils/searchEngine';

/**
 * useSearch — ricerca su Prontuario e Normativa per la Ricerca Globale.
 *
 * Usa lo stesso motore (searchEngine.js) di Prontuario.jsx e Normativa.jsx:
 * stessa soglia minima, stesso algoritmo (esatto → sinonimi → testo → fuzzy),
 * così il comportamento è identico ovunque nell'app (v1.9.8).
 */
export const useSearch = (prontuarioList = [], normativaList = [], minChars = MIN_SEARCH_CHARS) => {
  const { searchSynonyms = [] } = useData();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const isSearching = debouncedSearch.length > 0 && debouncedSearch.length < minChars;

  // true tra la digitazione e l'arrivo del valore "debounced" — usato per
  // mostrare uno spinner nella SearchBar mentre l'utente sta ancora scrivendo.
  const isPending = search.trim().length >= minChars && search !== debouncedSearch;

  const prontuarioIndex = useMemo(
    () => createProntuarioSearchIndex(prontuarioList, searchSynonyms),
    [prontuarioList, searchSynonyms]
  );

  const normativaIndex = useMemo(
    () => createNormativaSearchIndex(normativaList, searchSynonyms),
    [normativaList, searchSynonyms]
  );

  const risultatiProntuario = useMemo(
    () => prontuarioIndex.search(debouncedSearch, minChars),
    [debouncedSearch, prontuarioIndex, minChars]
  );

  const risultatiNormativa = useMemo(
    () => normativaIndex.search(debouncedSearch, minChars),
    [debouncedSearch, normativaIndex, minChars]
  );

  const total =
    risultatiProntuario.exact.length + risultatiProntuario.suggested.length + risultatiProntuario.other.length +
    risultatiNormativa.exact.length + risultatiNormativa.suggested.length + risultatiNormativa.other.length;

  return {
    search,
    setSearch,
    risultatiProntuario,
    risultatiNormativa,
    total,
    isSearching,
    isPending,
  };
};
