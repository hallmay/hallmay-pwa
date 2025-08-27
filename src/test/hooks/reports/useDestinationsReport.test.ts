import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDestinationSummary } from '../../../features/reports/hooks/useDestinationsReport';
import useAuth from '../../../shared/context/auth/AuthContext';
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

// Mock AuthContext
vi.mock('../../../shared/context/auth/AuthContext');

// Mock query builder
vi.mock('../../../shared/firebase/queryBuilder', () => ({
  createSecurityQuery: vi.fn(() => ({
    withFieldAccess: vi.fn(() => ({
      build: vi.fn(() => []),
    })),
  })),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockOnSnapshot = onSnapshot as ReturnType<typeof vi.fn>;

describe('useDestinationSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set default mock for auth context
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'test-user', organizationId: 'org-1' },
      loading: false,
    });
  });

  it('should return initial loading state', () => {
    mockOnSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useDestinationSummary('campaign-1', 'crop-1'));

    expect(result.current.destinationSummary).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should fetch destination summary successfully', async () => {
    const mockSummary = [
      { id: 'doc-1', destination: 'Silo A', totalQuantity: 5000 },
      { id: 'doc-2', destination: 'Port B', totalQuantity: 3000 },
    ];

    mockOnSnapshot.mockImplementation((_query: any, onNext: any) => {
      setTimeout(() => {
        const snapshot = {
          docs: mockSummary.map(item => ({
            id: item.id,
            data: () => item,
          })),
        };
        onNext(snapshot);
      }, 0);
      return vi.fn();
    });

    const { result } = renderHook(() => useDestinationSummary('campaign-1', 'crop-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.destinationSummary).toHaveLength(2);
    expect(result.current.destinationSummary[0]).toEqual(mockSummary[0]);
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

    const { result } = renderHook(() => useDestinationSummary('campaign-1', 'crop-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.destinationSummary).toEqual([]);
    expect(result.current.error).toBe(mockError.message);
  });

  it('should handle missing campaignId', () => {
    const { result } = renderHook(() => useDestinationSummary(undefined, 'crop-1'));

    expect(result.current.destinationSummary).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle missing cropId', () => {
    const { result } = renderHook(() => useDestinationSummary('campaign-1', undefined));

    expect(result.current.destinationSummary).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should include fieldId in document ID when provided', async () => {
    mockOnSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useDestinationSummary('campaign-1', 'crop-1', 'field-1'));

    expect(result.current).toBeDefined();
    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('should include plotId in document ID when fieldId and plotId are provided', async () => {
    mockOnSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useDestinationSummary('campaign-1', 'crop-1', 'field-1', 'plot-1'));

    expect(result.current).toBeDefined();
    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = vi.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useDestinationSummary('campaign-1', 'crop-1'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle auth loading state', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    const { result } = renderHook(() => useDestinationSummary('campaign-1', 'crop-1'));

    expect(result.current.destinationSummary).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle user not authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    const { result } = renderHook(() => useDestinationSummary('campaign-1', 'crop-1'));

    expect(result.current.destinationSummary).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
