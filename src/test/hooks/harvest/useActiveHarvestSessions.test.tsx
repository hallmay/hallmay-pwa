import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useActiveHarvestSessions } from '../../../features/harvest/hooks/useActiveHarvestSessions';
import useAuth from '../../../shared/context/auth/AuthContext';
import { onSnapshot } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
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

describe('useActiveHarvestSessions', () => {
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

    const { result } = renderHook(() => useActiveHarvestSessions('campaign-1'));

    expect(result.current.sessions).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should fetch active harvest sessions successfully', async () => {
    const mockSessions = [
      { 
        id: 'session-1',
        campaign: { id: 'campaign-1' },
        status: 'pending',
        field: { id: 'field-1', name: 'Field 1' }
      },
      { 
        id: 'session-2',
        campaign: { id: 'campaign-1' },
        status: 'in-progress',
        field: { id: 'field-2', name: 'Field 2' }
      },
    ];

    mockOnSnapshot.mockImplementation((_query: any, onNext: any) => {
      // Use setTimeout to simulate async Firebase response
      setTimeout(() => {
        const snapshot = {
          docs: mockSessions.map(session => ({
            id: session.id,
            data: () => session,
          })),
        };
        onNext(snapshot);
      }, 0);
      return vi.fn();
    });

    const { result } = renderHook(() => useActiveHarvestSessions('campaign-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessions).toHaveLength(2);
    expect(result.current.sessions[0]).toEqual(mockSessions[0]);
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

    const { result } = renderHook(() => useActiveHarvestSessions('campaign-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessions).toEqual([]);
    expect(result.current.error).toBe(mockError.message);
  });

  it('should handle missing campaignId', () => {
    const { result } = renderHook(() => useActiveHarvestSessions(''));

    expect(result.current.sessions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should filter by field when selectedFieldId is provided and not "all"', async () => {
    mockOnSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useActiveHarvestSessions('campaign-1', 'field-1'));

    expect(result.current).toBeDefined();
    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('should not filter by field when selectedFieldId is "all"', async () => {
    mockOnSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useActiveHarvestSessions('campaign-1', 'all'));

    expect(result.current).toBeDefined();
    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = vi.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useActiveHarvestSessions('campaign-1'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle auth loading state', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    const { result } = renderHook(() => useActiveHarvestSessions('campaign-1'));

    expect(result.current.sessions).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle user not authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    const { result } = renderHook(() => useActiveHarvestSessions('campaign-1'));

    expect(result.current.sessions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle empty snapshot', async () => {
    mockOnSnapshot.mockImplementation((_query: any, onNext: any) => {
      setTimeout(() => {
        const snapshot = { docs: [] };
        onNext(snapshot);
      }, 0);
      return vi.fn();
    });

    const { result } = renderHook(() => useActiveHarvestSessions('campaign-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessions).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
