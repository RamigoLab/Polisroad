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
const mockItems = [
  { id: 'p1', titolo: 'Guida in stato di ebbrezza', articolo_numero: '186' },
  { id: 'p2', titolo: 'Eccesso di velocità', articolo_numero: '142' },
];

vi.mock('../../context/DataContext', () => ({
  useData: () => ({ prontuario: mockItems, loading: false }),
  QUERY_KEYS: { prontuario: ['prontuario'] },
}));

// ─── Mock services ───────────────────────────────────────────────────────────
const mockAdd    = vi.fn().mockResolvedValue({ id: 'p3', titolo: 'Nuovo' });
const mockUpdate = vi.fn().mockResolvedValue(undefined);
const mockDelete = vi.fn().mockResolvedValue(undefined);

vi.mock('../../services/prontuarioService', () => ({
  addProntuarioItem:    (...args) => mockAdd(...args),
  updateProntuarioItem: (...args) => mockUpdate(...args),
  deleteProntuarioItem: (...args) => mockDelete(...args),
  getPreferiti:   vi.fn().mockResolvedValue([]),
  addPreferito:   vi.fn().mockResolvedValue(undefined),
  removePreferito: vi.fn().mockResolvedValue(undefined),
}));

let mockUseSupabase = true;
vi.mock('../../config/constants', () => ({
  get USE_SUPABASE() { return mockUseSupabase; },
}));
vi.mock('../../utils/logger', () => ({ logger: { error: vi.fn() } }));

import { useProntuario } from '../useProntuario';

describe('useProntuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetQueryData.mockReturnValue(mockItems);
    mockUseSupabase = true;
  });

  it('espone la lista dalla cache', () => {
    const { result } = renderHook(() => useProntuario());
    expect(result.current.list).toEqual(mockItems);
    expect(result.current.loading).toBe(false);
  });

  it('add — chiama service e aggiunge alla cache', async () => {
    const { result } = renderHook(() => useProntuario());
    await act(async () => {
      const { error } = await result.current.add({ titolo: 'Nuovo', articolo_numero: '1' });
      expect(error).toBeNull();
    });
    expect(mockAdd).toHaveBeenCalledWith({ titolo: 'Nuovo', articolo_numero: '1' });
    expect(mockSetQueryData).toHaveBeenCalled();
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('update — aggiornamento ottimistico e chiamata service', async () => {
    const { result } = renderHook(() => useProntuario());
    await act(async () => {
      const { error } = await result.current.update('p1', { titolo: 'Modificato' });
      expect(error).toBeNull();
    });
    expect(mockUpdate).toHaveBeenCalledWith('p1', { titolo: 'Modificato' });
  });

  it('remove — rimozione ottimistica e chiamata service', async () => {
    const { result } = renderHook(() => useProntuario());
    await act(async () => {
      const { error } = await result.current.remove('p1');
      expect(error).toBeNull();
    });
    expect(mockDelete).toHaveBeenCalledWith('p1');
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('add — modalità mock quando USE_SUPABASE=false', async () => {
    mockUseSupabase = false;
    const { result } = renderHook(() => useProntuario());
    await act(async () => {
      const { error } = await result.current.add({ titolo: 'Mock' });
      expect(error).toBeNull();
    });
    // Non chiama il service reale
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('update — rollback cache su errore', async () => {
    const previous = [...mockItems];
    mockGetQueryData.mockReturnValueOnce(previous);
    mockUpdate.mockRejectedValueOnce(new Error('network fail'));
    const { result } = renderHook(() => useProntuario());
    await act(async () => {
      await result.current.update('p1', { titolo: 'X' });
    });
    expect(mockSetQueryData).toHaveBeenCalledWith(['prontuario'], previous);
  });

  it('remove — rollback cache su errore', async () => {
    const previous = [...mockItems];
    mockGetQueryData.mockReturnValueOnce(previous);
    mockDelete.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useProntuario());
    await act(async () => {
      await result.current.remove('p1');
    });
    expect(mockSetQueryData).toHaveBeenCalledWith(['prontuario'], previous);
  });
});
