import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../useSearch';

// Mock useDebounce to return value immediately
vi.mock('../useDebounce', () => ({
  useDebounce: (value) => value,
}));

describe('useSearch Hook', () => {
  const mockProntuario = [
    { id: 1, articolo_numero: '186', titolo: 'Guida in stato di ebbrezza', descrizione: 'Sotto l influenza dell alcool', rif_normativo: 'Art. 186, comma 2' },
    { id: 2, articolo_numero: '186', titolo: 'Guida in stato di ebbrezza (recidiva)', descrizione: 'Recidiva alcool', rif_normativo: 'Art. 186, comma 2-bis' },
    { id: 3, articolo_numero: '141', titolo: 'Velocità non regolata', descrizione: 'Velocità pericolosa in curva', rif_normativo: 'Art. 141' },
  ];

  const mockNormativa = [
    { id: 10, articolo_num: 186, articolo: 'Art. 186.', titolo_articolo: 'Guida sotto l influenza dell alcool', comma: '1.', comma_num: 1, testo: 'Chiunque guida in stato di ebbrezza...' },
    { id: 11, articolo_num: 186, articolo: 'Art. 186.', titolo_articolo: 'Guida sotto l influenza dell alcool', comma: '2.', comma_num: 2, testo: 'Chiunque guida con tasso alcolemico superiore...' },
    { id: 12, articolo_num: 141, articolo: 'Art. 141.', titolo_articolo: 'Velocità', comma: '1.', comma_num: 1, testo: 'Il conducente deve sempre regolare la velocità...' },
  ];

  it('dovrebbe restituire risultati vuoti inizialmente', () => {
    const { result } = renderHook(() => useSearch(mockProntuario, mockNormativa));
    expect(result.current.search).toBe('');
    expect(result.current.risultatiProntuario).toEqual({ exact: [], other: [] });
    expect(result.current.risultatiNormativa).toEqual({ exact: [], other: [] });
    expect(result.current.total).toBe(0);
    expect(result.current.isSearching).toBe(false);
  });

  it('non dovrebbe cercare con meno di minChars caratteri', () => {
    const { result } = renderHook(() => useSearch(mockProntuario, mockNormativa, 3));
    act(() => { result.current.setSearch('gu'); });
    expect(result.current.risultatiProntuario).toEqual({ exact: [], other: [] });
    expect(result.current.risultatiNormativa).toEqual({ exact: [], other: [] });
    expect(result.current.total).toBe(0);
    expect(result.current.isSearching).toBe(true);
  });

  it('ricerca numerica esatta: "186" → gruppo esatto in prontuario e normativa', () => {
    const { result } = renderHook(() => useSearch(mockProntuario, mockNormativa, 3));
    act(() => { result.current.setSearch('186'); });

    // Prontuario: esatto ha il gruppo Art. 186 con 2 voci
    expect(result.current.risultatiProntuario.exact.length).toBe(1);
    expect(result.current.risultatiProntuario.exact[0].articolo_numero).toBe('186');
    expect(result.current.risultatiProntuario.exact[0].voci.length).toBe(2);
    expect(result.current.risultatiProntuario.other.length).toBe(0);

    // Normativa: esatto ha il gruppo art. 186 con 2 commi
    expect(result.current.risultatiNormativa.exact.length).toBe(1);
    expect(result.current.risultatiNormativa.exact[0].articolo_num).toBe(186);
    expect(result.current.risultatiNormativa.exact[0].commi.length).toBe(2);
    expect(result.current.risultatiNormativa.other.length).toBe(0);

    expect(result.current.total).toBe(2); // 1 gruppo prontuario + 1 gruppo normativa
  });

  it('ricerca testuale: "alcool" → nessun esatto, voci corrette in other', () => {
    const { result } = renderHook(() => useSearch(mockProntuario, mockNormativa, 3));
    act(() => { result.current.setSearch('alcool'); });

    expect(result.current.risultatiProntuario.exact.length).toBe(0);
    expect(result.current.risultatiProntuario.other.length).toBe(1);
    expect(result.current.risultatiProntuario.other[0].articolo_numero).toBe('186');

    expect(result.current.risultatiNormativa.exact.length).toBe(0);
    expect(result.current.risultatiNormativa.other.length).toBe(1);
    expect(result.current.risultatiNormativa.other[0].articolo_num).toBe(186);
  });

  it('ricerca case-insensitive', () => {
    const { result } = renderHook(() => useSearch(mockProntuario, mockNormativa, 3));
    act(() => { result.current.setSearch('VELOCITÀ'); });
    expect(result.current.risultatiProntuario.other.length).toBe(1);
    expect(result.current.risultatiNormativa.other.length).toBe(1);
  });
});
