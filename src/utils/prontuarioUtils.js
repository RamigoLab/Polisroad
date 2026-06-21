/**
 * Utility condivise per ordinamento e raggruppamento del Prontuario.
 * Usate da Prontuario.jsx, useSearch.js e chiunque lavori con voci prontuario.
 */

// Estrae il numero intero da stringhe tipo "142bis", "186" → 142, 186
export const parseArticoloNum = (str) =>
  parseInt((str || '').replace(/\D/g, ''), 10) || 0;

// Suffisso ordinato: bis < ter < quater < quinquies < altro
export const sortSuffix = (str) => {
  const s = (str || '').replace(/\d/g, '').toLowerCase();
  return ({ '': 0, bis: 1, ter: 2, quater: 3, quinquies: 4 })[s] ?? 99;
};

// Ordina voci per numero articolo → suffisso → codice_caso
export const sortItems = (items) =>
  [...items].sort((a, b) => {
    const nA = parseArticoloNum(a.articolo_numero);
    const nB = parseArticoloNum(b.articolo_numero);
    if (nA !== nB) return nA - nB;
    const sA = sortSuffix(a.articolo_numero);
    const sB = sortSuffix(b.articolo_numero);
    if (sA !== sB) return sA - sB;
    return (a.codice_caso || '').localeCompare(b.codice_caso || '', undefined, { numeric: true });
  });

// Raggruppa voci ordinate per articolo_numero
export const groupByArticolo = (items) => {
  const map = new Map();
  sortItems(items).forEach(item => {
    const key = (item.articolo_numero || 'N.D.').trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return Array.from(map.entries()).map(([articolo_numero, voci]) => ({
    articolo_numero,
    label: `Art. ${articolo_numero}`,
    titolo: voci[0]?.articolo_nome || voci[0]?.titolo || '',
    count: voci.length,
    voci,
  }));
};
