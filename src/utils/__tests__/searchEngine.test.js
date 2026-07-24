import { describe, it, expect } from 'vitest';
import { createProntuarioSearchIndex, normalize } from '../searchEngine';

// Prima di questo file, searchEngine.js non aveva NESSUN test diretto —
// solo copertura indiretta via useSearch.test.js (che mocka i sinonimi a
// vuoto). Qui testiamo in particolare il matching dei sinonimi, riscritto
// per essere indipendente dall'ordine delle parole (v2.0.3).
describe('searchEngine — normalize', () => {
  it('rimuove accenti e uniforma maiuscole/spazi', () => {
    expect(normalize('  Perché VELOCITÀ ')).toBe('perche velocita');
  });
});

describe('searchEngine — matching sinonimi (prontuario)', () => {
  const list = [
    { id: 1, articolo_numero: '193', codice_caso: '193-1', titolo: 'Circolazione senza assicurazione', descrizione: '', rif_normativo: 'Art. 193' },
    { id: 2, articolo_numero: '173', codice_caso: '173-2', titolo: 'Uso del telefono alla guida', descrizione: '', rif_normativo: 'Art. 173' },
    { id: 3, articolo_numero: '141', codice_caso: '141-1', titolo: 'Velocità pericolosa', descrizione: '', rif_normativo: 'Art. 141' },
  ];

  const synonyms = [
    { termine: 'senza assicurazione', target_type: 'prontuario', target_ref: '193-1', peso: 10, attivo: true },
    { termine: 'telefono alla guida', target_type: 'prontuario', target_ref: '173-2', peso: 10, attivo: true },
    { termine: 'cellulare alla guida', target_type: 'prontuario', target_ref: '173-2', peso: 8, attivo: true },
  ];

  it('trova il sinonimo con corrispondenza esatta', () => {
    const idx = createProntuarioSearchIndex(list, synonyms);
    const res = idx.search('senza assicurazione');
    expect(res.suggested.length).toBe(1);
    expect(res.suggested[0].articolo_numero).toBe('193');
  });

  it('trova il sinonimo anche con parole in ordine diverso o con parole di mezzo diverse (fix v2.0.3)', () => {
    const idx = createProntuarioSearchIndex(list, synonyms);
    // "telefono guida" NON è salvato letteralmente — solo "telefono ALLA guida"
    const res = idx.search('telefono guida');
    expect(res.suggested.length).toBe(1);
    expect(res.suggested[0].articolo_numero).toBe('173');
  });

  it('trova il sinonimo anche a parole invertite', () => {
    const idx = createProntuarioSearchIndex(list, synonyms);
    const res = idx.search('guida telefono');
    expect(res.suggested.length).toBe(1);
    expect(res.suggested[0].articolo_numero).toBe('173');
  });

  it('non produce falsi positivi tra articoli diversi', () => {
    const idx = createProntuarioSearchIndex(list, synonyms);
    const res = idx.search('velocità pericolosa');
    // "velocità pericolosa" non è tra i sinonimi, ma matcha per testo esatto
    // sul titolo — non deve comparire come "suggested" da sinonimo.
    expect(res.suggested.length).toBe(0);
  });

  it('senza sinonimo mappato ("neopatentato"), il testo libero deve comunque trovare il titolo se lo contiene', () => {
    const listConNeopatentato = [
      ...list,
      { id: 4, articolo_numero: '117', codice_caso: '117-2', titolo: 'Conducente neopatentato oltre i limiti di velocità', descrizione: '', rif_normativo: 'Art. 117' },
    ];
    const idx = createProntuarioSearchIndex(listConNeopatentato, synonyms);
    const res = idx.search('neopatentato limiti');
    // Nessun sinonimo per "neopatentato" — deve arrivare dal fuzzy/testo, non da "suggested"
    expect(res.suggested.length).toBe(0);
    const foundIn117 = res.other.some(g => g.articolo_numero === '117');
    expect(foundIn117).toBe(true);
  });

  it('il campo "suggestions" è pronto per il menu a tendina (label/badge/item), max 5 voci', () => {
    const idx = createProntuarioSearchIndex(list, synonyms);
    const res = idx.search('telefono guida');
    expect(res.suggestions.length).toBeGreaterThan(0);
    expect(res.suggestions[0]).toHaveProperty('label');
    expect(res.suggestions[0]).toHaveProperty('badge');
    expect(res.suggestions[0]).toHaveProperty('icon', 'file-text');
    expect(res.suggestions[0].item.codice_caso).toBe('173-2');
    expect(res.suggestions.length).toBeLessThanOrEqual(5);
  });

  it('sotto la soglia minima di caratteri, "suggestions" resta vuoto', () => {
    const idx = createProntuarioSearchIndex(list, synonyms);
    const res = idx.search('te');
    expect(res.suggestions).toEqual([]);
  });
});
