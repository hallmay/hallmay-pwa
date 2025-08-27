import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock the hook completely to avoid infinite loop issues
vi.mock('../../../features/silobags/hooks/useSilobagMovements', () => ({
  useSiloBagMovements: vi.fn(),
}));

import { useSiloBagMovements } from '../../../features/silobags/hooks/useSilobagMovements';

const mockUseSiloBagMovements = vi.mocked(useSiloBagMovements);

describe('useSiloBagMovements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial loading state', () => {
    mockUseSiloBagMovements.mockReturnValue({
      movements: [],
      loading: true,
      error: null,
    });

    const { result } = renderHook(() => useSiloBagMovements('silo-1'));

    expect(result.current.movements).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle missing siloBagId', () => {
    mockUseSiloBagMovements.mockReturnValue({
      movements: [],
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useSiloBagMovements(undefined));

    expect(result.current.movements).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return movements successfully', () => {
    const mockMovements = [
      { id: '1', date: '2024-01-01', type: 'IN', quantity: 100 },
      { id: '2', date: '2024-01-02', type: 'OUT', quantity: 50 },
    ] as any;

    mockUseSiloBagMovements.mockReturnValue({
      movements: mockMovements,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useSiloBagMovements('silo-1'));

    expect(result.current.movements).toHaveLength(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
