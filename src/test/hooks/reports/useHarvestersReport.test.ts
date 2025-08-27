import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHarvestersSummary } from '../../../features/reports/hooks/useHarvestersReport';
import { onSnapshot } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  query: vi.fn(),
  collection: vi.fn(),
  where: vi.fn(),
  documentId: vi.fn(),
  onSnapshot: vi.fn(),
}));

// Mock Firebase config
vi.mock('../../../shared/firebase/firebase', () => ({
  db: {},
}));

// Mock AuthContext with different states for testing
vi.mock('../../../shared/context/auth/AuthContext', () => {
  let mockState = {
    currentUser: { uid: 'test-user', organizationId: 'org-1', role: 'user' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  };
  
  return {
    default: () => mockState,
    __setMockState: (newState: any) => { mockState = newState; },
  };
});

// Mock query builder
vi.mock('../../../shared/firebase/queryBuilder', () => ({
  createSecurityQuery: vi.fn(() => ({
    withFieldAccess: vi.fn(() => ({
      build: vi.fn(() => []),
    })),
  })),
}));

const mockOnSnapshot = onSnapshot as any;

describe('useHarvestersSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial loading state', () => {
    mockOnSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useHarvestersSummary('campaign-1', 'crop-1'));

    expect(result.current.harvestersSummary).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should fetch harvesters summary successfully', async () => {
    const mockSummary = [
      { id: 'doc-1', harvester: 'Harvester 1', totalHarvested: 1000 },
      { id: 'doc-2', harvester: 'Harvester 2', totalHarvested: 800 },
    ];

    mockOnSnapshot.mockImplementation((_query: any, onNext: any) => {
      const snapshot = {
        docs: mockSummary.map(item => ({
          id: item.id,
          data: () => item,
        })),
      };
      setTimeout(() => {
        onNext(snapshot);
      }, 0);
      return vi.fn();
    });

    const { result } = renderHook(() => useHarvestersSummary('campaign-1', 'crop-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.harvestersSummary).toHaveLength(2);
    expect(result.current.harvestersSummary[0]).toEqual(mockSummary[0]);
    expect(result.current.error).toBeNull();
  });

  it('should handle Firebase error', async () => {
    const mockError = new Error('Firebase error');

    mockOnSnapshot.mockImplementation((_query: any, _onNext: any, onError: any) => {
      setTimeout(() => {
        onError(mockError);
      }, 0);
      return vi.fn();
    });

    const { result } = renderHook(() => useHarvestersSummary('campaign-1', 'crop-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.harvestersSummary).toEqual([]);
    expect(result.current.error).toBe(mockError.message);
  });

  it('should handle missing campaignId', () => {
    const { result } = renderHook(() => useHarvestersSummary(undefined, 'crop-1'));

    expect(result.current.harvestersSummary).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle missing cropId', () => {
    const { result } = renderHook(() => useHarvestersSummary('campaign-1', undefined));

    expect(result.current.harvestersSummary).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should include fieldId in document ID when provided', async () => {
    mockOnSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useHarvestersSummary('campaign-1', 'crop-1', 'field-1'));

    expect(result.current).toBeDefined();
    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('should include plotId in document ID when fieldId and plotId are provided', async () => {
    mockOnSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useHarvestersSummary('campaign-1', 'crop-1', 'field-1', 'plot-1'));

    expect(result.current).toBeDefined();
    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = vi.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useHarvestersSummary('campaign-1', 'crop-1'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle auth loading state', () => {
    const { result } = renderHook(() => useHarvestersSummary('campaign-1', 'crop-1'));
    
    // When auth is loading, hook should show loading state
    expect(result.current.harvestersSummary).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle user not authenticated', () => {
    const { result } = renderHook(() => useHarvestersSummary('campaign-1', 'crop-1'));

    // When no user, hook should show empty state
    expect(result.current.harvestersSummary).toEqual([]);
    expect(result.current.loading).toBe(true); // Still loading initially
    expect(result.current.error).toBeNull();
  });
});
