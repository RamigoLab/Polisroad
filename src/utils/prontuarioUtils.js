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
export const sortItems = (items) => {
  // Ottimizzazione: precalcola le chiavi di ordinamento per evitare di 
  // rieseguire regex e conversioni ad ogni confronto (Schwartzian transform).
  const mapped = items.map(item => ({
    item,
    num: parseArticoloNum(item.articolo_numero),
    suf: sortSuffix(item.articolo_numero),
    cod: item.codice_caso || ''
  }));

  mapped.sort((a, b) => {
    if (a.num !== b.num) return a.num - b.num;
    if (a.suf !== b.suf) return a.suf - b.suf;
    return a.cod.localeCompare(b.cod, undefined, { numeric: true });
  });

  return mapped.map(m => m.item);
};

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
