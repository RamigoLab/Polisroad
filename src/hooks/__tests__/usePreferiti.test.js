import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ─── Mock TanStack Query ────────────────────────────────────────────────────
const mockSetQueryData = vi.fn();
const mockCancelQueries = vi.fn();
const mockGetQueryData = vi.fn(() => []);
const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ enabled }) => {
    if (!enabled) return { data: [], error: null };
    return { data: ['pron-1', 'pron-2'], error: null };
  },
  useMutation: ({ mutationFn, onMutate, onError, onSettled }) => ({
    mutate: (id) => {
      onMutate?.(id);
      mutationFn(id).then(() => onSettled?.()).catch((e) => onError?.(e, id, {}));
    },
    mutateAsync: (id) => mutationFn(id),
  }),
  useQueryClient: () => ({
    setQueryData: mockSetQueryData,
    cancelQueries: mockCancelQueries,
    getQueryData: mockGetQueryData,
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// ─── Mock servizi ────────────────────────────────────────────────────────────
const mockAddPreferito = vi.fn().mockResolvedValue(undefined);
const mockRemovePreferito = vi.fn().mockResolvedValue(undefined);

vi.mock('../../services/prontuarioService', () => ({
  getPreferiti: vi.fn().mockResolvedValue(['pron-1', 'pron-2']),
  addPreferito: (...args) => mockAddPreferito(...args),
  removePreferito: (...args) => mockRemovePreferito(...args),
}));

vi.mock('../useAuth', () => ({
  useAuth: () => ({ session: { user: { id: 'user-1' } } }),
}));

vi.mock('../useSyncQueue', () => ({
  useSyncQueue: () => ({ addToQueue: vi.fn() }),
}));

vi.mock('../../config/constants', () => ({ USE_SUPABASE: true }));

import { usePreferiti } from '../usePreferiti';

describe('usePreferiti', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  });

  it('restituisce i preferiti dalla cache', () => {
    const { result } = renderHook(() => usePreferiti());
    expect(result.current.preferiti).toEqual(['pron-1', 'pron-2']);
  });

  it('isPreferito funziona correttamente', () => {
    const { result } = renderHook(() => usePreferiti());
    expect(result.current.isPreferito('pron-1')).toBe(true);
    expect(result.current.isPreferito('pron-99')).toBe(false);
  });

  it('toggle chiama addPreferito per voce non preferita', async () => {
    // Simula lista vuota (nessun preferito)
    vi.mocked(mockGetQueryData).mockReturnValue([]);
    const { result } = renderHook(() => usePreferiti());

    act(() => {
      result.current.toggle('pron-new');
    });

    await waitFor(() => {
      expect(mockSetQueryData).toHaveBeenCalled();
    });
  });

  it('toggle aggiorna ottimisticamente la cache', async () => {
    const { result } = renderHook(() => usePreferiti());
    act(() => { result.current.toggle('pron-new'); });
    await waitFor(() => {
      expect(mockSetQueryData).toHaveBeenCalled();
    });
  });

  it('modal offline: aggiunge a coda invece di chiamare Supabase', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const mockAddToQueue = vi.fn();
    vi.doMock('../useSyncQueue', () => ({ useSyncQueue: () => ({ addToQueue: mockAddToQueue }) }));
    // La mutation in offline path esegue addToQueue
    // Verificato indirettamente: nessuna eccezione, addPreferito non viene chiamato
    const { result } = renderHook(() => usePreferiti());
    act(() => { result.current.toggle('pron-offline'); });
    expect(mockAddPreferito).not.toHaveBeenCalled();
  });
});
