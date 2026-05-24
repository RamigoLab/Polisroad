import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Custom hook that centralises search logic for both Prontuario and Normativa.
 * It debounces the user input, applies a minimum character threshold and
 * returns memoised result arrays together with helper values.
 *
 * @param {Array} prontuarioList   List of prontuario objects.
 * @param {Array} normativaList    List of normativa objects.
 * @param {number} minChars       Minimum characters required to trigger a search (default 3).
 * @returns {{search:string, setSearch:function, risultatiProntuario:Array, risultatiNormativa:Array, total:number, isSearching:boolean}}
 */
export const useSearch = (prontuarioList = [], normativaList = [], minChars = 3) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const isSearching = debouncedSearch.length > 0 && debouncedSearch.length < minChars;

  const risultatiProntuario = useMemo(() => {
    if (debouncedSearch.length < minChars) return [];
    const terms = debouncedSearch.toLowerCase().split(/\s+/).filter(Boolean);
    return prontuarioList.filter(item => {
      const text = `${item.titolo || ''} ${item.descrizione || ''} ${item.rif_normativo || ''}`.toLowerCase();
      return terms.every(term => text.includes(term));
    });
  }, [debouncedSearch, prontuarioList, minChars]);

  const risultatiNormativa = useMemo(() => {
    if (debouncedSearch.length < minChars) return [];
    const terms = debouncedSearch.toLowerCase().split(/\s+/).filter(Boolean);
    return normativaList.filter(item => {
      const text = `${item.titolo || ''} ${item.titolo_articolo || ''} ${item.testo || ''} ${item.articolo || ''}`.toLowerCase();
      return terms.every(term => text.includes(term)) || (item.articolo_num && item.articolo_num.toString() === debouncedSearch);
    });
  }, [debouncedSearch, normativaList, minChars]);

  const total = risultatiProntuario.length + risultatiNormativa.length;

  return {
    search,
    setSearch,
    risultatiProntuario,
    risultatiNormativa,
    total,
    isSearching,
  };
};
