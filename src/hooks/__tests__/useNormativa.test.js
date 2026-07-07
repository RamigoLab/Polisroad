import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ─── Mock TanStack Query ─────────────────────────────────────────────────────
const mockSetQueryData = vi.fn();
const mockCancelQueries = vi.fn();
const mockGetQueryData = vi.fn(() => []);
const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useMutation: ({ mutationFn, onMutate, onError, onSettled, onSuccess }) => ({
    mutate: vi.fn(),
    mutateAsync: async (vars) => {
      const ctx = await onMutate?.(vars);
      try {
        const result = await mutationFn(vars);
        onSuccess?.(result);
        onSettled?.();
        return result;
      } catch (e) {
        onError?.(e, vars, ctx);
        onSettled?.();
        throw e;
      }
    },
  }),
  useQueryClient: () => ({
    setQueryData: mockSetQueryData,
    cancelQueries: mockCancelQueries,
    getQueryData: mockGetQueryData,
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// ─── Mock DataContext ────────────────────────────────────────────────────────
const mockList = [
  { id: 'n1', articolo: 'Art. 1', testo: 'Testo articolo 1' },
  { id: 'n2', articolo: 'Art. 2', testo: 'Testo articolo 2' },
];

vi.mock('../../context/DataContext', () => ({
  useData: () => ({ normativa: mockList, loading: false }),
  QUERY_KEYS: { normativa: ['normativa'] },
}));

// ─── Mock services ───────────────────────────────────────────────────────────
const mockAdd    = vi.fn().mockResolvedValue({ id: 'n3', articolo: 'Art. 3' });
const mockUpdate = vi.fn().mockResolvedValue(undefined);
const mockDelete = vi.fn().mockResolvedValue(undefined);

vi.mock('../../services/normativaService', () => ({
  addNormativa:    (...args) => mockAdd(...args),
  updateNormativa: (...args) => mockUpdate(...args),
  deleteNormativa: (...args) => mockDelete(...args),
}));

vi.mock('../../config/constants', () => ({ USE_SUPABASE: true }));
vi.mock('../../utils/logger', () => ({ logger: { error: vi.fn() } }));

import { useNormativa } from '../useNormativa';

describe('useNormativa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetQueryData.mockReturnValue(mockList);
  });

  it('espone la lista dalla cache', () => {
    const { result } = renderHook(() => useNormativa());
    expect(result.current.list).toEqual(mockList);
    expect(result.current.loading).toBe(false);
  });

  it('add — chiama il service e aggiorna la cache', async () => {
    const { result } = renderHook(() => useNormativa());
    await act(async () => {
      const { error } = await result.current.add({ articolo: 'Art. 3' });
      expect(error).toBeNull();
    });
    expect(mockAdd).toHaveBeenCalledWith({ articolo: 'Art. 3' });
    expect(mockSetQueryData).toHaveBeenCalled();
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('update — aggiornamento ottimistico e chiamata service', async () => {
    const { result } = renderHook(() => useNormativa());
    await act(async () => {
      const { error } = await result.current.update('n1', { testo: 'Nuovo testo' });
      expect(error).toBeNull();
    });
    expect(mockUpdate).toHaveBeenCalledWith('n1', { testo: 'Nuovo testo' });
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('remove — rimozione ottimistica e chiamata service', async () => {
    const { result } = renderHook(() => useNormativa());
    await act(async () => {
      const { error } = await result.current.remove('n1');
      expect(error).toBeNull();
    });
    expect(mockDelete).toHaveBeenCalledWith('n1');
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('add — gestisce errore e lo restituisce', async () => {
    mockAdd.mockRejectedValueOnce(new Error('DB error'));
    const { result } = renderHook(() => useNormativa());
    await act(async () => {
      const { error } = await result.current.add({ articolo: 'Art. X' });
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('DB error');
    });
  });

  it('update — rollback cache su errore', async () => {
    const previous = [...mockList];
    mockGetQueryData.mockReturnValueOnce(previous);
    mockUpdate.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useNormativa());
    await act(async () => {
      await result.current.update('n1', { testo: 'X' });
    });
    expect(mockSetQueryData).toHaveBeenCalledWith(['normativa'], previous);
  });
});
