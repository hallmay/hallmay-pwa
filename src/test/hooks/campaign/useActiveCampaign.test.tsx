import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useActiveCampaign } from '../../../shared/hooks/campaign/useActiveCampaign';
import useAuth from '../../../shared/context/auth/AuthContext';
import { onSnapshot } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
}));

// Mock Firebase config
vi.mock('../../../shared/firebase/firebase', () => ({
  db: {},
}));

// Mock Auth context
vi.mock('../../../shared/context/auth/AuthContext');

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockOnSnapshot = onSnapshot as ReturnType<typeof vi.fn>;

describe('useActiveCampaign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    const { result } = renderHook(() => useActiveCampaign());

    expect(result.current.campaign).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should not query when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    renderHook(() => useActiveCampaign());

    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it('should not query when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    renderHook(() => useActiveCampaign());

    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it('should fetch active campaign when user is authenticated', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
    };

    const mockCampaign = {
      id: 'campaign1',
      name: 'Campaign 2024',
      active: true,
      organizationId: 'org123',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockImplementation((_query, onSuccess) => {
      // Simulate successful query
      setTimeout(() => {
        onSuccess({
          empty: false,
          docs: [{
            id: mockCampaign.id,
            data: () => ({
              name: mockCampaign.name,
              active: mockCampaign.active,
              organizationId: mockCampaign.organizationId,
            }),
          }],
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useActiveCampaign());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.campaign).toEqual({
      id: 'campaign1',
      name: 'Campaign 2024',
      active: true,
      organizationId: 'org123',
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle no active campaign found', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockImplementation((_query, onSuccess) => {
      setTimeout(() => {
        onSuccess({
          empty: true,
          docs: [],
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useActiveCampaign());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.campaign).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle query error', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockImplementation((_query, _onSuccess, onError) => {
      setTimeout(() => {
        onError(new Error('Network error'));
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useActiveCampaign());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.campaign).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should cleanup subscription on unmount', () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useActiveCampaign());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
