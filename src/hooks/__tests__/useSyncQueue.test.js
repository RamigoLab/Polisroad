import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSyncQueue } from '../useSyncQueue';

// Mock dependency hooks
vi.mock('../useAuth', () => ({
  useAuth: () => ({
    session: { user: { id: 'test-user-id' } },
  }),
}));

const mockShowToast = vi.fn();
vi.mock('../../components/ui/ToastManager', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

describe('useSyncQueue Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    mockShowToast.mockClear();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  });

  it('should initialize with empty queue', () => {
    const { result } = renderHook(() => useSyncQueue());

    expect(result.current.queue).toEqual([]);
    expect(result.current.isOnline).toBe(true);
  });

  it('should add items to the queue correctly', () => {
    const { result } = renderHook(() => useSyncQueue());

    act(() => {
      result.current.addToQueue('SAVE_NOTE', { prontuarioId: 1, testo: 'Test note' });
    });

    expect(result.current.queue.length).toBe(1);
    expect(result.current.queue[0].type).toBe('SAVE_NOTE');
    expect(result.current.queue[0].payload).toEqual({ prontuarioId: 1, testo: 'Test note' });
    expect(mockShowToast).toHaveBeenCalledWith(
      'Offline: azione salvata in coda per la sincronizzazione.',
      'warning'
    );
    
    // Check localStorage persistence
    const saved = JSON.parse(localStorage.getItem('polisroad_sync_queue'));
    expect(saved.length).toBe(1);
    expect(saved[0].payload.testo).toBe('Test note');
  });
});
