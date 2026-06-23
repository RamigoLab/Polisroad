import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSyncQueue } from '../useSyncQueue';

vi.mock('../useAuth', () => ({
  useAuth: () => ({ session: { user: { id: 'test-user-id' } } }),
}));

const mockShowToast = vi.fn();
vi.mock('../../components/ui/ToastManager', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock('../../config/supabase', () => ({
  supabase: {
    from: () => ({
      delete: () => ({ match: vi.fn().mockResolvedValue({ error: null }) }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

describe('useSyncQueue', () => {
  beforeEach(() => {
    localStorage.clear();
    mockShowToast.mockClear();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  });

  it('inizializza con coda vuota', () => {
    const { result } = renderHook(() => useSyncQueue());
    expect(result.current.queue).toEqual([]);
    expect(result.current.isOnline).toBe(true);
  });

  it('aggiunge SAVE_NOTE alla coda', () => {
    const { result } = renderHook(() => useSyncQueue());
    act(() => {
      result.current.addToQueue('SAVE_NOTE', { prontuarioId: 1, testo: 'Nota test' });
    });
    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0].type).toBe('SAVE_NOTE');
    expect(result.current.queue[0].payload).toEqual({ prontuarioId: 1, testo: 'Nota test' });
    expect(result.current.queue[0].attempts).toBe(0);
  });

  it('aggiunge TOGGLE_PREFERITO alla coda', () => {
    const { result } = renderHook(() => useSyncQueue());
    act(() => {
      result.current.addToQueue('TOGGLE_PREFERITO', { prontuarioId: 42, action: 'add' });
    });
    expect(result.current.queue[0].type).toBe('TOGGLE_PREFERITO');
    expect(result.current.queue[0].payload.action).toBe('add');
  });

  it('aggiunge SAVE_CONTESTAZIONE alla coda', () => {
    const { result } = renderHook(() => useSyncQueue());
    act(() => {
      result.current.addToQueue('SAVE_CONTESTAZIONE', { prontuarioId: 7, xp: 20 });
    });
    expect(result.current.queue[0].type).toBe('SAVE_CONTESTAZIONE');
    expect(result.current.queue[0].payload.xp).toBe(20);
  });

  it('persiste in localStorage', () => {
    const { result } = renderHook(() => useSyncQueue());
    act(() => {
      result.current.addToQueue('SAVE_NOTE', { prontuarioId: 1, testo: 'Test' });
    });
    const saved = JSON.parse(localStorage.getItem('polisroad_sync_queue'));
    expect(saved).toHaveLength(1);
    expect(saved[0].type).toBe('SAVE_NOTE');
  });

  it('mostra toast di avviso quando aggiunge in coda', () => {
    const { result } = renderHook(() => useSyncQueue());
    act(() => {
      result.current.addToQueue('TOGGLE_PREFERITO', { prontuarioId: 1, action: 'add' });
    });
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringContaining('Offline'),
      'warning'
    );
  });

  it('carica la coda esistente da localStorage all\'avvio', () => {
    const existing = [{
      id: 'existing-1', type: 'SAVE_NOTE',
      payload: { prontuarioId: 99, testo: 'Old note' },
      timestamp: Date.now(), attempts: 0,
    }];
    localStorage.setItem('polisroad_sync_queue', JSON.stringify(existing));
    const { result } = renderHook(() => useSyncQueue());
    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0].payload.prontuarioId).toBe(99);
  });

  it('più azioni si accumulano in coda', () => {
    const { result } = renderHook(() => useSyncQueue());
    act(() => {
      result.current.addToQueue('SAVE_NOTE', { prontuarioId: 1, testo: 'a' });
      result.current.addToQueue('TOGGLE_PREFERITO', { prontuarioId: 2, action: 'add' });
      result.current.addToQueue('SAVE_CONTESTAZIONE', { prontuarioId: 3, xp: 20 });
    });
    expect(result.current.queue).toHaveLength(3);
  });
});
