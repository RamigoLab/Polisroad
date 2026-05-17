import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../useSearch';

// Mock the useDebounce hook to return the value immediately for tests
vi.mock('../useDebounce', () => ({
  useDebounce: (value) => value,
}));

describe('useSearch Hook', () => {
  const mockProntuario = [
    { id: 1, titolo: 'Guida in stato di ebbrezza', descrizione: 'Sotto l influenza dell alcool', rif_normativo: 'Art. 186' },
    { id: 2, titolo: 'Velocità non regolata', descrizione: 'Velocità pericolosa in curva', rif_normativo: 'Art. 141' },
  ];

  const mockNormativa = [
    { id: 10, articolo: 'Art. 186', titolo: 'Guida sotto l influenza dell alcool', testo: 'Chiunque guida in stato di ebbrezza...' },
    { id: 11, articolo: 'Art. 141', titolo: 'Velocità', testo: 'Il conducente deve sempre regolare la velocità...' },
  ];

  it('should return empty results initially', () => {
    const { result } = renderHook(() => useSearch(mockProntuario, mockNormativa));

    expect(result.current.search).toBe('');
    expect(result.current.risultatiProntuario).toEqual([]);
    expect(result.current.risultatiNormativa).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.isSearching).toBe(false);
  });

  it('should not perform search if input length is less than minChars', () => {
    const { result } = renderHook(() => useSearch(mockProntuario, mockNormativa, 3));

    act(() => {
      result.current.setSearch('gu');
    });

    expect(result.current.search).toBe('gu');
    expect(result.current.risultatiProntuario).toEqual([]);
    expect(result.current.risultatiNormativa).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.isSearching).toBe(true); // Flag active indicating search is typed but not minimum length
  });

  it('should return matches in both prontuario and normativa when matching query is entered', () => {
    const { result } = renderHook(() => useSearch(mockProntuario, mockNormativa, 3));

    act(() => {
      result.current.setSearch('alcool');
    });

    expect(result.current.search).toBe('alcool');
    expect(result.current.risultatiProntuario.length).toBe(1);
    expect(result.current.risultatiProntuario[0].id).toBe(1);
    expect(result.current.risultatiNormativa.length).toBe(1);
    expect(result.current.risultatiNormativa[0].id).toBe(10);
    expect(result.current.total).toBe(2);
    expect(result.current.isSearching).toBe(false);
  });

  it('should match case insensitively', () => {
    const { result } = renderHook(() => useSearch(mockProntuario, mockNormativa, 3));

    act(() => {
      result.current.setSearch('VELOCITÀ');
    });

    expect(result.current.risultatiProntuario.length).toBe(1);
    expect(result.current.risultatiNormativa.length).toBe(1);
    expect(result.current.total).toBe(2);
  });
});
