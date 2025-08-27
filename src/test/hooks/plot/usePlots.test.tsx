import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlots } from '../../../shared/hooks/plot/usePlots';
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

describe('usePlots', () => {
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

    const { result } = renderHook(() => usePlots('field1'));

    expect(result.current.plots).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false and empty plots when fieldId is not provided', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'user1', organizationId: 'org1' },
      loading: false,
    });

    const { result } = renderHook(() => usePlots(''));

    expect(result.current.plots).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false and empty plots when user is null', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    const { result } = renderHook(() => usePlots('field1'));

    expect(result.current.plots).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch plots when user is authenticated and fieldId is provided', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockPlots = [
      {
        id: 'plot1',
        name: 'Lote A1',
        field: { id: 'field1', name: 'Campo Norte' },
        area: 25.5,
        crop: { id: 'crop1', name: 'Soja' },
      },
      {
        id: 'plot2',
        name: 'Lote A2',
        field: { id: 'field1', name: 'Campo Norte' },
        area: 30.0,
        crop: { id: 'crop2', name: 'Maíz' },
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
          docs: mockPlots.map(plot => ({
            id: plot.id,
            data: () => ({
              name: plot.name,
              field: plot.field,
              area: plot.area,
              crop: plot.crop,
            }),
          })),
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => usePlots('field1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.plots).toEqual([
      {
        id: 'plot1',
        name: 'Lote A1',
        field: { id: 'field1', name: 'Campo Norte' },
        area: 25.5,
        crop: { id: 'crop1', name: 'Soja' },
      },
      {
        id: 'plot2',
        name: 'Lote A2',
        field: { id: 'field1', name: 'Campo Norte' },
        area: 30.0,
        crop: { id: 'crop2', name: 'Maíz' },
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

    const { result } = renderHook(() => usePlots('field1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.plots).toEqual([]);
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

    const { unmount } = renderHook(() => usePlots('field1'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should refetch when fieldId changes', async () => {
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
      ({ fieldId }) => usePlots(fieldId),
      { initialProps: { fieldId: 'field1' } }
    );

    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

    // Change fieldId
    rerender({ fieldId: 'field2' });

    expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should handle empty plots list', async () => {
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

    const { result } = renderHook(() => usePlots('field1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.plots).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
