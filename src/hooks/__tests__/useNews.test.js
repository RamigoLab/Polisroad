import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ─── Mock TanStack Query ─────────────────────────────────────────────────────
const mockSetQueryData = vi.fn();
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
    cancelQueries: vi.fn(),
    getQueryData: mockGetQueryData,
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// ─── Mock DataContext ────────────────────────────────────────────────────────
const mockNewsList = [
  { id: 'news1', titolo: 'Novità CdS', pubblicato: true },
  { id: 'news2', titolo: 'Aggiornamento', pubblicato: false },
];

vi.mock('../../context/DataContext', () => ({
  useData: () => ({ news: mockNewsList, loading: false }),
  QUERY_KEYS: { news: ['news'] },
}));

// ─── Mock services ───────────────────────────────────────────────────────────
const mockAdd    = vi.fn().mockResolvedValue({ id: 'news3', titolo: 'Nuova' });
const mockUpdate = vi.fn().mockResolvedValue(undefined);
const mockDelete = vi.fn().mockResolvedValue(undefined);

vi.mock('../../services/newsService', () => ({
  addNews:    (...args) => mockAdd(...args),
  updateNews: (...args) => mockUpdate(...args),
  deleteNews: (...args) => mockDelete(...args),
}));

let mockUseSupabase = true;
vi.mock('../../config/constants', () => ({
  get USE_SUPABASE() { return mockUseSupabase; },
}));
vi.mock('../../utils/logger', () => ({ logger: { error: vi.fn() } }));

import { useNews } from '../useNews';

describe('useNews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetQueryData.mockReturnValue(mockNewsList);
    mockUseSupabase = true;
  });

  it('espone la lista dalla cache', () => {
    const { result } = renderHook(() => useNews());
    expect(result.current.list).toEqual(mockNewsList);
    expect(result.current.loading).toBe(false);
  });

  it('add — chiama service e prepend alla cache', async () => {
    const { result } = renderHook(() => useNews());
    await act(async () => {
      const { error } = await result.current.add({ titolo: 'Nuova' });
      expect(error).toBeNull();
    });
    expect(mockAdd).toHaveBeenCalledWith({ titolo: 'Nuova' });
    expect(mockSetQueryData).toHaveBeenCalled();
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('update — aggiornamento ottimistico', async () => {
    const { result } = renderHook(() => useNews());
    await act(async () => {
      const { error } = await result.current.update('news1', { titolo: 'Aggiornato' });
      expect(error).toBeNull();
    });
    expect(mockUpdate).toHaveBeenCalledWith('news1', { titolo: 'Aggiornato' });
  });

  it('remove — rimozione ottimistica', async () => {
    const { result } = renderHook(() => useNews());
    await act(async () => {
      const { error } = await result.current.remove('news1');
      expect(error).toBeNull();
    });
    expect(mockDelete).toHaveBeenCalledWith('news1');
  });

  it('add — modalità mock (USE_SUPABASE=false)', async () => {
    mockUseSupabase = false;
    const { result } = renderHook(() => useNews());
    await act(async () => {
      const { error } = await result.current.add({ titolo: 'Mock' });
      expect(error).toBeNull();
    });
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('remove — rollback cache su errore', async () => {
    const previous = [...mockNewsList];
    mockGetQueryData.mockReturnValueOnce(previous);
    mockDelete.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useNews());
    await act(async () => {
      await result.current.remove('news1');
    });
    expect(mockSetQueryData).toHaveBeenCalledWith(['news'], previous);
  });
});
