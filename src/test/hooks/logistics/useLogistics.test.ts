import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLogistics } from '../../../features/logistics/hooks/useLogistics';
import useAuth from '../../../shared/context/auth/AuthContext';
import { onSnapshot, Timestamp } from 'firebase/firestore';
import { createSecurityQuery } from '../../../shared/firebase/queryBuilder';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => ({ toDate: () => date })),
  },
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

// Mock date-fns
vi.mock('date-fns', () => ({
  startOfDay: vi.fn((date) => date),
  endOfDay: vi.fn((date) => date),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockOnSnapshot = onSnapshot as ReturnType<typeof vi.fn>;
const mockCreateSecurityQuery = createSecurityQuery as ReturnType<typeof vi.fn>;

describe('useLogistics', () => {
  const defaultDateRange = {
    from: new Date('2024-01-01'),
    to: new Date('2024-01-31'),
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

    const { result } = renderHook(() => useLogistics(defaultDateRange, 'all'));

    expect(result.current.logistics).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false when auth is not loading but user is null', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    const { result } = renderHook(() => useLogistics(defaultDateRange, 'all'));

    expect(result.current.logistics).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch logistics when user is authenticated', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockLogistics = [
      {
        id: 'logistics1',
        order: '001',
        field: { id: 'field1', name: 'Campo Norte' },
        crop: { id: 'crop1', name: 'Soja' },
        driver: 'Juan Pérez',
        company: 'Transportes SA',
        status: 'in-route-to-field',
        date: { toDate: () => new Date() },
      },
      {
        id: 'logistics2',
        order: '002',
        field: { id: 'field2', name: 'Campo Sur' },
        crop: { id: 'crop2', name: 'Maíz' },
        driver: 'María García',
        company: 'Logística SRL',
        status: 'in-field',
        date: { toDate: () => new Date() },
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
          docs: mockLogistics.map(logistics => ({
            id: logistics.id,
            data: () => ({
              order: logistics.order,
              field: logistics.field,
              crop: logistics.crop,
              driver: logistics.driver,
              company: logistics.company,
              status: logistics.status,
              date: logistics.date,
            }),
          })),
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useLogistics(defaultDateRange, 'all'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logistics).toEqual([
      {
        id: 'logistics1',
        order: '001',
        field: { id: 'field1', name: 'Campo Norte' },
        crop: { id: 'crop1', name: 'Soja' },
        driver: 'Juan Pérez',
        company: 'Transportes SA',
        status: 'in-route-to-field',
        date: { toDate: expect.any(Function) },
      },
      {
        id: 'logistics2',
        order: '002',
        field: { id: 'field2', name: 'Campo Sur' },
        crop: { id: 'crop2', name: 'Maíz' },
        driver: 'María García',
        company: 'Logística SRL',
        status: 'in-field',
        date: { toDate: expect.any(Function) },
      },
    ]);
    expect(result.current.error).toBeNull();
    expect(mockCreateSecurityQuery).toHaveBeenCalledWith(mockUser);
  });

  it('should apply date range filters', async () => {
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

    const dateRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31'),
    };

    renderHook(() => useLogistics(dateRange, 'all'));

    expect(mockOnSnapshot).toHaveBeenCalled();
    expect(Timestamp.fromDate).toHaveBeenCalledTimes(2);
  });

  it('should apply field filter when selectedField is not "all"', async () => {
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

    renderHook(() => useLogistics(defaultDateRange, 'field1'));

    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('should handle null date range', async () => {
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

    const nullDateRange = {
      from: null,
      to: null,
    };

    renderHook(() => useLogistics(nullDateRange, 'all'));

    expect(mockOnSnapshot).toHaveBeenCalled();
    expect(Timestamp.fromDate).not.toHaveBeenCalled();
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

    const { result } = renderHook(() => useLogistics(defaultDateRange, 'all'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logistics).toEqual([]);
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

    const { unmount } = renderHook(() => useLogistics(defaultDateRange, 'all'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should refetch when dateRange or selectedField changes', async () => {
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
      ({ dateRange, selectedField }) => useLogistics(dateRange, selectedField),
      { 
        initialProps: { 
          dateRange: defaultDateRange, 
          selectedField: 'all' 
        } 
      }
    );

    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

    // Change selectedField
    rerender({ 
      dateRange: defaultDateRange, 
      selectedField: 'field1' 
    });

    expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should handle empty logistics list', async () => {
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

    const { result } = renderHook(() => useLogistics(defaultDateRange, 'all'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logistics).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
