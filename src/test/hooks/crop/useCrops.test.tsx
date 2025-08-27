import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCrops } from '../../../shared/hooks/crop/useCrops';
import useAuth from '../../../shared/context/auth/AuthContext';
import { onSnapshot } from 'firebase/firestore';
import { createSecurityQuery } from '../../../shared/firebase/queryBuilder';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
}));

// Mock Firebase config
vi.mock('../../../shared/firebase/firebase', () => ({
  db: {},
}));

// Mock Auth context
vi.mock('../../../shared/context/auth/AuthContext');

// Mock queryBuilder
vi.mock('../../../shared/firebase/queryBuilder', () => ({
  createSecurityQuery: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockOnSnapshot = onSnapshot as ReturnType<typeof vi.fn>;
const mockCreateSecurityQuery = createSecurityQuery as ReturnType<typeof vi.fn>;

describe('useCrops', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the query builder chain
    mockCreateSecurityQuery.mockReturnValue({
      build: vi.fn().mockReturnValue([]),
    });
  });

  it('should return initial state', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    const { result } = renderHook(() => useCrops());

    expect(result.current.crops).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false when auth is not loading but user is null', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    const { result } = renderHook(() => useCrops());

    expect(result.current.crops).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch crops when user is authenticated', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockCrops = [
      {
        id: 'crop1',
        name: 'Soja',
        variety: 'GM 4.0',
      },
      {
        id: 'crop2',
        name: 'Maíz',
        variety: 'P1870',
      },
    ];

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockImplementation((_query, onSuccess) => {
      setTimeout(() => {
        onSuccess({
          docs: mockCrops.map(crop => ({
            id: crop.id,
            data: () => ({
              name: crop.name,
              variety: crop.variety,
            }),
          })),
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useCrops());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.crops).toEqual([
      {
        id: 'crop1',
        name: 'Soja',
        variety: 'GM 4.0',
      },
      {
        id: 'crop2',
        name: 'Maíz',
        variety: 'P1870',
      },
    ]);
    expect(result.current.error).toBeNull();
    expect(mockCreateSecurityQuery).toHaveBeenCalledWith(mockUser);
  });

  it('should handle query error', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockImplementation((_query, _onSuccess, onError) => {
      setTimeout(() => {
        onError(new Error('Firestore error'));
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useCrops());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.crops).toEqual([]);
    expect(result.current.error).toBe('Firestore error');
  });

  it('should cleanup subscription on unmount', () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useCrops());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle empty crops list', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockImplementation((_query, onSuccess) => {
      setTimeout(() => {
        onSuccess({
          docs: [],
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useCrops());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.crops).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
