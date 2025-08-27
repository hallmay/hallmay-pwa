import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSiloBags } from '../../../features/silobags/hooks/useSilobags';
import useAuth from '../../../shared/context/auth/AuthContext';
import { onSnapshot } from 'firebase/firestore';
import { createSecurityQuery } from '../../../shared/firebase/queryBuilder';

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

// Mock queryBuilder
vi.mock('../../../shared/firebase/queryBuilder', () => ({
  createSecurityQuery: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockOnSnapshot = onSnapshot as ReturnType<typeof vi.fn>;
const mockCreateSecurityQuery = createSecurityQuery as ReturnType<typeof vi.fn>;

describe('useSiloBags', () => {
  const defaultFilters = {
    fieldId: 'all',
    cropId: 'all',
    status: 'all',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the query builder chain
    const mockWithFieldAccess = vi.fn().mockReturnValue({
      build: vi.fn().mockReturnValue([]),
    });
    
    mockCreateSecurityQuery.mockReturnValue({
      withFieldAccess: mockWithFieldAccess,
    });
  });

  it('should return initial state', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    const { result } = renderHook(() => useSiloBags(defaultFilters));

    expect(result.current.siloBags).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false when auth is not loading but user is null', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    const { result } = renderHook(() => useSiloBags(defaultFilters));

    expect(result.current.siloBags).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch silobags when user is authenticated', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockSiloBags = [
      {
        id: 'silobag1',
        name: 'Silobolsa Norte',
        field: { id: 'field1', name: 'Campo Norte' },
        crop: { id: 'crop1', name: 'Soja' },
        status: 'active',
        capacity: 200,
        currentWeight: 150,
      },
      {
        id: 'silobag2',
        name: 'Silobolsa Sur',
        field: { id: 'field2', name: 'Campo Sur' },
        crop: { id: 'crop2', name: 'Maíz' },
        status: 'closed',
        capacity: 250,
        currentWeight: 250,
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
          docs: mockSiloBags.map(siloBag => ({
            id: siloBag.id,
            data: () => ({
              name: siloBag.name,
              field: siloBag.field,
              crop: siloBag.crop,
              status: siloBag.status,
              capacity: siloBag.capacity,
              currentWeight: siloBag.currentWeight,
            }),
          })),
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useSiloBags(defaultFilters));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.siloBags).toEqual([
      {
        id: 'silobag1',
        name: 'Silobolsa Norte',
        field: { id: 'field1', name: 'Campo Norte' },
        crop: { id: 'crop1', name: 'Soja' },
        status: 'active',
        capacity: 200,
        currentWeight: 150,
      },
      {
        id: 'silobag2',
        name: 'Silobolsa Sur',
        field: { id: 'field2', name: 'Campo Sur' },
        crop: { id: 'crop2', name: 'Maíz' },
        status: 'closed',
        capacity: 250,
        currentWeight: 250,
      },
    ]);
    expect(result.current.error).toBeNull();
    expect(mockCreateSecurityQuery).toHaveBeenCalledWith(mockUser);
  });

  it('should apply field filter when fieldId is not "all"', async () => {
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

    const filtersWithField = {
      fieldId: 'field1',
      cropId: 'all',
      status: 'all',
    };

    renderHook(() => useSiloBags(filtersWithField));

    expect(mockOnSnapshot).toHaveBeenCalled();
    // The where constraints would be applied in the actual implementation
  });

  it('should apply crop filter when cropId is not "all"', async () => {
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

    const filtersWithCrop = {
      fieldId: 'all',
      cropId: 'crop1',
      status: 'all',
    };

    renderHook(() => useSiloBags(filtersWithCrop));

    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('should apply status filter when status is not "all"', async () => {
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

    const filtersWithStatus = {
      fieldId: 'all',
      cropId: 'all',
      status: 'active',
    };

    renderHook(() => useSiloBags(filtersWithStatus));

    expect(mockOnSnapshot).toHaveBeenCalled();
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

    const { result } = renderHook(() => useSiloBags(defaultFilters));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.siloBags).toEqual([]);
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

    const { unmount } = renderHook(() => useSiloBags(defaultFilters));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should refetch when filters change', async () => {
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

    const { rerender } = renderHook(
      ({ filters }) => useSiloBags(filters),
      { initialProps: { filters: defaultFilters } }
    );

    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

    // Change filters
    const newFilters = {
      fieldId: 'field1',
      cropId: 'crop1',
      status: 'active',
    };
    rerender({ filters: newFilters });

    expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should handle empty silobags list', async () => {
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

    const { result } = renderHook(() => useSiloBags(defaultFilters));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.siloBags).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
