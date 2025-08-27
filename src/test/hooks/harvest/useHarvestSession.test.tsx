import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHarvestSession } from '../../../features/harvest/hooks/useHarvestSession';
import useAuth from '../../../shared/context/auth/AuthContext';
import { onSnapshot } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  onSnapshot: vi.fn(),
}));

// Mock Firebase config
vi.mock('../../../shared/firebase/firebase', () => ({
  db: {},
}));

// Mock AuthContext
vi.mock('../../../shared/context/auth/AuthContext');

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockOnSnapshot = onSnapshot as ReturnType<typeof vi.fn>;

describe('useHarvestSession', () => {
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

    const { result } = renderHook(() => useHarvestSession('session-1'));

    expect(result.current.session).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.setSession).toBeDefined();
  });

  it('should fetch harvest session successfully', async () => {
    const mockSession = {
      id: 'session-1',
      campaign: { id: 'campaign-1' },
      status: 'pending',
      field: { id: 'field-1', name: 'Field 1' },
      harvester: { id: 'harvester-1', name: 'Harvester 1' }
    };

    mockOnSnapshot.mockImplementation((_docRef: any, onNext: any) => {
      setTimeout(() => {
        const docSnap = {
          exists: () => true,
          id: mockSession.id,
          data: () => mockSession,
        };
        onNext(docSnap);
      }, 0);
      return vi.fn();
    });

    const { result } = renderHook(() => useHarvestSession('session-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.error).toBeNull();
  });

  it('should handle document not found', async () => {
    mockOnSnapshot.mockImplementation((_docRef: any, onNext: any) => {
      setTimeout(() => {
        const docSnap = {
          exists: () => false,
        };
        onNext(docSnap);
      }, 0);
      return vi.fn();
    });

    const { result } = renderHook(() => useHarvestSession('non-existent'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.error).toBe('La sesión de cosecha no fue encontrada.');
  });

  it('should handle Firebase error', async () => {
    const mockError = new Error('Firebase error');

    mockOnSnapshot.mockImplementation((_docRef: any, _onNext: any, onError: any) => {
      setTimeout(() => {
        onError(mockError);
      }, 0);
      return vi.fn();
    });

    const { result } = renderHook(() => useHarvestSession('session-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.error).toBe(mockError.message);
  });

  it('should handle missing harvestSessionId', () => {
    const { result } = renderHook(() => useHarvestSession(''));

    expect(result.current.session).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = vi.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useHarvestSession('session-1'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle auth loading state', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    const { result } = renderHook(() => useHarvestSession('session-1'));

    expect(result.current.session).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle user not authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    const { result } = renderHook(() => useHarvestSession('session-1'));

    expect(result.current.session).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should provide setSession function for external updates', () => {
    mockOnSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useHarvestSession('session-1'));

    expect(typeof result.current.setSession).toBe('function');
  });
});
