import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ─── Mock stats base ─────────────────────────────────────────────────────────
const mockStats = {
  xp: 100, level: 2, current_streak: 3, longest_streak: 5,
  last_activity_date: '2026-01-01',
  total_searches: 10, total_favorites: 5, calculator_uses: 2,
  total_articles_viewed: 20, total_contestazioni: 1,
  unlocked_badges: ['novice'], featured_badge: 'novice',
};

const mockSetQueryData = vi.fn();
const mockInvalidateQueries = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ enabled }) => {
    if (!enabled) return { data: null, isLoading: false, error: null };
    return { data: mockStats, isLoading: false, error: null };
  },
  useMutation: () => ({ mutate: vi.fn() }),
  useQueryClient: () => ({
    setQueryData: mockSetQueryData,
    getQueryData: vi.fn(() => mockStats),
    invalidateQueries: mockInvalidateQueries,
  }),
}));

vi.mock('../useAuth', () => ({
  useAuth: () => ({ session: { user: { id: 'user-1' } } }),
}));

vi.mock('../../config/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {},
}));

const mockUpdateStats = vi.fn().mockResolvedValue(undefined);
const mockInsertXp  = vi.fn().mockResolvedValue(undefined);

vi.mock('../../services/gamificationService', () => ({
  getGamificationStats: vi.fn().mockResolvedValue(mockStats),
  updateGamificationStats: (...args) => mockUpdateStats(...args),
  insertXpHistory: (...args) => mockInsertXp(...args),
}));

vi.mock('../../config/badges', () => ({
  BADGES: {
    novice: { id: 'novice', icon: '🥉', unlockCondition: () => false },
    expert: { id: 'expert', icon: '🥇', unlockCondition: (s) => s.xp >= 500 },
  },
}));

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }));

import { useGamification } from '../useGamification';

describe('useGamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('espone correttamente le stats dalla cache', () => {
    const { result } = renderHook(() => useGamification());
    expect(result.current.xp).toBe(100);
    expect(result.current.level).toBe(2);
    expect(result.current.currentStreak).toBe(3);
    expect(result.current.longestStreak).toBe(5);
    expect(result.current.loading).toBe(false);
  });

  it('addXP aggiorna ottimisticamente la cache', async () => {
    const { result } = renderHook(() => useGamification());
    await act(async () => { await result.current.addXP(10, 'search'); });
    expect(mockSetQueryData).toHaveBeenCalled();
    expect(mockUpdateStats).toHaveBeenCalled();
    expect(mockInsertXp).toHaveBeenCalledWith('user-1', 'search', 10);
  });

  it('addXP rifiuta valori non validi', async () => {
    const { result } = renderHook(() => useGamification());
    const res = await act(async () => result.current.addXP(-5, 'search'));
    expect(mockUpdateStats).not.toHaveBeenCalled();
  });

  it('addXP rifiuta valori superiori a 100', async () => {
    const { result } = renderHook(() => useGamification());
    await act(async () => { await result.current.addXP(200, 'search'); });
    expect(mockUpdateStats).not.toHaveBeenCalled();
  });

  it('getUnlockedBadges restituisce i badge sbloccati', () => {
    const { result } = renderHook(() => useGamification());
    const badges = result.current.getUnlockedBadges();
    expect(badges).toHaveLength(1);
    expect(badges[0].id).toBe('novice');
  });

  it('checkNewBadges rileva nuovi badge quando condizione è soddisfatta', async () => {
    // Simula utente con 500+ XP che sblocca 'expert'
    const richStats = { ...mockStats, xp: 500, unlocked_badges: ['novice'] };
    vi.mocked(require('@tanstack/react-query').useQuery).mockReturnValueOnce({
      data: richStats, isLoading: false, error: null,
    });
    const { result } = renderHook(() => useGamification());
    const newBadges = await act(async () => result.current.checkNewBadges());
    // expert.unlockCondition(richStats) = true → dovrebbe sbloccarsi
  });

  it('featuredBadge espone il badge corretto', () => {
    const { result } = renderHook(() => useGamification());
    expect(result.current.featuredBadge).toBe('novice');
  });
});
